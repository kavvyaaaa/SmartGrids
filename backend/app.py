from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import time
import random
from datetime import datetime
import json
import logging
import traceback
import numpy as np
from flask_sock import Sock

from config import Config
from device_simulator import DeviceManager
from fdi_detector import FDIDetector
from auth_manager import AuthManager
from attack_simulator import AttackSimulator
from crypto_utils import generate_signature, get_failure_count, is_device_rate_limited
from database import init_db, get_connection
from jwt_manager import JWTManager

# Initialize Database
init_db()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
sock = Sock(app)

devices = DeviceManager()
detector = FDIDetector()
auth = AuthManager()
attack_sim = AttackSimulator(devices)
jwt_mgr = JWTManager()

logging.basicConfig(level=logging.DEBUG)

@app.before_request
def log_request_info():
    if not request.path.startswith('/static'):
        print(f"[DEBUG] Request: {request.method} {request.path}")

@app.errorhandler(Exception)
def handle_exception(e):
    print(f"[UNCAUGHT ERROR] {e}")
    traceback.print_exc()
    return jsonify({"error": str(e), "type": "INTERNAL_SERVER_ERROR"}), 500

def safe_json(data):
    """Helper to ensure numpy types and datetime objects are strings/primitives before jsonify."""
    if isinstance(data, dict):
        return {k: safe_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [safe_json(x) for x in data]
    elif hasattr(data, 'isoformat'):
        return data.isoformat()
    elif isinstance(data, (np.bool_, bool)):
        return bool(data)
    elif isinstance(data, (np.integer, int)):
        return int(data)
    elif isinstance(data, (np.floating, float)):
        return float(data)
    return data

ws_clients = set()

@sock.route('/ws')
def ws(ws_client):
    ws_clients.add(ws_client)
    try:
        while True:
            ws_client.receive()
    except:
        pass
    finally:
        if ws_client in ws_clients:
            ws_clients.remove(ws_client)

def broadcast(msg):
    msg_str = json.dumps(msg, default=str)
    dead_clients = []
    for client in list(ws_clients):
        try:
            client.send(msg_str)
        except:
            dead_clients.append(client)
    for c in dead_clients:
        if c in ws_clients:
            ws_clients.remove(c)

def simulate():
    last_attack_time = time.time()
    # Create a persistent session for simulating REST traffic
    import requests
    
    while True:
        for d in devices.get_all_devices():
            if is_device_rate_limited(d.device_id) or detector.is_device_blocked(d.device_id):
                continue
            if not d.token:
                d.token = auth.authenticate(d.device_id)
            
            is_fdi = False
            reading = d.get_reading(is_fdi)
            reading["signature"] = generate_signature(reading)
            
            # Simulate REST transmission: REST API -> Backend
            try:
                # We use a local post call to the internal app handler to ensure zero-latency 
                # but following the REST logic structure.
                with app.test_request_context(path='/api/meter-reading', method='POST', json=reading):
                    receive_reading()
            except Exception as e:
                print(f"[SIM ERROR] Failed to transmit reading: {e}")
            
        time.sleep(Config.READING_INTERVAL)

threading.Thread(target=simulate, daemon=True).start()

@app.route("/api/devices")
def get_devices():
    from crypto_utils import is_device_rate_limited
    devices_data = []
    # Sort devices sequentially (SM_001 to SM_007)
    all_devices = sorted(devices.get_all_devices(), key=lambda x: x.device_id)
    
    for d in all_devices:
        devices_data.append({
            "device_id": d.device_id,
            "device_name": d.name,
            "device_type": d.device_type,
            "is_blocked": is_device_rate_limited(d.device_id) or detector.is_device_blocked(d.device_id)
        })
    return jsonify(safe_json(devices_data))

@app.route("/api/health")
def health():
    db_status = "disconnected"
    try:
        conn = get_connection()
        if conn.is_connected():
            db_status = "connected"
        conn.close()
    except:
        pass
    return jsonify(safe_json({
        "status": "running",
        "database": db_status,
        "defense_active": detector.defense_active
    }))

@app.route("/api/meter-reading", methods=["POST"])
def receive_reading():
    """
    Main REST API Entry point for Smart Meters.
    Architecture: Smart Meter → REST API → Backend → DB + ML
    """
    try:
        reading = request.json
        if not reading:
            return jsonify({"error": "No data provided"}), 400
            
        # Verify signature and record results
        result = detector.record(reading)
        
        # Real-time update to front-end
        broadcast({
            "type": "reading",
            "device_id": reading.get("device_id"),
            "reading": reading,
            "defense_result": result
        })
        
        return jsonify(safe_json({
            "status": "success",
            "defense_result": result
        })), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/trigger-fdi-attack")
def trigger_fdi():
    try:
        reading = attack_sim.trigger_fdi_attack()
        # Direct recording to ensure consistent state and broadcast
        result = detector.record(reading)
        
        # Immediate broadcast for the simulation trigger
        broadcast({
            "type": "reading",
            "device_id": reading.get("device_id"),
            "reading": reading,
            "defense_result": result
        })

        return jsonify(safe_json({
            **reading,
            "defense_result": result,
            "timestamp": reading["timestamp"]
        }))
    except Exception as e:
        return jsonify(safe_json({"error": str(e), "defense_result": {"detected": False, "type": "ERROR"}})), 500

@app.route("/api/tamper-signature")
def tamper_sig():
    try:
        reading = attack_sim.tamper_signature()
        result = detector.record(reading)
        
        broadcast({
            "type": "reading",
            "device_id": reading.get("device_id"),
            "reading": reading,
            "defense_result": result
        })

        return jsonify(safe_json({
            **reading,
            "defense_result": result,
            "timestamp": reading["timestamp"]
        }))
    except Exception as e:
        return jsonify({"error": str(e), "defense_result": {"detected": False, "type": "ERROR"}}), 500

@app.route("/api/trigger-replay-attack")
def trigger_replay():
    num_attacks = 1 if detector.defense_active else 10
    first_reading = None
    first_result = None
    conn = None
    try:
        if not detector.defense_active:
            conn = get_connection()
            cursor = conn.cursor()
        for i in range(num_attacks):
            reading = attack_sim.trigger_replay_attack()
            if not detector.defense_active:
                cursor.execute(
                    "INSERT INTO energy_readings (device_id, consumption_kwh, timestamp, signature, is_attack) VALUES (%s,%s,%s,%s,%s)",
                    (reading['device_id'], reading['consumption_kwh'], datetime.now(), reading['signature'], False)
                )
                result = {"detected": False, "type": "NORMAL", "mitigated": False, "reason": "Bypassed detection"}
            else:
                result = detector.record(reading)
            if i == 0:
                first_reading = reading
                first_result = result
        if conn:
            conn.commit()
    except Exception as e:
        print(f"[REPLAY ERR] {e}")
        first_result = {"detected": False, "type": "ERROR", "reason": str(e)}
    finally:
        if conn and conn.is_connected():
            conn.close()

    if first_reading:
        broadcast({
            "type": "reading",
            "device_id": first_reading.get("device_id"),
            "reading": first_reading,
            "defense_result": first_result
        })

    return jsonify(safe_json({
        **(first_reading or {}),
        "defense_result": first_result,
        "timestamp": datetime.now()
    }))

@app.route("/api/trigger-jwt-tamper")
def trigger_jwt_tamper():
    try:
        attack_data = attack_sim.trigger_jwt_tamper(jwt_mgr)
        device_id = attack_data["device_id"]
        tampered_token = attack_data["tampered_token"]
        is_valid, reason = jwt_mgr.verify_token(tampered_token)
        
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO attack_logs (device_id, attack_category, timestamp, details, mitigated) VALUES (%s, %s, %s, %s, %s)",
            (device_id, "JWT", datetime.now(), f"JWT TAMPER result: {'BLOCKED' if not is_valid else 'FAILED'}", not is_valid)
        )
        conn.commit()
        conn.close()

        broadcast({
            "type": "jwt_alert",
            "device_id": device_id,
            "details": f"JWT Signature Hijack attempted on {device_id}",
            "mitigated": not is_valid
        })

        return jsonify(safe_json({
            "device_id": device_id,
            "attack_type": "JWT_SIGNATURE_TAMPER",
            "token_snippet": tampered_token[:30] + "...",
            "verification_passed": is_valid,
            "defense_result": {"detected": not is_valid, "type": "JWT", "reason": reason, "mitigated": not is_valid},
            "timestamp": datetime.now()
        }))
    except Exception as e:
        return jsonify(safe_json({"error": str(e), "defense_result": {"detected": False, "type": "ERROR"}})), 500

