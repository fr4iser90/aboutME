from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field, validator

class FileBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    path: Optional[str] = Field(None, min_length=1)
    parent_id: Optional[UUID] = None
    is_folder: bool = False
    size: Optional[int] = Field(None, ge=0)
    mime_type: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    used_in: Dict[str, str] = Field(default_factory=dict)

    @validator('path')
    def validate_path(cls, v, values):
        if not values.get('is_folder') and not v:
            raise ValueError('path is required for files')
        return v

    @validator('mime_type')
    def validate_mime_type(cls, v, values):
        if not values.get('is_folder') and not v:
            raise ValueError('mime_type is required for files')
        return v

    @validator('size')
    def validate_size(cls, v, values):
        if not values.get('is_folder') and v is None:
            raise ValueError('size is required for files')
        return v

class FileCreate(FileBase):
    pass

class FileUpdate(FileBase):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    path: Optional[str] = Field(None, min_length=1)
    is_folder: Optional[bool] = None
    size: Optional[int] = Field(None, ge=0)
    mime_type: Optional[str] = None

class FileRead(FileBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 