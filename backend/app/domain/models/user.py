from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class User(BaseModel):
    id: str
    email: str
    hashed_password: str
    github_username: Optional[str] = None
    created_at: datetime
    updated_at: datetime 