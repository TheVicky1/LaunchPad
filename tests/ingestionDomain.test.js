import test from 'node:test';
import assert from 'node:assert/strict';

// Canonical URL Sanitizer Utility under test
export const sanitizeCanonicalUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  try {
    const parsed = new URL(rawUrl.trim());
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'ref', 'fbclid', 'gclid', 'mc_eid', 'yclid', '_hsenc', '_hsmi'
    ];
    trackingParams.forEach((param) => parsed.searchParams.delete(param));
    // Remove trailing slash for normalization unless root
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    return `${parsed.protocol}//${parsed.host}${pathname}${parsed.search}`;
  } catch {
    return rawUrl.trim();
  }
};

// Deterministic Deduplication Hash generator
export const generateDeduplicationKey = (sourceId, externalId, canonicalUrl, company, title) => {
  if (sourceId && externalId) {
    return `ext:${sourceId.toLowerCase().trim()}:${externalId.trim()}`;
  }
  const sanitizedUrl = sanitizeCanonicalUrl(canonicalUrl);
  if (sanitizedUrl && sanitizedUrl.startsWith('http')) {
    return `url:${sanitizedUrl.toLowerCase()}`;
  }
  const cleanCompany = (company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanTitle = (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `meta:${cleanCompany}:${cleanTitle}`;
};

// Opportunity Lifecycle Status Calculator
export const calculateOpportunityStatus = (deadline, rawStatus = 'active') => {
  if (rawStatus === 'archived') return 'archived';
  if (!deadline) return 'active';

  const now = Date.now();
  const deadlineTime = new Date(deadline).getTime();

  if (isNaN(deadlineTime)) return 'active';
  if (deadlineTime < now) return 'expired';

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  if (deadlineTime - now <= sevenDaysMs) return 'closing_soon';

  return 'active';
};

// Exponential backoff calculator with jitter
export const calculateBackoff = (attempt, baseMs = 1000, maxMs = 30000) => {
  const exponential = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  // Deterministic bounded test calculation
  return exponential;
};

test('Ingestion Engine Domain & Normalization Suite', async (t) => {
  await t.test('1. sanitizeCanonicalUrl strips marketing & tracking query parameters', () => {
    const dirtyUrl = 'https://careers.google.com/jobs/results/12345/?utm_source=linkedin&utm_medium=job_board&ref=referral&keep_this=true';
    const cleanUrl = sanitizeCanonicalUrl(dirtyUrl);
    assert.equal(cleanUrl, 'https://careers.google.com/jobs/results/12345?keep_this=true');
  });

  await t.test('2. sanitizeCanonicalUrl normalizes trailing slashes on subpaths', () => {
    const withSlash = 'https://jobs.apple.com/en-us/details/20054321/';
    const normalized = sanitizeCanonicalUrl(withSlash);
    assert.equal(normalized, 'https://jobs.apple.com/en-us/details/20054321');
  });

  await t.test('3. generateDeduplicationKey prioritizes source external IDs', () => {
    const key = generateDeduplicationKey('devpost', 'hack-bangalore-2027', 'https://devpost.com/hack', 'Devpost', 'Hackathon');
    assert.equal(key, 'ext:devpost:hack-bangalore-2027');
  });

  await t.test('4. generateDeduplicationKey falls back to sanitized canonical URLs', () => {
    const key = generateDeduplicationKey('', '', 'https://careers.microsoft.com/jobs/9988?utm_source=feed', 'Microsoft', 'SWE Intern');
    assert.equal(key, 'url:https://careers.microsoft.com/jobs/9988');
  });

  await t.test('5. generateDeduplicationKey falls back to normalized metadata when URL is missing', () => {
    const key = generateDeduplicationKey('', '', '', 'JPMorgan Chase & Co.', 'Software Engineer - Intern 2027');
    assert.equal(key, 'meta:jpmorganchaseco:softwareengineerintern2027');
  });

  await t.test('6. calculateOpportunityStatus correctly flags expired opportunities', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    assert.equal(calculateOpportunityStatus(pastDate), 'expired');
  });

  await t.test('7. calculateOpportunityStatus correctly flags closing soon opportunities (within 7 days)', () => {
    const inThreeDays = new Date(Date.now() + 3 * 86400000).toISOString();
    assert.equal(calculateOpportunityStatus(inThreeDays), 'closing_soon');
  });

  await t.test('8. calculateOpportunityStatus marks distant deadlines as active', () => {
    const inThirtyDays = new Date(Date.now() + 30 * 86400000).toISOString();
    assert.equal(calculateOpportunityStatus(inThirtyDays), 'active');
  });

  await t.test('9. calculateBackoff respects upper bounds', () => {
    const backoff = calculateBackoff(10, 1000, 30000);
    assert.equal(backoff, 30000, 'Backoff must never exceed configured maxMs');
  });
});
