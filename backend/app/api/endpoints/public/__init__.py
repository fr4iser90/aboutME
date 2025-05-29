from fastapi import APIRouter
from .projects import router as projects_router
from .skills import router as skills_router
from .sections import router as sections_router
from .themes import router as themes_router
from .layout import router as layout_router

router = APIRouter()

router.include_router(projects_router, prefix="/projects", tags=["public-projects"])
router.include_router(skills_router, prefix="/skills", tags=["public-skills"])
router.include_router(sections_router, prefix="/sections", tags=["public-sections"])
router.include_router(themes_router, prefix="/themes", tags=["public-themes"])
router.include_router(layout_router, prefix="/layout", tags=["public-layout"]) 