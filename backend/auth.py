from passlib.context import CryptContext
from jose import jwt
import hashlib

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# =========================
# PASSWORD HASHING
# =========================

def hash_password(password: str) -> str:
    """
    Secure password hashing:
    1. Normalize password using SHA-256
    2. Hash using bcrypt
    """
    sha_password = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return pwd_context.hash(sha_password)


def verify_password(password: str, hashed: str) -> bool:
    sha_password = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return pwd_context.verify(sha_password, hashed)


# =========================
# JWT TOKEN
# =========================

def create_token(user):
    payload = {
        "sub": user.email,
        "role": user.role
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
