import os
import requests
from typing import Dict, Any, List
import logging

GITHUB_API_URL = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GIT_API_KEY")
logger = logging.getLogger(__name__)


def fetch_repository(username: str, repo: str) -> Dict[str, Any]:
    """Fetch data for a specific GitHub repository."""
    headers = {}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    
    response = requests.get(
        f"{GITHUB_API_URL}/repos/{username}/{repo}",
        headers=headers
    )
    response.raise_for_status()
    return response.json()


def fetch_user_repositories(username: str) -> List[Dict[str, Any]]:
    """Fetch all repositories for a GitHub user."""
    headers = {}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    
    response = requests.get(
        f"{GITHUB_API_URL}/users/{username}/repos",
        headers=headers,
        params={"sort": "updated", "per_page": 100}
    )
    response.raise_for_status()
    return response.json()


def create_project_from_repo(repo_data: Dict[str, Any]) -> Dict[str, Any]:
    """Convert GitHub repository data into a project format."""
    try:
        return {
            "name": repo_data.get("name", ""),
            "description": repo_data.get("description", "") or "",
            "thumbnail_url": repo_data.get("owner", {}).get("avatar_url", "") if repo_data.get("owner") else "",
            "source_type": "github",
            "source_url": repo_data.get("html_url", ""),
            "stars_count": repo_data.get("stargazers_count", 0),
            "forks_count": repo_data.get("forks_count", 0),
            "status": "Archived" if repo_data.get("archived", False) else "WIP",
            "details": {
                "default_branch": repo_data.get("default_branch", "main"),
                "open_issues": repo_data.get("open_issues_count", 0),
                "license": repo_data.get("license", {}).get("name") if repo_data.get("license") else None,
                "size": repo_data.get("size", 0),
                "has_wiki": repo_data.get("has_wiki", False),
                "has_pages": repo_data.get("has_pages", False)
            }
        }
    except Exception as e:
        logger.error(f"Error creating project from repo data: {str(e)}")
        # Return a minimal valid project structure
        return {
            "name": repo_data.get("name", "Unknown"),
            "description": "",
            "thumbnail_url": "",
            "source_type": "github",
            "source_url": repo_data.get("html_url", ""),
            "stars_count": 0,
            "forks_count": 0,
            "status": "WIP",
            "details": {}
        } 