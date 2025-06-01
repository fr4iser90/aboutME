from typing import Optional, List
from datetime import datetime

class Asset:
    def __init__(
        self,
        id: str,
        name: str,
        path: str,
        parent_id: Optional[str],
        is_folder: bool,
        size: Optional[int],
        mime_type: Optional[str],
        created_at: datetime,
        updated_at: datetime,
        tags: Optional[List[str]] = None,
        used_in: Optional[dict] = None,
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