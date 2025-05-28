from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import relationship
from sqlalchemy.schema import UniqueConstraint

from app.db.session import Base


class UserPageLayout(Base):
    __tablename__ = "user_page_layouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    section_id = Column(
        Integer, ForeignKey("sections.id"), nullable=False, index=True
    )  # Links to a section type
    custom_title = Column(
        String(255), nullable=True
    )  # User can override the default section title
    custom_content = Column(
        JSONB, nullable=True
    )  # User-specific content for this section instance
    section_order = Column(
        Integer, nullable=False
    )  # Order of this section on the user's page
    is_visible = Column(Boolean, default=True)
    background_image_url = Column(String(255), nullable=True)
    layout_variant = Column(
        String(50), nullable=True
    )  # e.g., 'classic-text', 'modern-gallery'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )

    user = relationship("User", back_populates="page_layouts")
    section_type = relationship(
        "Section"
    )  # Relationship to the 'sections' table (section type definition)

    ai_generated_contents = relationship(
        "AIGeneratedContent", back_populates="user_page_layout"
    )

    __table_args__ = (
        UniqueConstraint("user_id", "section_order", name="uq_user_section_order"),
    )
