from typing import List, Dict, Any, Optional
import aiohttp
from fastapi import HTTPException

async def fetch_user_repositories(username: str, token: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch repositories for a GitHub user"""
    headers = {}
    if token:
        headers["Authorization"] = f"token {token}"
    
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"https://api.github.com/users/{username}/repos",
            headers=headers,
            params={"sort": "updated", "per_page": 100}
        ) as response:
            if response.status == 404:
                raise HTTPException(status_code=404, detail="GitHub user not found")
            response.raise_for_status()
            repos = await response.json()
            
            return [{
                "name": repo["name"],
                "description": repo["description"] or "",
                "source_url": repo["html_url"],
                "live_url": repo["homepage"],
                "thumbnail_url": None,  # GitHub doesn't provide thumbnails
                "details": {
                    "stars": repo["stargazers_count"],
                    "forks": repo["forks_count"],
                    "language": repo["language"],
                    "topics": repo["topics"],
                    "updated_at": repo["updated_at"],
                    "default_branch": repo["default_branch"]
                },
                "is_visible": True,
                "archived": repo["archived"]
            } for repo in repos] 