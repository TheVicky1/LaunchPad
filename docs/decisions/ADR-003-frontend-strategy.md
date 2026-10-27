# ADR-003: Frontend Architecture & Phased Next.js Evaluation

## Status
Accepted

## Context
The current LaunchPad frontend is a Single Page Application (SPA) built with React 18, Vite 6, Tailwind CSS 3, and React Router DOM.
The Master Engineering Charter requested an evaluation of whether migrating to **Next.js with TypeScript and App Router** is justified.

### Evaluation of Requirements for Opportunity Discovery Platforms:
1. **Public Discoverability & SEO:** Opportunity listings (internships, hackathons, open source programs) are inherently public, indexable content. An SPA cannot render meta tags or structured search schema on a per-opportunity basis for search engines (Google, Bing) or social card previews (Twitter Cards, OpenGraph).
2. **First Load Performance & LCP:** Server-Side Rendering (SSR) delivers pre-rendered HTML on the initial hit, resulting in faster Largest Contentful Paint (LCP) for users on slower mobile connections.
3. **Migration Risk:** The current Vite application is fully functional, highly responsive, and passes all build checks. Blindly discarding the entire frontend right now would destroy verified functionality before the Supabase foundation and ingestion pipelines are operational.

## Decision
We adopt a **phased frontend evolution strategy**:
1. **Phase 1 (Immediate - Foundation & Backend Pivot):** Retain the existing Vite React frontend while pivoting the data layer to Supabase. This guarantees that user authentication, opportunity browsing, and personal tracking remain continuously functional without regressions.
2. **Phase 2 (Milestone 2/3 - Supabase Client Integration):** Replace existing fetch calls in `client/src/services/api.js` with direct Supabase client queries (`@supabase/supabase-js`), benefiting immediately from RLS and Supabase Auth.
3. **Phase 3 (Dedicated Migration Milestone):** Once the database schema, RLS policies, and first ingestion source are proven in production, migrate the UI pages to a Next.js App Router project (`apps/web`). This achieves dynamic OpenGraph previews, SSR for public job/event detail pages, and server components.

## Consequences
### Positive
- Prevents the classic software trap of an all-at-once rewrite that stalls development for months.
- Keeps the current working product fully testable and demonstrable at every step.
- Delivers the exact architectural benefits of Next.js (SEO, SSR, metadata generation) when the data models are mature and stable.

### Negative / Trade-offs
- Postpones dynamic SEO metadata until Phase 3.
- The UI layer will undergo one transitional refactoring when migrating components into Next.js App Router conventions.
