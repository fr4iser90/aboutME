from typing import Optional, Dict, Any
from pydantic import BaseModel


class ThemeBase(BaseModel):
    name: str
    description: Optional[str] = None
    style_properties: Dict[str, Any]
    custom_css: Optional[str] = None
    custom_js: Optional[str] = None
    is_active: bool = True
    is_default: bool = False


class ThemeCreate(ThemeBase):
    pass


class ThemeUpdate(ThemeBase):
    name: Optional[str] = None
    style_properties: Optional[Dict[str, Any]] = None


class Theme(ThemeBase):
    id: int

    class Config:
        from_attributes = True
