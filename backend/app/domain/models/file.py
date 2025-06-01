from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

class File:
    def __init__(
        self,
        name: str,
        path: str,
        id: Optional[UUID] = None,
        parent_id: Optional[UUID] = None,
        is_folder: bool = False,
        size: Optional[int] = None,
        mime_type: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        tags: Optional[List[str]] = None,
        used_in: Optional[Dict[str, str]] = None
    ):
        self.id = id
        self.name = name
        self.path = path
        self.parent_id = parent_id
        self.is_folder = is_folder
        self.size = size
        self.mime_type = mime_type
        self.created_at = created_at
        self.updated_at = updated_at
        self.tags = tags or []
        self.used_in = used_in or {} 