import os
import requests
from typing import Dict, Any, List

GITHUB_API_URL = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")


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
    return {
        "name": repo_data["name"],
        "description": repo_data["description"] or "",
        "thumbnail_url": repo_data.get("owner", {}).get("avatar_url", ""),
        "source_type": "github",
        "source_url": repo_data["html_url"],
        "stars": repo_data["stargazers_count"],
        "forks": repo_data["forks_count"],
        "status": "active",
        "details": {
            "default_branch": repo_data["default_branch"],
            "open_issues": repo_data["open_issues_count"],
            "license": repo_data.get("license", {}).get("name"),
            "size": repo_data["size"],
            "has_wiki": repo_data["has_wiki"],
            "has_pages": repo_data["has_pages"]
        }
    }
