import os
import shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException
from datetime import datetime
from typing import Optional
from app.domain.services.upload_service import IUploadService

class LocalUploadService(IUploadService):
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = Path(upload_dir)
        self.allowed_image_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
        self.allowed_video_types = {"video/mp4", "video/webm", "video/ogg"}
        self.allowed_doc_types = {"application/pdf", "application/msword", \
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
        self.max_file_size = 10 * 1024 * 1024  # 10MB

    def _ensure_upload_dir(self):
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def _get_file_extension(self, filename: str) -> str:
        return Path(filename).suffix.lower()

    def _generate_unique_filename(self, original_filename: str) -> str:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        extension = self._get_file_extension(original_filename)
        return f"{timestamp}_{original_filename}"

    def _validate_file(self, file: UploadFile) -> None:
        if file.content_type not in self.allowed_image_types | self.allowed_video_types | self.allowed_doc_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} not allowed. Allowed types: images, videos, documents"
            )
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        if size > self.max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size is {self.max_file_size / 1024 / 1024}MB"
            )

    async def upload_file(self, file: UploadFile) -> dict:
        self._validate_file(file)
        self._ensure_upload_dir()
        unique_filename = self._generate_unique_filename(file.filename)
        file_path = self.upload_dir / unique_filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_type = "image" if file.content_type in self.allowed_image_types else \
                   "video" if file.content_type in self.allowed_video_types else "document"
        return {
            "filename": unique_filename,
            "original_filename": file.filename,
            "content_type": file.content_type,
            "file_type": file_type,
            "size": file_path.stat().st_size,
            "url": f"/uploads/{unique_filename}"
        }

    async def delete_file(self, filename: str) -> bool:
        file_path = self.upload_dir / filename
        if file_path.exists():
            file_path.unlink()
            return True
        return False

    def get_file_url(self, filename: str) -> Optional[str]:
        file_path = self.upload_dir / filename
        if file_path.exists():
            return f"/uploads/{filename}"
        return None

    def list_files(self) -> list:
        self._ensure_upload_dir()
        files = []
        for file_path in self.upload_dir.iterdir():
            if file_path.is_file():
                files.append({
                    "filename": file_path.name,
                    "size": file_path.stat().st_size,
                    "url": f"/uploads/{file_path.name}"
                })
        return files
