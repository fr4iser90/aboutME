from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
import logging
from app.core.auth import (
    verify_password,
    create_access_token,
    get_current_user,
)
from app.infrastructure.database.session import get_db
from app.domain.models.user import SiteOwner # Updated import
from app.infrastructure.database.models.user import SiteOwnerModel # Updated import
from app.schemas.auth import LoginRequest

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/login")
async def login(response: Response, login_data: LoginRequest, db: Session = Depends(get_db)):
    logger.debug(f"Login attempt for email: {login_data.email}")
    
    site_owner_db = db.query(SiteOwnerModel).filter(SiteOwnerModel.email == login_data.email).first() # Updated model and var name
    if not site_owner_db:
        logger.debug(f"No site owner found for email: {login_data.email}") # Updated message
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not verify_password(login_data.password, site_owner_db.hashed_password): # Updated var name
        logger.debug(f"Invalid password for site owner: {login_data.email}") # Updated message
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    logger.debug(f"Creating access token for site owner: {login_data.email}") # Updated message
    access_token = create_access_token(data={"sub": site_owner_db.email}) # Updated var name
    logger.debug(f"Created token: {access_token[:10]}...")

    logger.debug("Setting auth cookie with settings:")
    # Define parameters for setting the cookie, omitting the domain
    cookie_params = {
        "key": "auth_token",
        "value": access_token,
        "httponly": True,
        "secure": False,  # Should be True in production over HTTPS
        "samesite": "lax",
        "path": "/",
        "max_age": 1800  # 30 minutes
    }
    logger.debug(f"Setting cookie with params: {cookie_params}")
    response.set_cookie(**cookie_params)
    
    logger.debug(f"Login successful for site owner: {login_data.email}") # Updated message
    return {
        "message": "Login successful",
        "user": { # Consider renaming this key to site_owner for consistency if frontend expects it
            "email": site_owner_db.email # Updated var name
        }
    }

@router.post("/logout")
async def logout(response: Response):
    logger.debug("Logout request received")
    # Define parameters for deleting the cookie, omitting the domain
    response.delete_cookie(
        key="auth_token",
        httponly=True,
        secure=False, # Match settings from set_cookie
        samesite="lax", # Match settings from set_cookie
        path="/"
    )
    logger.debug("Logout successful - cookie cleared (domain omitted)")
    return {"message": "Logout successful"}

@router.get("/validate")
async def validate_auth(current_site_owner: SiteOwner = Depends(get_current_user)): # Updated param name and type
    """Validate the current authentication token."""
    logger.debug(f"Token validation requested for site owner: {current_site_owner.email}") # Updated message and var name
    return {
        "valid": True,
        "user": { # Consider renaming this key to site_owner for consistency
            "email": current_site_owner.email # Updated var name
        }
    }
