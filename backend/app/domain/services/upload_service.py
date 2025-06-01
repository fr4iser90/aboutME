from fastapi import UploadFile
from typing import Optional

class IUploadService:
    async def upload_file(self, file: UploadFile) -> dict:
        raise NotImplementedError

    async def delete_file(self, filename: str) -> bool:
        raise NotImplementedError

    def get_file_url(self, filename: str) -> Optional[str]:
        raise NotImplementedError 