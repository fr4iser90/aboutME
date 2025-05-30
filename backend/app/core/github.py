import os
import requests
from typing import Dict, Any, List
import logging

GITHUB_API_URL = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GIT_API_KEY")
logger = logging.getLogger(__name__)

logging.getLogger("app.domain.services.project_service").setLevel(logging.DEBUG)


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
    
    # First get all repositories
    response = requests.get(
        f"{GITHUB_API_URL}/users/{username}/repos",
        headers=headers,
        params={"sort": "updated", "per_page": 100}
    )
    response.raise_for_status()
    repos = response.json()

    # For each repo, check if it has releases
    for repo in repos:
        try:
            releases_response = requests.get(
                f"{GITHUB_API_URL}/repos/{username}/{repo['name']}/releases",
                headers=headers,
                params={"per_page": 1}  # We only need to know if there are any releases
            )
            releases_response.raise_for_status()
            releases = releases_response.json()
            
            # Check if there are any releases and if the latest one is a pre-release
            repo['has_releases'] = len(releases) > 0
            repo['is_prerelease'] = releases[0]['prerelease'] if releases else False
            
        except Exception as e:
            logger.warning(f"Failed to fetch releases for {repo['name']}: {str(e)}")
            repo['has_releases'] = False
            repo['is_prerelease'] = False

    return repos


def create_project_from_repo(repo: Dict[str, Any]) -> Dict[str, Any]:
    """Create a project from a GitHub repository."""
    return {
        "name": repo["name"],
        "description": repo.get("description", ""),
        "source_type": "github",
        "source_url": repo["html_url"],
        "github_username": repo["owner"]["login"],
        "github_repo": repo["name"],
        "live_url": repo.get("homepage"),
        "thumbnail_url": repo["owner"]["avatar_url"],
        "details": {
            "size": repo.get("size"),
            "license": repo.get("license", {}).get("name"),
            "has_wiki": repo.get("has_wiki", False),
            "has_pages": repo.get("has_pages", False),
            "default_branch": repo.get("default_branch"),
            "open_issues": repo.get("open_issues_count", 0)
        },
        "stars_count": repo.get("stargazers_count", 0),
        "forks_count": repo.get("forks_count", 0),
        "watchers_count": repo.get("watchers_count", 0),
        "language": repo.get("language"),
        "topics": repo.get("topics", []),
        "last_updated": repo.get("updated_at"),
        "homepage_url": repo.get("homepage"),
        "open_issues_count": repo.get("open_issues_count", 0),
        "default_branch": repo.get("default_branch"),
        "archived": repo.get("archived", False)
    } 