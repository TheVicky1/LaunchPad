import test from 'node:test';
import assert from 'node:assert/strict';

// Independent unit test of Supabase configuration status validation logic
const validateSupabaseEnv = (url, key) => {
  if (!url || !url.startsWith('http') || url.includes('your-project-id')) {
    return {
      configured: false,
      reason: 'VITE_SUPABASE_URL is unconfigured or using placeholder'
    };
  }
  if (!key || key.includes('placeholder') || key.length < 20) {
    return {
      configured: false,
      reason: 'VITE_SUPABASE_ANON_KEY is unconfigured or using placeholder'
    };
  }
  return { configured: true, reason: 'Valid configuration' };
};

// Safe link validator for untrusted external opportunities
const isSafeExternalUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

test('Supabase Client Configuration & Security Validation Suite', async (t) => {
  await t.test('1. Rejects missing or empty Supabase URL', () => {
    const res = validateSupabaseEnv('', 'valid-anon-key-that-is-long-enough');
    assert.equal(res.configured, false);
    assert.match(res.reason, /VITE_SUPABASE_URL/);
  });

  await t.test('2. Rejects placeholder project ID in Supabase URL', () => {
    const res = validateSupabaseEnv('https://your-project-id.supabase.co', 'valid-anon-key-that-is-long-enough');
    assert.equal(res.configured, false);
    assert.match(res.reason, /placeholder/);
  });

  await t.test('3. Rejects placeholder or trivial Supabase Anon Key', () => {
    const res = validateSupabaseEnv('https://xyzcompany.supabase.co', 'your-supabase-public-anon-key-placeholder');
    assert.equal(res.configured, false);
    assert.match(res.reason, /VITE_SUPABASE_ANON_KEY/);
  });

  await t.test('4. Accepts valid Supabase URL and production key', () => {
    const res = validateSupabaseEnv('https://app-xyz123.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid_anon_token_value_sample');
    assert.equal(res.configured, true);
  });

  await t.test('5. isSafeExternalUrl validates legitimate application URLs', () => {
    assert.ok(isSafeExternalUrl('https://careers.google.com/jobs/results/'));
    assert.ok(isSafeExternalUrl('http://localhost:5173'));
  });

  await t.test('6. isSafeExternalUrl blocks javascript:, data:, and malformed schemes', () => {
    assert.equal(isSafeExternalUrl('javascript:alert(1)'), false);
    assert.equal(isSafeExternalUrl('data:text/html,<script>alert(1)</script>'), false);
    assert.equal(isSafeExternalUrl('not-a-valid-url'), false);
    assert.equal(isSafeExternalUrl(''), false);
    assert.equal(isSafeExternalUrl(null), false);
  });
});
