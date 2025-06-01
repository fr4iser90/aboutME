from fastapi import APIRouter
from .projects import router as projects_router
from .github import router as github_router
from .skills import router as skills_router
from .sections import router as sections_router
from .themes import router as themes_router
from .layout import router as layout_router
from .upload import router as upload_router

router = APIRouter()

# Include all admin routers
router.include_router(projects_router, prefix="/projects", tags=["admin-projects"])
router.include_router(github_router, prefix="/github", tags=["admin-github"])
router.include_router(skills_router, prefix="/skills", tags=["admin-skills"])
router.include_router(sections_router, prefix="/sections", tags=["admin-sections"])
router.include_router(themes_router, prefix="/themes", tags=["admin-themes"])
router.include_router(layout_router, prefix="/layout", tags=["admin-layout"])
router.include_router(upload_router, prefix="/upload", tags=["admin-upload"]) 