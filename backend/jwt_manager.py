# ---------------------------------------------------------
# JWT TOKEN MANAGER WITH TAMPERING DEFENSE
# ---------------------------------------------------------


import jwt
import threading
from datetime import datetime, timedelta
from config import Config


class JWTManager:

    def __init__(self):
        # Thread-safe set of revoked token JTIs (JWT IDs)
        self._blacklist = set()
        self._lock = threading.Lock()
        # Counter used to generate unique JTI values
        self._jti_counter = 0

    # ---------------------------------------------------------
    # TOKEN CREATION
    # ---------------------------------------------------------
    def create_token(self, device_id):
        
        with self._lock:
            self._jti_counter += 1
            jti = f"{device_id}_{self._jti_counter}_{datetime.utcnow().timestamp()}"

        payload = {
            "device_id": device_id,
            "exp": datetime.utcnow() + timedelta(minutes=Config.TOKEN_VALIDITY_MINUTES),
            "iat": datetime.utcnow(),
            "jti": jti
        }

        return jwt.encode(payload, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)

    # ---------------------------------------------------------
    # TOKEN VERIFICATION  (strict mode)
    # ---------------------------------------------------------
    def verify_token(self, token):
       
        try:
            decoded = jwt.decode(
                token,
                Config.JWT_SECRET,
                algorithms=[Config.JWT_ALGORITHM],
                options={
                    "require": ["device_id", "exp", "iat"],
                    "verify_exp": True,
                    "verify_iat": True,
                }
            )

            # --- Defense: Blacklist Check ---
            jti = decoded.get("jti")
            if jti and self.is_blacklisted(jti):
                return False, "Token has been revoked"

            return True, decoded

        except jwt.ExpiredSignatureError:
            return False, "Token expired"

        except jwt.InvalidAlgorithmError:
            return False, "Algorithm tampering detected"

        except jwt.MissingRequiredClaimError as e:
            return False, f"Missing required claim: {e}"

        except jwt.InvalidTokenError as e:
            return False, f"Invalid token: {e}"

    # ---------------------------------------------------------
    # TOKEN BLACKLISTING (revocation)
    # ---------------------------------------------------------
    def blacklist_token(self, jti):
        with self._lock:
            self._blacklist.add(jti)

    def is_blacklisted(self, jti):
        with self._lock:
            return jti in self._blacklist

    def get_blacklist_size(self):
        with self._lock:
            return len(self._blacklist)

    # ---------------------------------------------------------
    # TAMPER SIMULATION  (for demo / testing)
    # ---------------------------------------------------------
    def create_tampered_token(self, device_id):
        payload = {
            "device_id": device_id,
            "exp": datetime.utcnow() + timedelta(minutes=Config.TOKEN_VALIDITY_MINUTES),
            "iat": datetime.utcnow(),
            "jti": f"TAMPERED_{device_id}"
        }
        return jwt.encode(payload, "WRONG_SECRET_KEY", algorithm=Config.JWT_ALGORITHM)
