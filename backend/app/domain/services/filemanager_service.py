from datetime import datetime
from typing import List, Optional, Set
from app.domain.models.file import File
from app.domain.repositories.filemanager_repository import FileManagerRepository
from app.domain.exceptions import FileValidationError

class FileManagerService:
    def __init__(self, repository: FileManagerRepository):
        self._repository = repository
        self.allowed_image_types: Set[str] = {"image/jpeg", "image/png", "image/gif"}
        self.allowed_video_types: Set[str] = {"video/mp4", "video/webm"}
        self.allowed_doc_types: Set[str] = {"application/pdf", "text/plain"}
        self.max_file_size = 10 * 1024 * 1024  # 10MB

    def get_file(self, file_id: str) -> Optional[File]:
        return self._repository.get_file(file_id)

    def list_files(self, parent_id: Optional[str] = None) -> List[File]:
        return self._repository.list_files(parent_id)

    def _validate_file(self, content_type: str, size: int) -> None:
        if content_type not in self.allowed_image_types | self.allowed_video_types | self.allowed_doc_types:
            raise FileValidationError(
                f"File type {content_type} not allowed. Allowed types: images, videos, documents"
            )

        if size > self.max_file_size:
            raise FileValidationError(
                f"File too large. Maximum size is {self.max_file_size / 1024 / 1024}MB"
            )

    async def create_file(self, name: str, content_type: str, size: int, parent_id: Optional[str] = None, path: Optional[str] = None) -> File:
        self._validate_file(content_type, size)

        file_obj = File(
            name=name,
            path=path or f"/files/{name}",  # Use provided path or default
            parent_id=parent_id,
            is_folder=False,
            size=size,
            mime_type=content_type
        )

        return self._repository.create_file(file_obj)

    def create_folder(self, name: str, parent_id: Optional[str] = None) -> File:
        folder_obj = File(
            name=name,
            path=f"/folders/{name}",  # Set a default path
            parent_id=parent_id,
            is_folder=True
        )

        return self._repository.create_file(folder_obj)

    def update_file(self, file_id: str, file_in: File) -> Optional[File]:
        existing_file = self.get_file(file_id)
        if not existing_file:
            return None

        file_in.id = file_id
        file_in.created_at = existing_file.created_at

        return self._repository.update_file(file_id, file_in)

    def delete_file(self, file_id: str) -> bool:
        return self._repository.delete_file(file_id)

    def move_file(self, file_id: str, new_parent_id: Optional[str] = None) -> Optional[File]:
        file = self.get_file(file_id)
        if not file:
            return None

        file.parent_id = new_parent_id

        return self._repository.move_file(file_id, new_parent_id) 