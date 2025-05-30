from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class ThemeBase(BaseModel):
    name: str
    description: Optional[str] = None
    style_properties: Dict[str, Any] = {}
    custom_css: Optional[str] = None
    custom_js: Optional[str] = None
    is_active: bool = True
    is_default: bool = False


class ThemeCreate(ThemeBase):
    pass


class ThemeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    style_properties: Optional[Dict[str, Any]] = None
    custom_css: Optional[str] = None
    custom_js: Optional[str] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None

    class Config:
        from_attributes = True


class Theme(ThemeBase):
    id: int

    class Config:
        from_attributes = True
