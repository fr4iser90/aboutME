from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    is_superuser: bool = False


class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool
    is_superuser: bool

    class Config:
        from_attributes = True
