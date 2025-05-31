from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.models.post import Post

class PostRepository(ABC):
    """Repository interface for posts."""
    
    @abstractmethod
    def get_by_id(self, post_id: int) -> Optional[Post]:
        """Get a post by its ID."""
        pass
    
    @abstractmethod
    def get_by_slug(self, slug: str) -> Optional[Post]:
        """Get a post by its slug."""
        pass
    
    @abstractmethod
    def get_all(self) -> List[Post]:
        """Get all posts."""
        pass
    
    @abstractmethod
    def get_published(self) -> List[Post]:
        """Get all published posts."""
        pass
    
    @abstractmethod
    def get_by_project(self, project_id: int) -> List[Post]:
        """Get all posts related to a project."""
        pass
    
    @abstractmethod
    def get_by_section(self, section_id: int) -> List[Post]:
        """Get all posts related to a section."""
        pass
    
    @abstractmethod
    def get_by_type(self, post_type: str) -> List[Post]:
        """Get all posts of a specific type."""
        pass
    
    @abstractmethod
    def get_featured(self) -> List[Post]:
        """Get all featured posts."""
        pass
    
    @abstractmethod
    def get_pinned(self) -> List[Post]:
        """Get all pinned posts."""
        pass
    
    @abstractmethod
    def create(self, post: Post) -> Post:
        """Create a new post."""
        pass
    
    @abstractmethod
    def update(self, post_id: int, post: Post) -> Optional[Post]:
        """Update an existing post."""
        pass
    
    @abstractmethod
    def delete(self, post_id: int) -> bool:
        """Delete a post."""
        pass
    
    @abstractmethod
    def search(self, query: str) -> List[Post]:
        """Search posts by title, content, or tags."""
        pass
    
    @abstractmethod
    def get_by_tag(self, tag: str) -> List[Post]:
        """Get all posts with a specific tag."""
        pass
    
    @abstractmethod
    def get_by_category(self, category: str) -> List[Post]:
        """Get all posts in a specific category."""
        pass
    
    @abstractmethod
    def get_by_series(self, series: str) -> List[Post]:
        """Get all posts in a specific series."""
        pass
    
    @abstractmethod
    def get_related(self, post_id: int) -> List[Post]:
        """Get posts related to a specific post."""
        pass 