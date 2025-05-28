from passlib.context import CryptContext

# It's recommended to use a strong hashing algorithm like bcrypt.
# Passlib handles the salt generation and hashing process.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against a hashed password.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hashes a plain password.
    """
    return pwd_context.hash(password)


# You might also include functions for creating and verifying JWT tokens here
# if you plan to use token-based authentication for your API.
# For example:
# from datetime import datetime, timedelta, timezone
# from typing import Optional
# import jwt # PyJWT, ensure it's in requirements.txt
# from pydantic import BaseModel

# SECRET_KEY = "YOUR_VERY_SECRET_KEY_CHANGE_THIS" # Load from env var
# ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES = 30

# class TokenData(BaseModel):
#     username: Optional[str] = None

# def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
#     to_encode = data.copy()
#     if expires_delta:
#         expire = datetime.now(timezone.utc) + expires_delta
#     else:
#         expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     to_encode.update({"exp": expire})
#     encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
#     return encoded_jwt
