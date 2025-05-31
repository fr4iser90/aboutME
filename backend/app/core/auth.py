from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
import os
from app.infrastructure.database.session import get_db
from app.domain.models.user import SiteOwner # Updated import
from app.infrastructure.database.models.user import SiteOwnerModel # Updated import

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Security settings
SECRET_KEY = os.getenv("NEXTAUTH_SECRET")
if not SECRET_KEY:
    raise ValueError("NEXTAUTH_SECRET environment variable is not set!")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    logger.debug(f"Created access token for user: {data.get('sub')}")
    return encoded_jwt

async def cookie_extractor(request: Request) -> Optional[str]:
    logger.debug("Cookie extraction - All cookies:")
    for cookie in request.cookies:
        logger.debug(f"Cookie found: {cookie}")
    
    token = request.cookies.get("auth_token")
    logger.debug(f"Cookie extraction - Found auth_token: {bool(token)}")
    if token:
        logger.debug(f"Cookie extraction - Token value: {token[:10]}...")
    return token

async def get_current_user( # Function name can remain get_current_user for broader compatibility if preferred
    token: Optional[str] = Depends(cookie_extractor),
    db: Session = Depends(get_db)
) -> SiteOwner: # Updated return type
    logger.debug("Attempting to get current site owner") # Updated log
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
    )
    
    if token is None:
        logger.debug("No token found in cookie")
        raise credentials_exception
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            logger.debug("No email found in token payload")
            raise credentials_exception
        logger.debug(f"Found email in token: {email}")
    except JWTError as e:
        logger.debug(f"JWT decode error: {str(e)}")
        raise credentials_exception

    site_owner_db = db.query(SiteOwnerModel).filter(SiteOwnerModel.email == email).first() # Updated model and var name
    if site_owner_db is None:
        logger.debug(f"No site owner found for email: {email}") # Updated log
        raise credentials_exception
    
    logger.debug(f"Successfully authenticated site owner: {email}") # Updated log
    return SiteOwner( # Updated domain model instantiation
        id=site_owner_db.id,
        email=site_owner_db.email,
        hashed_password=site_owner_db.hashed_password,
        source_username=site_owner_db.source_username,
        created_at=site_owner_db.created_at,
        updated_at=site_owner_db.updated_at
    )

async def get_current_superuser(current_site_owner: SiteOwner = Depends(get_current_user)) -> SiteOwner: # Updated param and type hints
    # Since we're the only site owner, we're always a superuser
    return current_site_owner
