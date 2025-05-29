from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response # Added Response
from sqlalchemy.orm import Session
from app.core.auth import (
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user, # This import seems unused in this file currently
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import Token, LoginRequest

router = APIRouter()


@router.post("/login") # Removed response_model=Token as we now control the response directly for cookie setting
async def login(response: Response, login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    response.set_cookie(
        key="auth_token",
        value=access_token, # Storing the JWT directly in the cookie
        httponly=True,
        secure=True,  # Assuming HTTPS in production
        samesite="lax",
        path="/",
        max_age=int(ACCESS_TOKEN_EXPIRE_MINUTES * 60) if ACCESS_TOKEN_EXPIRE_MINUTES else None,
    )
    # Optionally, you can still return the token or user info in the body
    # For now, returning a simple success message.
    # If the frontend needs the token for non-HttpOnly purposes, it can be returned here.
    # However, relying solely on the HttpOnly cookie is more secure.
    return {"message": "Login successful"}


@router.post("/logout")
async def logout(response: Response):
    response.set_cookie(
        key="auth_token",
        value="",  # Clear the value
        httponly=True,
        secure=True,  # Ensure these match the settings during login
        samesite="lax",
        path="/",
        max_age=0  # Expire the cookie immediately
    )
    return {"message": "Logout successful"}