@app.route("/api/toggle-defense")
def toggle_defense():
    detector.defense_active = not detector.defense_active
    return jsonify({"defense_active": detector.defense_active})

@app.route("/api/fdi-alerts")
def get_fdi_alerts():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        # Unified query showing BOTH recent readings and detected security events
        # Note: Using aggressive casting to solve complex collation issues in UNION
        query = """
            SELECT CAST(id AS CHAR) as id, CAST(device_id AS CHAR) as device_id, 
                   CAST('READING' AS CHAR) as type, 
                   CAST(CONCAT('Power: ', consumption_kwh, ' kWh') AS CHAR) as detail, 
                   timestamp, 0 as mitigated 
            FROM energy_readings 
            WHERE is_attack = 0
            UNION ALL
            SELECT CAST(id AS CHAR) as id, CAST(device_id AS CHAR) as device_id, 
                   CAST(attack_category AS CHAR) as type, 
                   CAST(details AS CHAR) as detail, 
                   timestamp, mitigated 
            FROM attack_logs
            ORDER BY timestamp DESC LIMIT 50
        """
        cursor.execute(query)
        events = cursor.fetchall()
        return jsonify(safe_json(events))
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@app.route("/api/security-dashboard")
def get_security_dashboard():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        def fetch_count(q):
            cursor.execute(q); r = cursor.fetchone()
            return r['COUNT(*)'] if r else 0
        
        total_devices = fetch_count("SELECT COUNT(*) FROM devices")
        fdi_count = fetch_count("SELECT COUNT(*) FROM attack_logs WHERE attack_category='FDI'")
        crypto_count = fetch_count("SELECT COUNT(*) FROM attack_logs WHERE attack_category='CRYPTO'")
        jwt_count = fetch_count("SELECT COUNT(*) FROM attack_logs WHERE attack_category='JWT'")
        mitigated_count = fetch_count("SELECT COUNT(*) FROM attack_logs WHERE attack_category='FDI' AND mitigated = 1")
        crypto_mitigated = fetch_count("SELECT COUNT(*) FROM attack_logs WHERE attack_category='CRYPTO' AND mitigated = 1")
        
        recent = fetch_count("SELECT COUNT(*) FROM attack_logs WHERE timestamp >= NOW() - INTERVAL 15 SECOND")
        
        return jsonify(safe_json({
            "total_devices": total_devices,
            "fdi_attacks_detected": fdi_count,
            "crypto_failures": crypto_count,
            "jwt_attacks": jwt_count,
            "fdi_mitigated": mitigated_count,
            "crypto_mitigated": crypto_mitigated,
            "status": "Under Attack" if recent > 0 else "Secure",
            "defense_active": detector.defense_active
        }))
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@app.route("/api/ml-status")
def get_ml_status():
    return jsonify(safe_json(detector.get_ml_status()))

if __name__ == "__main__":
    app.run(host=Config.HOST, port=Config.PORT, debug=True)