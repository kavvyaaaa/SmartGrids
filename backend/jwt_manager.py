# ---------------------------------------------------------
# JWT TOKEN MANAGER WITH TAMPERING DEFENSE
# ---------------------------------------------------------
# Provides token creation, strict verification, and a
# token blacklist to revoke compromised tokens.
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
        """
        Create a signed JWT for the given device.  Each token
        receives a unique 'jti' (JWT ID) claim so it can be
        individually revoked later if needed.
        """
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
        """
        Verify a JWT with multiple layers of defense:
          1. Signature verification (built-in via PyJWT).
          2. Expiry check (built-in via PyJWT).
          3. Algorithm restriction – only accept the configured
             algorithm to prevent 'none' algorithm attacks.
          4. Blacklist check – reject tokens that have been revoked.
          5. Required claims – ensure 'device_id', 'exp', 'iat'
             are present to block malformed tokens.
        """
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
        """Add a token's JTI to the blacklist so it cannot be reused."""
        with self._lock:
            self._blacklist.add(jti)

    def is_blacklisted(self, jti):
        """Check whether a JTI has been revoked."""
        with self._lock:
            return jti in self._blacklist

    def get_blacklist_size(self):
        """Return the number of currently blacklisted tokens."""
        with self._lock:
            return len(self._blacklist)

    # ---------------------------------------------------------
    # TAMPER SIMULATION  (for demo / testing)
    # ---------------------------------------------------------
    def create_tampered_token(self, device_id):
        """
        Create a token signed with the WRONG secret key so the
        backend can demonstrate that it rejects tampered JWTs.
        """
        payload = {
            "device_id": device_id,
            "exp": datetime.utcnow() + timedelta(minutes=Config.TOKEN_VALIDITY_MINUTES),
            "iat": datetime.utcnow(),
            "jti": f"TAMPERED_{device_id}"
        }
        return jwt.encode(payload, "WRONG_SECRET_KEY", algorithm=Config.JWT_ALGORITHM)