from typing import List, Optional
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import Session
from app.domain.models.post import Post
from app.domain.repositories.post_repository import PostRepository
from app.infrastructure.database.models.post import PostModel
import json

class SQLAlchemyPostRepository(PostRepository):
    def __init__(self, db: Session):
        self._db = db

    def _to_db(self, post: Post) -> dict:
        """Convert domain model to database model."""
        data = post.model_dump()
        # Convert lists to PostgreSQL arrays
        for field in ['gallery_urls', 'seo_keywords', 'tags', 'categories', 'prerequisites', 
                     'learning_objectives', 'target_audience', 'related_posts']:
            if isinstance(data.get(field), str):
                try:
                    data[field] = json.loads(data[field])
                except json.JSONDecodeError:
                    data[field] = []
        return data

    def _to_domain(self, db_post: PostModel) -> Post:
        """Convert database model to domain model."""
        return Post.model_validate(db_post.__dict__)

    def get_by_id(self, post_id: int) -> Optional[Post]:
        stmt = select(PostModel).where(PostModel.id == post_id)
        model = self._db.execute(stmt).scalar_one_or_none()
        return self._to_domain(model) if model else None

    def get_by_slug(self, slug: str) -> Optional[Post]:
        stmt = select(PostModel).where(PostModel.slug == slug)
        model = self._db.execute(stmt).scalar_one_or_none()
        return self._to_domain(model) if model else None

    def get_all(self) -> List[Post]:
        stmt = select(PostModel)
        models = self._db.execute(stmt).scalars().all()
        return [self._to_domain(model) for model in models]

    def get_published(self) -> List[Post]:
        stmt = select(PostModel).where(PostModel.is_published == True)
        models = self._db.execute(stmt).scalars().all()
        return [self._to_domain(model) for model in models]

    def get_by_project(self, project_id: int) -> List[Post]:
        stmt = select(PostModel).where(PostModel.project_id == project_id)
        models = self._db.execute(stmt).scalars().all()
        return [self._to_domain(model) for model in models]

    def get_by_section(self, section_id: int) -> List[Post]:
        stmt = select(PostModel).where(PostModel.section_id == section_id)
        models = self._db.execute(stmt).scalars().all()
        return [self._to_domain(model) for model in models]

    def get_by_type(self, post_type: str) -> List[Post]:
        stmt = select(PostModel).where(PostModel.type == post_type)
        models = self._db.execute(stmt).scalars().all()
        return [self._to_domain(model) for model in models]

    def get_featured(self) -> List[Post]:
        stmt = select(PostModel).where(PostModel.is_featured == True)
        models = self._db.execute(stmt).scalars().all()
        return [self._to_domain(model) for model in models]

    def get_pinned(self) -> List[Post]:
        stmt = select(PostModel).where(PostModel.is_pinned == True)
        models = self._db.execute(stmt).scalars().all()
        return [self._to_domain(model) for model in models]

    def create(self, post: Post) -> Post:
        db_post = PostModel(**self._to_db(post))
        self._db.add(db_post)
        self._db.commit()
        self._db.refresh(db_post)
        return self._to_domain(db_post)

    def update(self, post_id: int, post: Post) -> Optional[Post]:
        db_post = self._db.query(PostModel).filter(PostModel.id == post_id).first()
        if not db_post:
            return None
        
        update_data = self._to_db(post)
        for key, value in update_data.items():
            setattr(db_post, key, value)
        
        self._db.commit()
        self._db.refresh(db_post)
        return self._to_domain(db_post)

    def delete(self, post_id: int) -> bool:
        db_post = self._db.query(PostModel).filter(PostModel.id == post_id).first()
        if not db_post:
            return False
        
        self._db.delete(db_post)
        self._db.commit()
        return True

    def search(self, query: str) -> List[Post]:
        search_term = f"%{query}%"
        stmt = select(PostModel).where(
            or_(
                PostModel.title.ilike(search_term),
                PostModel.content_markdown.ilike(search_term),
                PostModel.tags.cast(String).ilike(search_term)
            )
        )
        models = self._db.execute(stmt).scalars().all()
        return [self._to_domain(model) for model in models]

    def get_by_tag(self, tag: str) -> List[Post]:
        stmt = select(PostModel).where(PostModel.tags.contains([tag]))
        models = self._db.execute(stmt).scalars().all()
        return [self._to_domain(model) for model in models]

    def get_by_category(self, category: str) -> List[Post]:
        stmt = select(PostModel).where(PostModel.categories.contains([category]))
        models = self._db.execute(stmt).scalars().all()
        return [self._to_domain(model) for model in models]

    def get_by_series(self, series: str) -> List[Post]:
        stmt = select(PostModel).where(PostModel.series == series)
        models = self._db.execute(stmt).scalars().all()
        return [self._to_domain(model) for model in models]

    def get_related(self, post_id: int) -> List[Post]:
        # Get the post to find related posts
        post = self.get_by_id(post_id)
        if not post:
            return []
        
        # Find posts with similar tags or categories
        stmt = select(PostModel).where(
            and_(
                PostModel.id != post_id,
                or_(
                    PostModel.tags.overlap(post.tags or []),
                    PostModel.categories.overlap(post.categories or [])
                )
            )
        )
        models = self._db.execute(stmt).scalars().all()
        return [self._to_domain(model) for model in models] 