from passlib.context import CryptContext
from jose import jwt

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    # bcrypt hard limit = 72 bytes
    safe_password = password[:72]
    return pwd_context.hash(safe_password)

def verify_password(password: str, hashed: str):
    safe_password = password[:72]
    return pwd_context.verify(safe_password, hashed)

def create_token(user):
    payload = {
        "sub": user.email,
        "role": user.role
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
