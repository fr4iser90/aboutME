from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.models.section import Section

class SectionRepository(ABC):
    @abstractmethod
    def create(self, section: Section) -> Section:
        pass

    @abstractmethod
    def update(self, section_id: int, section: Section) -> Optional[Section]:
        pass

    @abstractmethod
    def get(self, section_id: int) -> Optional[Section]:
        pass

    @abstractmethod
    def get_by_name(self, name: str) -> Optional[Section]:
        pass

    @abstractmethod
    def list(self) -> List[Section]:
        pass

    @abstractmethod
    def get_visible(self) -> List[Section]:
        """Get all visible sections"""
        pass

    @abstractmethod
    def delete(self, section_id: int) -> bool:
        pass

    @abstractmethod
    def reorder(self, section_id: int, new_order: int) -> Optional[Section]:
        pass 