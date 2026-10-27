-- ============================================================================
-- LaunchPad Database Schema Migration: Initial Core Domain & RLS Policies
-- Description: Establishes profiles, opportunity sources, canonical opportunities,
--              user application tracking, ingestion run telemetry, and strict RLS.
-- Migration Version: 20261027000001
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENUMS AND CUSTOM DOMAIN TYPES
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE opportunity_type AS ENUM (
    'internship',
    'full_time',
    'part_time',
    'contract',
    'hackathon',
    'conference',
    'workshop',
    'open_source',
    'fellowship'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE work_mode AS ENUM (
    'remote',
    'hybrid',
    'onsite'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE opportunity_status AS ENUM (
    'active',
    'closing_soon',
    'expired',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tracking_status AS ENUM (
    'SAVED',
    'PLANNING_TO_APPLY',
    'APPLIED',
    'INTERVIEWING',
    'OFFERED',
    'REJECTED',
    'WITHDRAWN',
    'COMPLETED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE source_type AS ENUM (
    'api',
    'rss',
    'partner',
    'curated'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ingestion_status AS ENUM (
    'running',
    'success',
    'partial_failure',
    'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 2. CORE TABLES
-- ============================================================================

-- A. User Profiles (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  education_level TEXT DEFAULT 'Undergraduate',
  graduation_year INTEGER DEFAULT 2027,
  college TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- B. Opportunity Sources (Source Registry)
CREATE TABLE IF NOT EXISTS public.opportunity_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source_type source_type NOT NULL DEFAULT 'api',
  base_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 30,
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- C. Canonical Opportunities
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT REFERENCES public.opportunity_sources(id) ON DELETE SET NULL,
  external_id TEXT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  opportunity_type opportunity_type NOT NULL DEFAULT 'internship',
  work_mode work_mode NOT NULL DEFAULT 'remote',
  location TEXT NOT NULL DEFAULT 'Remote',
  description TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  source_url TEXT,
  skills TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  stipend TEXT,
  experience_level TEXT DEFAULT 'Entry Level',
  deadline TIMESTAMPTZ,
  event_start_date TIMESTAMPTZ,
  event_end_date TIMESTAMPTZ,
  status opportunity_status NOT NULL DEFAULT 'active',
  first_discovered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_source_external_id UNIQUE (source_id, external_id)
);

-- D. User Opportunity Tracking (Personal Tracker)
CREATE TABLE IF NOT EXISTS public.user_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  status tracking_status NOT NULL DEFAULT 'SAVED',
  notes TEXT DEFAULT '',
  custom_title TEXT,
  custom_company TEXT,
  custom_deadline TIMESTAMPTZ,
  custom_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_user_opportunity UNIQUE (user_id, opportunity_id)
);

-- E. Ingestion Runs (Telemetry & Observability)
CREATE TABLE IF NOT EXISTS public.ingestion_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL REFERENCES public.opportunity_sources(id) ON DELETE CASCADE,
  status ingestion_status NOT NULL DEFAULT 'running',
  records_fetched INTEGER NOT NULL DEFAULT 0,
  records_created INTEGER NOT NULL DEFAULT 0,
  records_updated INTEGER NOT NULL DEFAULT 0,
  records_skipped INTEGER NOT NULL DEFAULT 0,
  error_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE & SEARCH
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_opportunities_status_deadline 
  ON public.opportunities (status, deadline);

CREATE INDEX IF NOT EXISTS idx_opportunities_type_loc_mode 
  ON public.opportunities (opportunity_type, location, work_mode);

CREATE INDEX IF NOT EXISTS idx_opportunities_fts 
  ON public.opportunities USING gin (to_tsvector('english', title || ' ' || company || ' ' || description));

CREATE INDEX IF NOT EXISTS idx_user_opportunities_user_status 
  ON public.user_opportunities (user_id, status);

CREATE INDEX IF NOT EXISTS idx_ingestion_runs_source 
  ON public.ingestion_runs (source_id, started_at DESC);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Opportunities Policies
DROP POLICY IF EXISTS "Public can view active opportunities" ON public.opportunities;
CREATE POLICY "Public can view active opportunities"
  ON public.opportunities FOR SELECT
  USING (status != 'archived');

DROP POLICY IF EXISTS "Service role manages opportunities" ON public.opportunities;
CREATE POLICY "Service role manages opportunities"
  ON public.opportunities FOR ALL
  USING (auth.role() = 'service_role');

-- Opportunity Sources Policies
DROP POLICY IF EXISTS "Public can view active sources" ON public.opportunity_sources;
CREATE POLICY "Public can view active sources"
  ON public.opportunity_sources FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Service role manages sources" ON public.opportunity_sources;
CREATE POLICY "Service role manages sources"
  ON public.opportunity_sources FOR ALL
  USING (auth.role() = 'service_role');

-- User Opportunities (Tracker) Policies
DROP POLICY IF EXISTS "Users can view own tracked opportunities" ON public.user_opportunities;
CREATE POLICY "Users can view own tracked opportunities"
  ON public.user_opportunities FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tracked opportunities" ON public.user_opportunities;
CREATE POLICY "Users can insert own tracked opportunities"
  ON public.user_opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tracked opportunities" ON public.user_opportunities;
CREATE POLICY "Users can update own tracked opportunities"
  ON public.user_opportunities FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tracked opportunities" ON public.user_opportunities;
CREATE POLICY "Users can delete own tracked opportunities"
  ON public.user_opportunities FOR DELETE
  USING (auth.uid() = user_id);

-- Ingestion Runs Policies
DROP POLICY IF EXISTS "Service role manages ingestion runs" ON public.ingestion_runs;
CREATE POLICY "Service role manages ingestion runs"
  ON public.ingestion_runs FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- 5. AUTOMATIC TIMESTAMP & SIGNUP TRIGGERS
-- ============================================================================

-- Function to update updated_at automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_opportunities_updated_at ON public.opportunities;
CREATE TRIGGER set_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_user_opportunities_updated_at ON public.user_opportunities;
CREATE TRIGGER set_user_opportunities_updated_at
  BEFORE UPDATE ON public.user_opportunities
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger to automatically provision user profile upon auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
