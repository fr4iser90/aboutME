-- This application is designed for a single administrative user/owner.
-- All content and configurations are managed by this single owner.
-- Public visitors do not have accounts and only view the presented content.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SITE OWNER (Single Admin User)
-- This table stores the credentials and basic info for the single site owner.
CREATE TABLE IF NOT EXISTS site_owner (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'me' CHECK (id = 'me'), -- Enforces that the only ID is 'me'
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    source_username VARCHAR(255), -- Optional: For GitHub/GitLab integration if the owner links their account
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- THEMES
-- Themes are general and can be selected by the site owner for the portfolio.
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
-- Sections are predefined content blocks/types that the owner can use to build their page.
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL, -- e.g., 'hero', 'about', 'projects_list', 'contact_form'
    title VARCHAR(128) NOT NULL,    -- Default title for this section type
    type VARCHAR(32) NOT NULL DEFAULT 'text', -- Underlying type, e.g., 'text', 'gallery', 'custom_html'
    content JSONB,                  -- Default or template content for this section type
    display_order INTEGER NOT NULL DEFAULT 0, -- Default order if used in a generic list of section types
    is_visible BOOLEAN DEFAULT TRUE, -- Whether this section type is available for use
    theme_id INTEGER REFERENCES themes(id) ON DELETE SET NULL, -- Optional: a default theme association
    section_metadata JSONB,         -- Additional metadata about the section type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PROJECTS
-- These are the projects showcased by the site owner. They inherently belong to the owner.
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'WIP' CHECK (status IN ('ACTIVE', 'WIP', 'ARCHIVED', 'DEPRECATED')),
    source_type VARCHAR(50) DEFAULT 'manual' CHECK (source_type IN ('manual', 'github', 'gitlab')),
    source_username VARCHAR(255), -- Corresponds to site_owner.source_username if projects are synced
    source_repo VARCHAR(255),
    source_url VARCHAR(255),
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
    own_description TEXT,
    short_description TEXT,
    highlight TEXT,
    learnings TEXT,
    challenges TEXT,
    role TEXT,
    custom_tags TEXT[],
    show_on_portfolio BOOLEAN DEFAULT TRUE,
    team TEXT[],
    screenshots TEXT[],
    links JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SKILLS
-- These are the skills showcased by the site owner. They inherently belong to the owner.
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

-- OWNER PAGE LAYOUTS
-- Defines the structure and content arrangement of the owner's "About Me" page.
CREATE TABLE IF NOT EXISTS owner_page_layouts (
    id SERIAL PRIMARY KEY,
    owner_id VARCHAR(255) NOT NULL DEFAULT 'me' REFERENCES site_owner(id) ON DELETE CASCADE CHECK (owner_id = 'me'),
    section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    custom_title VARCHAR(255),      -- Override section's default title for this specific layout instance
    custom_content JSONB,           -- Override section's default content for this specific layout instance
    section_order INTEGER NOT NULL, -- Order of this section on the owner's page
    is_visible BOOLEAN DEFAULT TRUE,-- Visibility of this section instance on the page
    background_image_url VARCHAR(255),
    layout_variant VARCHAR(50),     -- e.g., 'full-width', 'two-column'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (owner_id, section_order) -- Ensures section_order is unique for the owner 'me'
);

-- OWNER PROFILE
-- Profile information specific to the site owner.
CREATE TABLE IF NOT EXISTS owner_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id VARCHAR(255) NOT NULL DEFAULT 'me' REFERENCES site_owner(id) ON DELETE CASCADE UNIQUE CHECK (owner_id = 'me'),
    display_name VARCHAR(255),
    bio TEXT,
    profile_picture_url VARCHAR(255),
    selected_theme_id INTEGER REFERENCES themes(id) ON DELETE SET NULL, -- Theme selected by the owner for their page
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI GENERATED CONTENT
-- Stores content generated by AI, associated with the owner and optionally a page layout section.
CREATE TABLE IF NOT EXISTS ai_generated_content (
    id SERIAL PRIMARY KEY,
    owner_id VARCHAR(255) NOT NULL DEFAULT 'me' REFERENCES site_owner(id) ON DELETE CASCADE CHECK (owner_id = 'me'),
    owner_page_layout_id INTEGER REFERENCES owner_page_layouts(id) ON DELETE SET NULL, -- Link to a specific part of the owner's page layout
    source_url VARCHAR(2048),       -- URL of the source data if applicable
    source_type VARCHAR(50) NOT NULL, -- e.g., 'github_readme', 'linkedin_profile', 'manual_input'
    summary TEXT NOT NULL,          -- The AI-generated summary or content
    raw_data_input JSONB,           -- The raw input data provided to the AI
    generation_parameters JSONB,    -- Parameters used for the AI generation
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note on seed.sql:
-- The seed.sql file will need to be updated to reflect these table and column name changes.
-- For example, any data for the old 'users' table should now target 'site_owner' with id 'me'.
-- Data for 'user_profiles' should target 'owner_profile' with owner_id 'me'.
-- Data for 'user_page_layouts' should target 'owner_page_layouts' with owner_id 'me'.
