from typing import Optional
from pydantic import EmailStr # BaseModel removed
from .base import CamelCaseModel # Import CamelCaseModel


class SiteOwnerBase(CamelCaseModel): # Inherit from CamelCaseModel
    email: EmailStr
    # Add other common user fields if any, e.g., is_active, is_superuser
    # For now, keeping it as per original structure.
    # is_active: bool = True
    # is_superuser: bool = False


class SiteOwnerCreate(SiteOwnerBase): # Inherits from SiteOwnerBase -> CamelCaseModel
    password: str
    # email will be camelCased if received as email, or can be email
    # password will be camelCased if received as password, or can be password


class SiteOwnerUpdate(CamelCaseModel): # Inherit directly from CamelCaseModel for clarity if it has distinct fields
    # Or inherit from SiteOwnerBase if it truly extends it with optional fields.
    # Assuming it's more of a partial update model.
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    # is_active: Optional[bool] = None
    # is_superuser: Optional[bool] = None
    # Config class for from_attributes is inherited


class SiteOwner(SiteOwnerBase): # Inherits from SiteOwnerBase -> CamelCaseModel
    id: str # Will become id
    # email is inherited
    # is_active: bool
    # is_superuser: bool
    # created_at: datetime # If you add these, they will be camelCased
    # updated_at: datetime

    # Config class for from_attributes is inherited
