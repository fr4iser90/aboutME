from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class User(BaseModel):
    id: str
    email: str
    hashed_password: str
    is_active: bool = True
    github_username: Optional[str] = None 