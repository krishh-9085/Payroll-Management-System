from passlib.context import CryptContext
from jose import jwt
import hashlib

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

# ✅ Use Argon2 instead of bcrypt
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

# =========================
# PASSWORD HASHING
# =========================

def hash_password(password: str) -> str:
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
