/**
 * GitHub Filter API Route
 * 
 * Tests GitHub repository filtering based on configured criteria.
 */

import { NextRequest, NextResponse } from 'next/server';
import { applyFilters, getDefaultFilterConfig, Repository } from '@/features/setup/services/githubFilter';
import { GitHubFilterConfig } from '@/features/setup/types/setup.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { githubUsername, githubToken, filterConfig } = body;

    if (!githubUsername) {
      return NextResponse.json(
        { error: 'GitHub username is required' },
        { status: 400 }
      );
    }

    // Set token temporarily for this request
    if (githubToken) {
      process.env.GITHUB_TOKEN = githubToken;
    }

    // Fetch repositories using fast list-only functions
    let repositories: Repository[] = [];
    let fetchMethod: 'api' | 'playwright' = 'api';
    let privateReposExcluded = false;
    
    try {
      // Try API first (fast)
      const { fetchRepositoryListOnly } = await import('@/features/setup/scripts/api-scraper');
      const apiRepos = await fetchRepositoryListOnly();
      
      if (apiRepos && apiRepos.length > 0) {
        repositories = apiRepos.map((repo: any) => ({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          fork: repo.fork,
          is_template: repo.is_template || false,
          stargazers_count: repo.stargazers_count,
          language: repo.language,
          topics: repo.topics || [],
          html_url: repo.html_url,
          homepage: repo.homepage,
          forks_count: repo.forks_count,
          updated_at: repo.updated_at,
          created_at: repo.created_at,
          size: repo.size,
          visibility: repo.visibility || 'public',
        }));
        fetchMethod = 'api';
        // Check if private repos are excluded (API doesn't return private repos without token)
        privateReposExcluded = !githubToken;
      } else {
        throw new Error('API returned no repositories');
      }
    } catch (apiError) {
      // Fallback to Playwright if API fails
      console.log('⚠️  API fetch failed, falling back to Playwright...');
      try {
        const { fetchRepositoryListOnlyWithPlaywright } = await import('@/features/setup/scripts/playwright-scrapping');
        const playwrightRepos = await fetchRepositoryListOnlyWithPlaywright();
        
        if (playwrightRepos && playwrightRepos.length > 0) {
          repositories = playwrightRepos.map((repo: any) => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            fork: repo.fork || false,
            is_template: repo.is_template || false,
            stargazers_count: repo.stargazers_count || 0,
            language: repo.language,
            topics: repo.topics || [],
            html_url: repo.html_url,
            homepage: repo.homepage,
            forks_count: repo.forks_count || 0,
            updated_at: repo.updated_at,
            created_at: repo.created_at,
            size: repo.size || 0,
            visibility: repo.visibility || 'public',
          }));
          fetchMethod = 'playwright';
          // Playwright can't access private repos without authentication
          privateReposExcluded = true;
        } else {
          throw new Error('Playwright returned no repositories');
        }
      } catch (playwrightError) {
        return NextResponse.json(
          { error: 'Failed to fetch repositories', details: (playwrightError as Error).message },
          { status: 500 }
        );
      }
    }

    // Return all repositories (filtering happens in frontend)
    // The filterConfig is used only to determine what to fetch initially
    return NextResponse.json({
      success: true,
      result: {
        repositories: repositories, // All repositories, not filtered
        total: repositories.length,
        filtered: repositories.length, // Will be filtered in frontend
        featured: [], // Will be determined in frontend
      },
      metadata: {
        fetchMethod, // 'api' or 'playwright'
        privateReposExcluded, // true if private repos are not included
      },
    });
  } catch (error) {
    console.error('GitHub filter API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

