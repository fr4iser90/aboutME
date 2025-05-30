import os
import requests
from typing import Dict, Any, List

GITLAB_API_URL = "https://gitlab.com/api/v4"
GITLAB_TOKEN = os.getenv("GIT_API_KEY")  # Using the same API key for both services

def fetch_user_projects(username: str) -> List[Dict[str, Any]]:
    """Fetch all projects for a GitLab user."""
    headers = {}
    if GITLAB_TOKEN:
        headers["PRIVATE-TOKEN"] = GITLAB_TOKEN
    
    response = requests.get(
        f"{GITLAB_API_URL}/users/{username}/projects",
        headers=headers,
        params={"per_page": 100}
    )
    response.raise_for_status()
    return response.json()

def create_project_from_gitlab(project_data: Dict[str, Any]) -> Dict[str, Any]:
    """Convert GitLab project data into a project format."""
    return {
        "name": project_data["name"],
        "description": project_data.get("description", ""),
        "thumbnail_url": project_data.get("avatar_url", ""),
        "source_type": "gitlab",
        "source_url": project_data["web_url"],
        "stars_count": project_data.get("star_count", 0),
        "forks_count": project_data.get("forks_count", 0),
        "status": "Archived" if project_data.get("archived", False) else "WIP",
        "details": {
            "default_branch": project_data.get("default_branch"),
            "open_issues": project_data.get("open_issues_count", 0),
            "visibility": project_data.get("visibility"),
            "last_activity_at": project_data.get("last_activity_at")
        }
    } 