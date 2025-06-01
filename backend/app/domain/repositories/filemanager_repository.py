from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.models.file import File

class FileManagerRepository(ABC):
    @abstractmethod
    def get_file(self, file_id: str) -> Optional[File]:
        pass

    @abstractmethod
    def list_files(self, parent_id: Optional[str] = None) -> List[File]:
        pass

    @abstractmethod
    def create_file(self, file: File) -> File:
        pass

    @abstractmethod
    def update_file(self, file_id: str, file: File) -> Optional[File]:
        pass

    @abstractmethod
    def delete_file(self, file_id: str) -> bool:
        pass

    @abstractmethod
    def move_file(self, file_id: str, new_parent_id: Optional[str] = None) -> Optional[File]:
        pass 