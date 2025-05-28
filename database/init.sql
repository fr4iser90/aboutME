-- USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'admin',
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- THEMES
CREATE TABLE IF NOT EXISTS themes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    style_properties JSONB NOT NULL,
    thumbnail_url VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE
);

-- SECTIONS
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(128) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'text',
    content JSONB,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- USER PAGE LAYOUTS
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
    UNIQUE (user_id, section_order)
);

-- USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE, -- Ensure one profile per user
    display_name VARCHAR(255),
    bio TEXT,
    profile_picture_url VARCHAR(255),
    selected_theme_id INTEGER REFERENCES themes(id), -- Link to a chosen theme
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Optional: if projects are user-specific
    name VARCHAR(128) NOT NULL, -- Name should not be globally unique if user_id is present
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'WIP',
    archived_reason VARCHAR(255),
    details JSONB,
    github_url VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_project_name_user UNIQUE (user_id, name) -- Name unique per user
);

-- SKILLS
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Optional: if skills are user-specific
    category VARCHAR(64) NOT NULL,
    description TEXT,
    items JSONB,
    "order" INTEGER NOT NULL DEFAULT 0, -- Order within a user's skill categories
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI GENERATED CONTENT
CREATE TABLE IF NOT EXISTS ai_generated_content (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_page_layout_id INTEGER REFERENCES user_page_layouts(id) ON DELETE SET NULL, -- Optional: link to where it's used
    source_url VARCHAR(2048),
    source_type VARCHAR(50) NOT NULL, -- 'github_profile', 'webpage_url', 'raw_text'
    summary TEXT NOT NULL,
    raw_data_input JSONB, -- The actual input text/data given to the AI
    generation_parameters JSONB, -- AI model, prompt details, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adjusting original seed data to be compatible if needed, or creating new seed data for new tables.
-- For example, projects and skills might now need a user_id if they become user-specific.
-- The seed.sql file will need to be updated accordingly.
