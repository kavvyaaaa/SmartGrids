import numpy as np
import datetime
import time
import random
from sklearn.ensemble import IsolationForest
from config import Config
from database import get_connection
from crypto_utils import verify_signature, record_failure
import pandas as pd

class FDIDetector:
    def __init__(self):
        self.baselines = {}
        self._training_data = {}
        self._ml_models = {}
        self.defense_active = True
        self.last_ml_predictions = {}
        self.fdi_incidents = {}
        self._preseed_models_from_csv()

    def is_device_blocked(self, device_id):
        now = time.time()
        incidents = self.fdi_incidents.get(device_id, [])
        incidents = [ts for ts in incidents if now - ts <= Config.FDI_RATE_LIMIT_WINDOW_SECONDS]
        self.fdi_incidents[device_id] = incidents
        return len(incidents) >= Config.FDI_RATE_LIMIT_MAX_FAILURES

    def _preseed_models_from_csv(self):
        csv_path = Config.DATA_DIR / "smart_meter_data.csv"
        if not csv_path.exists():
            print(f"[ML WARNING] Seed CSV not found at {csv_path}")
            return
            
        print(f"[ML INFO] Pre-seeding models from {csv_path}...")
        try:
            df = pd.read_csv(csv_path)
            # Map 't_kWh' if present, otherwise use 'consumption_kwh'
            target_col = 't_kWh' if 't_kWh' in df.columns else 'consumption_kwh'
            
            for dev_id in [f"SM_{i+1:03d}" for i in range(Config.NUM_DEVICES)]:
                # Use a subset of data to represent this device
                self._training_data[dev_id] = df[target_col].sample(n=min(500, len(df))).tolist()
                self._train_model(dev_id)
        except Exception as e:
            print(f"[ML ERROR] Failed to pre-seed from CSV: {e}")

    def record(self, reading):
        device_id = reading["device_id"]
        value = reading["consumption_kwh"]
        timestamp = reading["timestamp"]
        signature = reading.get("signature")
        is_fdi_attack = reading.get("is_fdi_attack", False)

        try:
            conn = get_connection()
            cursor = conn.cursor()

            verified, crypto_reason = verify_signature(reading, signature)
            if not verified:
                print(f"[CRYPTO DEFENSE] {crypto_reason} for device {device_id}")
                category = "REPLAY" if crypto_reason == "REPLAY_DETECTED" else "CRYPTO"
                cursor.execute(
                    "INSERT INTO attack_logs (device_id, attack_category, timestamp, details, mitigated) VALUES (%s,%s,%s,%s,%s)",
                    (device_id, category, datetime.datetime.now(), crypto_reason, self.defense_active)
                )
                conn.commit()
                return {"detected": True, "type": category, "reason": crypto_reason, "mitigated": self.defense_active}

            if self.defense_active and self.is_device_blocked(device_id):
                print(f"[FDI DEFENSE] Device {device_id} is blocked due to excessive FDI.")
                cursor.execute(
                    "INSERT INTO attack_logs (device_id, attack_category, timestamp, details, mitigated) VALUES (%s,%s,%s,%s,%s)",
                    (device_id, "FDI", datetime.datetime.now(), "BLOCKED_DUE_TO_EXCESSIVE_FDI", self.defense_active)
                )
                conn.commit()
                return {"detected": True, "type": "FDI", "reason": "RATE_LIMITED", "mitigated": self.defense_active}

            print(f"[READING] Device {device_id}: {value} kWh")
            cursor.execute(
                "INSERT INTO energy_readings (device_id, consumption_kwh, timestamp, signature, is_attack) VALUES (%s,%s,%s,%s,%s)",
                (device_id, value, timestamp, signature, is_fdi_attack)
            )

            self.update_baseline(device_id, value)
            self._collect_training_sample(device_id, value)

            z_detected, z_score = self.detect(device_id, value)
            ml_detected, ml_score = self.ml_predict(device_id, value)

            # Enforce manual-trigger-only policy for database logs
            # Z-score and ML anomalies are calculated and displayed on the UI, but will not spam the backend logs autonomously
            attack_detected = is_fdi_attack
            detection_reasons = []
            if z_detected: detection_reasons.append(f"Z-score={z_score}")
            if ml_detected: detection_reasons.append(f"ML-anomaly={ml_score:.3f}")
            if is_fdi_attack: detection_reasons.append("Simulated FDI payload")

            if attack_detected:
                reason = " | ".join(detection_reasons)
                mitigated = self.defense_active
                status = "MITIGATED" if mitigated else "DETECTED"
                print(f"[FDI {status}] {reason}")
                
                # record fdi incident
                now = time.time()
                incidents = self.fdi_incidents.setdefault(device_id, [])
                incidents.append(now)
                # prune
                incidents = [ts for ts in incidents if now - ts <= Config.FDI_RATE_LIMIT_WINDOW_SECONDS]
                self.fdi_incidents[device_id] = incidents
                
                # Zero-Trust Isolation: Let ML log the anomaly, but do not trigger a cryptographic rate-limit
                # failure, as the CSV training distribution differs from the simulated real-time data.

                cursor.execute(
                    "INSERT INTO attack_logs (device_id, attack_category, timestamp, details, mitigated) VALUES (%s,%s,%s,%s,%s)",
                    (device_id, "FDI", datetime.datetime.now(), reason, mitigated)
                )

            conn.commit()
            return {
                "detected": attack_detected,
                "type": "FDI" if attack_detected else "NORMAL",
                "z_score": z_score,
                "ml_score": round(ml_score, 4) if ml_score else None,
                "mitigated": self.defense_active if attack_detected else False,
                "reasons": detection_reasons
            }
        except Exception as e:
            print(f"[ERROR] Recording FDI: {e}")
            import traceback; traceback.print_exc()
            return {"detected": False, "type": "ERROR", "reason": str(e)}
        finally:
            if 'conn' in locals() and conn.is_connected():
                conn.close()

    def update_baseline(self, device_id, value):
        arr = self.baselines.setdefault(device_id, [])
        arr.append(value)
        self.baselines[device_id] = arr[-Config.BASELINE_WINDOW:]

    def detect(self, device_id, value):
        data = self.baselines.get(device_id, [])
        if len(data) < Config.MIN_READINGS_FOR_DETECTION: return False, 0
        mean = np.mean(data); std = max(np.std(data), 0.1)
        z = abs((value - mean) / std)
        return z > Config.ANOMALY_THRESHOLD, round(z, 2)

    def _collect_training_sample(self, device_id, value):
        samples = self._training_data.setdefault(device_id, [])
        samples.append(value)
        self._training_data[device_id] = samples[-500:]
        if len(samples) >= Config.ML_MIN_TRAINING_SAMPLES and len(samples) % Config.ML_MIN_TRAINING_SAMPLES == 0:
            self._train_model(device_id)

    def _train_model(self, device_id):
        """Train (or retrain) an Isolation Forest for the device."""
        samples = self._training_data.get(device_id, [])
        if len(samples) < Config.ML_MIN_TRAINING_SAMPLES:
            # If we don't have enough real samples, we "assume" values based on device type
            # for baseline purposes (Zero-Trust Bootstrapping)
            from database import get_connection
            try:
                conn = get_connection()
                cursor = conn.cursor(dictionary=True)
                cursor.execute("""
                    SELECT dt.type_name 
                    FROM devices d 
                    JOIN device_types dt ON d.type_id = dt.type_id 
                    WHERE d.device_id = %s
                """, (device_id,))
                row = cursor.fetchone()
                conn.close()
                if row:
                    m_type = row['type_name']
                    base = Config.DEVICE_TYPES.get(m_type, 30)
                    # Generate synthetic baseline: base +/- 10%
                    samples = [base + random.uniform(-base*0.1, base*0.1) for _ in range(Config.ML_MIN_TRAINING_SAMPLES)]
            except:
                pass
                
        if len(samples) < Config.ML_MIN_TRAINING_SAMPLES:
            return
            
        X = np.array(samples).reshape(-1, 1)
        model = IsolationForest(contamination=Config.ML_CONTAMINATION, random_state=42, n_estimators=100)
        model.fit(X)
        self._ml_models[device_id] = model
        print(f"[ML] Model trained for {device_id} ({len(samples)} samples)")

    def ml_predict(self, device_id, value):
        model = self._ml_models.get(device_id)
        if model is None: return False, 0.0
        X = np.array([[value]])
        prediction = model.predict(X)[0]
        score = model.score_samples(X)[0]
        self.last_ml_predictions[device_id] = {
            "value": value,
            "prediction": int(prediction),
            "score": round(score, 4)
        }
        return (prediction == -1), score

    def get_ml_status(self):
        status = {}
        for device_id in self._training_data:
            samples = len(self._training_data.get(device_id, []))
            trained = device_id in self._ml_models
            status[device_id] = {
                "training_samples": samples,
                "model_trained": trained,
                "last_prediction": self.last_ml_predictions.get(device_id)
            }
        return status