from datetime import datetime, timedelta
from database import get_connection
from config import Config
from jwt_manager import JWTManager


class AuthManager:
    def __init__(self):
        self.jwt_manager = JWTManager()

    def authenticate(self, device_id):
      
        try:
            token = self.jwt_manager.create_token(device_id)

            conn = get_connection()
            cursor = conn.cursor()

            issued = datetime.utcnow()
            expires = issued + timedelta(minutes=Config.TOKEN_VALIDITY_MINUTES)

            cursor.execute(
                """
                INSERT INTO authentication_events
                (device_id, token, issued_at, expires_at)
                VALUES (%s,%s,%s,%s)
                """,
                (device_id, token, issued, expires)
            )

            conn.commit()
            print(f"JWT issued for device: {device_id}")
            return token
        except Exception as e:
            print(f"Error authenticating device {device_id}: {e}")
            return None
        finally:
            if 'conn' in locals() and conn.is_connected():
                conn.close()
