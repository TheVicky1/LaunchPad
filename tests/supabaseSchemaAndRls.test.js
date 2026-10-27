import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const schemaPath = path.resolve(process.cwd(), 'supabase/migrations/20261027000001_initial_schema.sql');

test('Supabase Schema & RLS Policy Specification Suite', async (t) => {
  await t.test('1. Migration file exists and is non-empty', () => {
    assert.ok(fs.existsSync(schemaPath), 'Migration file must exist at supabase/migrations/20261027000001_initial_schema.sql');
    const content = fs.readFileSync(schemaPath, 'utf8');
    assert.ok(content.length > 500, 'Migration file must contain comprehensive DDL definitions');
  });

  const sql = fs.readFileSync(schemaPath, 'utf8');

  await t.test('2. Schema defines all required custom domain ENUMs', () => {
    assert.ok(sql.includes('CREATE TYPE opportunity_type AS ENUM'), 'opportunity_type enum must be defined');
    assert.ok(sql.includes('CREATE TYPE work_mode AS ENUM'), 'work_mode enum must be defined');
    assert.ok(sql.includes('CREATE TYPE opportunity_status AS ENUM'), 'opportunity_status enum must be defined');
    assert.ok(sql.includes('CREATE TYPE tracking_status AS ENUM'), 'tracking_status enum must be defined');
    assert.ok(sql.includes('CREATE TYPE source_type AS ENUM'), 'source_type enum must be defined');
    assert.ok(sql.includes('CREATE TYPE ingestion_status AS ENUM'), 'ingestion_status enum must be defined');
  });

  await t.test('3. Schema defines core tables with primary keys and foreign keys', () => {
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.profiles'), 'profiles table must exist');
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.opportunity_sources'), 'opportunity_sources table must exist');
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.opportunities'), 'opportunities table must exist');
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.user_opportunities'), 'user_opportunities table must exist');
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.ingestion_runs'), 'ingestion_runs table must exist');

    assert.ok(sql.includes('REFERENCES auth.users(id) ON DELETE CASCADE'), 'profiles & user_opportunities must reference auth.users(id)');
    assert.ok(sql.includes('REFERENCES public.opportunities(id) ON DELETE CASCADE'), 'user_opportunities must reference opportunities(id)');
  });

  await t.test('4. Schema guarantees unique constraints for deduplication', () => {
    assert.ok(
      sql.includes('CONSTRAINT uq_source_external_id UNIQUE (source_id, external_id)'),
      'Unique constraint on (source_id, external_id) required for idempotent ingestion'
    );
    assert.ok(
      sql.includes('CONSTRAINT uq_user_opportunity UNIQUE (user_id, opportunity_id)'),
      'Unique constraint on (user_id, opportunity_id) required for personal tracking idempotency'
    );
  });

  await t.test('5. Row Level Security (RLS) is enabled across all tables', () => {
    assert.ok(sql.includes('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;'), 'RLS must be enabled on profiles');
    assert.ok(sql.includes('ALTER TABLE public.opportunity_sources ENABLE ROW LEVEL SECURITY;'), 'RLS must be enabled on opportunity_sources');
    assert.ok(sql.includes('ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;'), 'RLS must be enabled on opportunities');
    assert.ok(sql.includes('ALTER TABLE public.user_opportunities ENABLE ROW LEVEL SECURITY;'), 'RLS must be enabled on user_opportunities');
    assert.ok(sql.includes('ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;'), 'RLS must be enabled on ingestion_runs');
  });

  await t.test('6. User tracking policies strictly enforce user data isolation (auth.uid() = user_id)', () => {
    assert.ok(sql.includes('CREATE POLICY "Users can view own tracked opportunities"'), 'Must have SELECT policy for tracked opportunities');
    assert.ok(sql.includes('USING (auth.uid() = user_id)'), 'Policy must restrict read access to record owner');
    assert.ok(sql.includes('WITH CHECK (auth.uid() = user_id)'), 'Policy must restrict insert/update mutations to record owner');
  });

  await t.test('7. Profiles policies strictly enforce profile ownership (auth.uid() = id)', () => {
    assert.ok(sql.includes('CREATE POLICY "Users can view own profile"'), 'Must have SELECT policy for profiles');
    assert.ok(sql.includes('CREATE POLICY "Users can update own profile"'), 'Must have UPDATE policy for profiles');
    assert.ok(sql.includes('USING (auth.uid() = id)'), 'Profile query must restrict to user id');
  });

  await t.test('8. Canonical opportunities and sources restrict mutations to service_role', () => {
    assert.ok(sql.includes('CREATE POLICY "Service role manages opportunities"'), 'Opportunities must restrict mutations to service_role');
    assert.ok(sql.includes('USING (auth.role() = \'service_role\')'), 'Must enforce service_role check on opportunity mutations');
    assert.ok(sql.includes('CREATE POLICY "Public can view active opportunities"'), 'Public users can only read active opportunities');
  });

  await t.test('9. Full-text search and performance indexes are defined', () => {
    assert.ok(sql.includes('to_tsvector(\'english\', title || \' \' || company || \' \' || description)'), 'GIN FTS index must be defined');
    assert.ok(sql.includes('idx_opportunities_status_deadline'), 'Compound status/deadline index must exist');
    assert.ok(sql.includes('idx_user_opportunities_user_status'), 'User status index must exist');
  });

  await t.test('10. Automatic updated_at and user provisioning triggers exist', () => {
    assert.ok(sql.includes('CREATE OR REPLACE FUNCTION public.handle_updated_at()'), 'Timestamp trigger function must exist');
    assert.ok(sql.includes('CREATE OR REPLACE FUNCTION public.handle_new_user()'), 'User signup profile provisioning trigger must exist');
    assert.ok(sql.includes('AFTER INSERT ON auth.users'), 'Trigger must fire on auth.users insert');
  });
});
