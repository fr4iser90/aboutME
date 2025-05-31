from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: str | None = None


class SiteOwnerLogin(BaseModel): # Renamed
    email: EmailStr
    password: str


# This SiteOwnerCreate might be redundant if schemas.user.SiteOwnerCreate is sufficient.
# If kept, it should be consistent. For now, renaming.
class SiteOwnerAuthCreate(BaseModel): # Renamed to avoid conflict if schemas.user.SiteOwnerCreate is imported
    email: EmailStr
    password: str


class SiteOwnerResponse(BaseModel): # Renamed
    id: str # Changed from int to str to match SiteOwner model
    email: str

    class Config:
        from_attributes = True
