/**
 * Preview Data API Route
 * 
 * Loads preview data from private/data/*.json files (admin-only access).
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const PRIVATE_DATA_DIR = path.join(process.cwd(), 'private/data');

/**
 * GET: Load preview data from private/data
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // For now, allow access during setup mode
    
    const previewData: any = {};

    // Load projects
    try {
      const projectsPath = path.join(PRIVATE_DATA_DIR, 'projects', 'projects.json');
      if (await fs.access(projectsPath).then(() => true).catch(() => false)) {
        const projectsContent = await fs.readFile(projectsPath, 'utf-8');
        previewData.projects = JSON.parse(projectsContent);
      }
    } catch (error) {
      console.warn('Could not load projects:', error);
    }

    // Load about
    try {
      const aboutPath = path.join(PRIVATE_DATA_DIR, 'about', 'about.json');
      if (await fs.access(aboutPath).then(() => true).catch(() => false)) {
        const aboutContent = await fs.readFile(aboutPath, 'utf-8');
        previewData.about = JSON.parse(aboutContent);
      }
    } catch (error) {
      console.warn('Could not load about:', error);
    }

    // Load user
    try {
      const userPath = path.join(PRIVATE_DATA_DIR, 'user', 'user.json');
      if (await fs.access(userPath).then(() => true).catch(() => false)) {
        const userContent = await fs.readFile(userPath, 'utf-8');
        previewData.user = JSON.parse(userContent);
      }
    } catch (error) {
      console.warn('Could not load user:', error);
    }

    // Load skills
    try {
      const skillsPath = path.join(PRIVATE_DATA_DIR, 'skills', 'skills.json');
      if (await fs.access(skillsPath).then(() => true).catch(() => false)) {
        const skillsContent = await fs.readFile(skillsPath, 'utf-8');
        previewData.skills = JSON.parse(skillsContent);
      }
    } catch (error) {
      console.warn('Could not load skills:', error);
    }

    return NextResponse.json(previewData);
  } catch (error) {
    console.error('Preview data API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

