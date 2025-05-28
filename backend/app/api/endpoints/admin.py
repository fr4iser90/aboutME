from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.auth import get_current_user
from app.db.session import get_db
from app import crud, schemas
from app.models.user import User
from app.core.github import fetch_user_repositories, create_project_from_repo

router = APIRouter()


# Theme routes
@router.get("/themes", response_model=List[schemas.Theme])
def list_themes(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return crud.crud_theme.get_multi(db)


@router.post("/themes", response_model=schemas.Theme)
def create_theme(
    theme: schemas.ThemeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.crud_theme.create(db, obj_in=theme)


@router.put("/themes/{theme_id}", response_model=schemas.Theme)
def update_theme(
    theme_id: int,
    theme: schemas.ThemeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.crud_theme.update(db, id=theme_id, obj_in=theme)


# Section routes
@router.get("/sections", response_model=List[schemas.Section])
def list_sections(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return crud.crud_section.get_multi(db)


@router.post("/sections", response_model=schemas.Section)
def create_section(
    section: schemas.SectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.crud_section.create(db, obj_in=section)


@router.put("/sections/{section_id}", response_model=schemas.Section)
def update_section(
    section_id: int,
    section: schemas.SectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.crud_section.update(db, id=section_id, obj_in=section)


# Skill routes
@router.get("/skills", response_model=List[schemas.Skill])
def list_skills(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return crud.crud_skill.get_multi(db)


@router.post("/skills", response_model=schemas.Skill)
def create_skill(
    skill: schemas.SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.crud_skill.create(db, obj_in=skill)


@router.put("/skills/{skill_id}", response_model=schemas.Skill)
def update_skill(
    skill_id: int,
    skill: schemas.SkillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.crud_skill.update(db, id=skill_id, obj_in=skill)


# Project routes
@router.get("/projects", response_model=List[schemas.Project])
def list_projects(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return crud.crud_project.get_multi(db)


@router.post("/projects", response_model=schemas.Project)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.crud_project.create(db, obj_in=project)


@router.put("/projects/{project_id}", response_model=schemas.Project)
def update_project(
    project_id: int,
    project: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.crud_project.update(db, id=project_id, obj_in=project)


# GitHub Integration routes
@router.post("/projects/github/sync")
async def sync_github_projects(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Sync projects from GitHub repositories."""
    repos = await fetch_user_repositories(username)
    projects = []

    for repo in repos:
        project_data = create_project_from_repo(repo)
        # Check if project already exists
        existing = (
            db.query(Project)
            .filter(
                Project.github_username == username, Project.github_repo == repo["name"]
            )
            .first()
        )

        if existing:
            # Update existing project
            for key, value in project_data.items():
                setattr(existing, key, value)
            db.add(existing)
        else:
            # Create new project
            project = Project(**project_data)
            db.add(project)
        projects.append(project_data)

    db.commit()
    return {"message": f"Synced {len(projects)} projects from GitHub"}


@router.get("/projects/github/{username}")
async def get_github_projects(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all GitHub projects for a user."""
    return db.query(Project).filter(Project.github_username == username).all()
