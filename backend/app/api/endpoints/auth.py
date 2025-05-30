from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
import logging
from app.core.auth import (
    verify_password,
    create_access_token,
    get_current_user,
)
from app.infrastructure.database.session import get_db
from app.domain.models.user import User
from app.infrastructure.database.models.user import UserModel
from app.schemas.auth import LoginRequest

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/login")
async def login(response: Response, login_data: LoginRequest, db: Session = Depends(get_db)):
    logger.debug(f"Login attempt for email: {login_data.email}")
    
    user = db.query(UserModel).filter(UserModel.email == login_data.email).first()
    if not user:
        logger.debug(f"No user found for email: {login_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not verify_password(login_data.password, user.hashed_password):
        logger.debug(f"Invalid password for user: {login_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    logger.debug(f"Creating access token for user: {login_data.email}")
    access_token = create_access_token(data={"sub": user.email})
    logger.debug(f"Created token: {access_token[:10]}...")

    logger.debug("Setting auth cookie with settings:")
    cookie_settings = {
        "key": "auth_token",
        "value": access_token,
        "httponly": True,
        "secure": False,
        "samesite": "lax",
        "path": "/",
        "domain": "localhost",
        "max_age": 1800
    }
    logger.debug(f"Cookie settings: {cookie_settings}")
    
    response.set_cookie(**cookie_settings)
    
    logger.debug(f"Login successful for user: {login_data.email}")
    return {
        "message": "Login successful",
        "user": {
            "email": user.email,
            "is_active": user.is_active
        }
    }

@router.post("/logout")
async def logout(response: Response):
    logger.debug("Logout request received")
    response.delete_cookie(
        key="auth_token",
        httponly=True,
        secure=False,  # In Entwicklung auf False
        samesite="lax",  # In Entwicklung auf "lax"
        path="/",
        domain="localhost"  # Cookie für localhost
    )
    logger.debug("Logout successful - cookie cleared")
    return {"message": "Logout successful"}

@router.get("/validate")
async def validate_auth(current_user: User = Depends(get_current_user)):
    """Validate the current authentication token."""
    logger.debug(f"Token validation requested for user: {current_user.email}")
    return {
        "valid": True,
        "user": {
            "email": current_user.email,
            "is_active": current_user.is_active
        }
    }
