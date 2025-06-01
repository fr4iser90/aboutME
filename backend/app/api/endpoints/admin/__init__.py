from fastapi import APIRouter
from . import projects, sections, skills, themes, layout, github, filemanager

router = APIRouter()

# Include all admin routers
router.include_router(projects.router, prefix="/projects", tags=["admin-projects"])
router.include_router(sections.router, prefix="/sections", tags=["admin-sections"])
router.include_router(skills.router, prefix="/skills", tags=["admin-skills"])
router.include_router(themes.router, prefix="/themes", tags=["admin-themes"])
router.include_router(layout.router, prefix="/layout", tags=["admin-layout"])
router.include_router(github.router, prefix="/github", tags=["admin-github"])
router.include_router(filemanager.router, prefix="/filemanager", tags=["admin-filemanager"]) 