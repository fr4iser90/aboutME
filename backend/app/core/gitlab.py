import os
import requests
from typing import Dict, Any, List
import logging

GITLAB_API_URL = "https://gitlab.com/api/v4"
GITLAB_TOKEN = os.getenv("GITLAB_API_KEY")
logger = logging.getLogger(__name__)

def fetch_user_repositories(username: str) -> List[Dict[str, Any]]:
    """Fetch all repositories for a GitLab user."""
    headers = {}
    if GITLAB_TOKEN:
        headers["PRIVATE-TOKEN"] = GITLAB_TOKEN
    
    response = requests.get(
        f"{GITLAB_API_URL}/users/{username}/projects",
        headers=headers,
        params={"order_by": "updated_at", "per_page": 100}
    )
    response.raise_for_status()
    return response.json()

def create_project_from_repo(repo: Dict[str, Any]) -> Dict[str, Any]:
    """Create a project from a GitLab repository."""
    return {
        "name": repo["name"],
        "description": repo.get("description", ""),
        "source_type": "gitlab",
        "source_url": repo["web_url"],
        "source_username": repo["namespace"]["username"],
        "source_repo": repo["path"],
        "live_url": repo.get("homepage"),
        "thumbnail_url": repo["namespace"].get("avatar_url"),
        "details": {
            "default_branch": repo.get("default_branch"),
            "open_issues": repo.get("open_issues_count", 0),
            "visibility": repo.get("visibility"),
            "archived": repo.get("archived", False),
        },
        "stars_count": repo.get("star_count", 0),
        "forks_count": repo.get("forks_count", 0),
        "language": repo.get("language"),
        "topics": repo.get("topics", []),
        "last_updated": repo.get("last_activity_at"),
        "homepage_url": repo.get("homepage"),
        "open_issues_count": repo.get("open_issues_count", 0),
        "default_branch": repo.get("default_branch"),
        "archived": repo.get("archived", False)
    } 