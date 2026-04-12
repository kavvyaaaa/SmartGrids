import random
from datetime import datetime
import numpy as np

from config import Config
from database import get_connection


class SmartMeter:

    def __init__(self, device_id, name, device_type):

        self.device_id = device_id
        self.name = name
        self.device_type = device_type
        self.base_consumption = Config.DEVICE_TYPES[device_type]

        self.token = None # Authentication token

    def generate_normal_consumption(self):
        multiplier = random.uniform(0.8, 1.2)
        noise = np.random.normal(0, 2)
        return round(self.base_consumption * multiplier + noise, 2)

    def generate_fdi_attack(self):
        m1, m2 = Config.FDI_MULTIPLIER_RANGE

        return round(self.base_consumption * random.uniform(m1, m2), 2)

    def get_reading(self, attack=False):

        value = (
            self.generate_fdi_attack()
            if attack
            else self.generate_normal_consumption()
        )

        return {
            "device_id": self.device_id,
            "consumption_kwh": value,
            "timestamp": datetime.now().isoformat(),
            "is_fdi_attack": attack
        }


class DeviceManager:

    def __init__(self):

        self.devices = []
        self.init_devices()

    def init_devices(self):
        try:
            conn = get_connection()
            cursor = conn.cursor(dictionary=True)

            # Get type mappings from DB
            cursor.execute("SELECT type_id, type_name FROM device_types")
            type_rows = cursor.fetchall()
            type_map = {row['type_name']: row['type_id'] for row in type_rows}

            # Pre-defined distribution logic for 7 devices:
            # 3 Residential (SM_001-003), 2 Commercial (SM_004-005), 2 Industrial (SM_006-007)
            distribution = [
                "Residential", "Residential", "Residential",
                "Commercial", "Commercial",
                "Industrial", "Industrial"
            ]

            # Enforce exactly 7 devices: delete any that aren't SM_001-SM_007
            all_ids = [f"SM_{i+1:03d}" for i in range(len(distribution))]
            placeholders = ', '.join(['%s'] * len(all_ids))
            cursor.execute(f"DELETE FROM devices WHERE device_id NOT IN ({placeholders})", tuple(all_ids))

            for idx, device_type in enumerate(distribution):
                device_id = f"SM_{idx+1:03d}"
                type_id = type_map.get(device_type, 1)
                device_name = f"{device_type}_Meter_{idx+1}"

                device = SmartMeter(device_id, device_name, device_type)
                self.devices.append(device)

                # UPSERT logic: Insert if new, Update if type mismatch (Zero-Trust Sync)
                cursor.execute(
                    """
                    INSERT INTO devices (device_id, device_name, type_id)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE type_id = VALUES(type_id), device_name = VALUES(device_name)
                    """,
                    (device.device_id, device.name, type_id)
                )

            conn.commit()
        except Exception as e:
            print(f"Error initializing devices: {e}")
        finally:
            if 'conn' in locals() and conn.is_connected():
                conn.close()

    def get_all_devices(self):
        return self.devices