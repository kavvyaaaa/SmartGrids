import random
from datetime import datetime, timedelta
from crypto_utils import generate_signature


class AttackSimulator:
    """
    Simulates various attack vectors against the Smart Grid
    for demonstration and testing purposes.
    """

    def __init__(self, devices):
        self.devices = devices

    def trigger_fdi_attack(self):
        """Simulate a False Data Injection attack with a valid signature
        but absurdly high consumption values."""
        device = random.choice(self.devices.get_all_devices())
        reading = device.get_reading(True)
        reading["signature"] = generate_signature(reading)
        return reading

    def tamper_signature(self):
        """Simulate an attacker sending a reading with a forged/corrupt
        cryptographic signature."""
        device = random.choice(self.devices.get_all_devices())
        reading = device.get_reading(False)
        reading["signature"] = "TAMPERED_SIGNATURE"
        return reading

    def trigger_replay_attack(self):
        """Simulate a replay attack by re-sending an old reading with an
        outdated timestamp (older than the replay window)."""
        device = random.choice(self.devices.get_all_devices())
        reading = device.get_reading(False)
        # Backdate the timestamp by 5 minutes to exceed the replay window
        reading["timestamp"] = datetime.now() - timedelta(minutes=5)
        reading["signature"] = generate_signature(reading)
        return reading

    def trigger_jwt_tamper(self, jwt_manager):
        """Simulate a JWT token tampering attack by creating a token
        signed with the wrong secret key."""
        device = random.choice(self.devices.get_all_devices())
        tampered_token = jwt_manager.create_tampered_token(device.device_id)
        return {
            "device_id": device.device_id,
            "tampered_token": tampered_token,
            "timestamp": datetime.now()
        }