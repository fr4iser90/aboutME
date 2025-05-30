from typing import List, Optional
import logging
from app.domain.repositories.section_repository import SectionRepository
from app.domain.models.section import Section

logger = logging.getLogger(__name__)

class SectionService:
    def __init__(self, section_repository: SectionRepository):
        self.section_repository = section_repository

    def create_section(self, section: Section) -> Section:
        """Create a new section"""
        logger.debug(f"Creating new section: {section.name}")
        return self.section_repository.create(section)

    def update_section(self, section_id: int, section: Section) -> Optional[Section]:
        """Update an existing section"""
        logger.debug(f"Updating section: {section_id}")
        return self.section_repository.update(section_id, section)

    def get_section(self, section_id: int) -> Optional[Section]:
        """Get a section by ID"""
        return self.section_repository.get(section_id)

    def get_section_by_name(self, name: str) -> Optional[Section]:
        """Get a section by name"""
        return self.section_repository.get_by_name(name)

    def list_sections(self) -> List[Section]:
        """List all sections"""
        return self.section_repository.list()

    def delete_section(self, section_id: int) -> bool:
        """Delete a section"""
        logger.debug(f"Deleting section: {section_id}")
        return self.section_repository.delete(section_id)

    def reorder_section(self, section_id: int, new_order: int) -> Optional[Section]:
        """Reorder a section"""
        logger.debug(f"Reordering section {section_id} to position {new_order}")
        return self.section_repository.reorder(section_id, new_order)

    async def get_visible_sections(self) -> List[Section]:
        """Get all visible sections"""
        return self.section_repository.get_visible()

    async def get_visible_section(self, section_id: int) -> Optional[Section]:
        """Get a visible section by ID"""
        section = await self.get_section(section_id)
        if section and section.is_visible:
            return section
        return None 