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

def create_project_from_repo(repo_data: Dict[str, Any]) -> Dict[str, Any]:
    """Convert GitLab repository data into a project format."""
    try:
        return {
            "name": repo_data.get("name", ""),
            "description": repo_data.get("description", "") or "",
            "thumbnail_url": repo_data.get("avatar_url", ""),
            "source_type": "gitlab",
            "source_url": repo_data.get("web_url", ""),
            "stars_count": repo_data.get("star_count", 0),
            "forks_count": repo_data.get("forks_count", 0),
            "status": "Archived" if repo_data.get("archived", False) else "WIP",
            "details": {
                "default_branch": repo_data.get("default_branch", "main"),
                "open_issues": repo_data.get("open_issues_count", 0),
                "license": repo_data.get("license", {}).get("name") if repo_data.get("license") else None,
                "visibility": repo_data.get("visibility", "private"),
                "has_wiki": repo_data.get("wiki_enabled", False),
                "has_pages": repo_data.get("pages_enabled", False)
            }
        }
    except Exception as e:
        logger.error(f"Error creating project from repo data: {str(e)}")
        return {
            "name": repo_data.get("name", "Unknown"),
            "description": "",
            "thumbnail_url": "",
            "source_type": "gitlab",
            "source_url": repo_data.get("web_url", ""),
            "stars_count": 0,
            "forks_count": 0,
            "status": "WIP",
            "details": {}
        } 