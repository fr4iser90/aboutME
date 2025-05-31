-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS (Single User)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'me',
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    github_username VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- THEMES
CREATE TABLE IF NOT EXISTS themes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    style_properties JSONB NOT NULL,
    custom_css TEXT,
    custom_js TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SECTIONS
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(128) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'text',
    content JSONB,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    theme_id INTEGER REFERENCES themes(id) ON DELETE SET NULL,
    section_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'WIP' CHECK (status IN ('ACTIVE', 'WIP', 'ARCHIVED', 'DEPRECATED')),
    source_type VARCHAR(50) DEFAULT 'manual',
    source_url VARCHAR(255),
    github_username VARCHAR(255),
    github_repo VARCHAR(255),
    gitlab_username VARCHAR(255),
    gitlab_repo VARCHAR(255),
    live_url VARCHAR(255),
    thumbnail_url VARCHAR(255),
    details JSONB,
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    stars_count INTEGER DEFAULT 0,
    forks_count INTEGER DEFAULT 0,
    watchers_count INTEGER DEFAULT 0,
    language VARCHAR(50),
    topics TEXT[],
    last_updated TIMESTAMP WITH TIME ZONE,
    homepage_url VARCHAR(255),
    open_issues_count INTEGER DEFAULT 0,
    default_branch VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SKILLS
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    category VARCHAR(64) NOT NULL,
    description TEXT,
    items JSONB NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- USER PAGE LAYOUTS (für deine About-Me-Seite)
CREATE TABLE IF NOT EXISTS user_page_layouts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    section_id INTEGER NOT NULL REFERENCES sections(id),
    custom_title VARCHAR(255),
    custom_content JSONB,
    section_order INTEGER NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    background_image_url VARCHAR(255),
    layout_variant VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, section_order)
);

-- USER PROFILES (für deine About-Me-Seite)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    display_name VARCHAR(255),
    bio TEXT,
    profile_picture_url VARCHAR(255),
    selected_theme_id INTEGER REFERENCES themes(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI GENERATED CONTENT
CREATE TABLE IF NOT EXISTS ai_generated_content (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_page_layout_id INTEGER REFERENCES user_page_layouts(id) ON DELETE SET NULL,
    source_url VARCHAR(2048),
    source_type VARCHAR(50) NOT NULL,
    summary TEXT NOT NULL,
    raw_data_input JSONB,
    generation_parameters JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adjusting original seed data to be compatible if needed, or creating new seed data for new tables.
-- For example, projects and skills might now need a user_id if they become user-specific.
-- The seed.sql file will need to be updated accordingly.
