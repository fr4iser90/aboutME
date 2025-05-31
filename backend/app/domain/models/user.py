from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class SiteOwner(BaseModel):
    id: str
    email: str
    hashed_password: str
    source_username: Optional[str] = None
    created_at: datetime
    updated_at: datetime
