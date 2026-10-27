# ADR-001: Adoption of Supabase as Primary Backend Platform

## Status
Accepted

## Context
LaunchPad originally began as an Express.js and MongoDB application with custom JWT issuance and password hashing. While suitable for initial prototyping, this custom architecture introduced critical maintenance and security liabilities:
1. **Custom Auth Maintenance:** Hand-rolled JWT generation, token refresh, and password salting required manual security patches (as seen in Phase 1 and Phase 2 security audits).
2. **Lack of Native Row-Level Security:** MongoDB required every single application route to explicitly check `userId` matching. Any missing filter in an API endpoint would immediately leak private student notes and application data across users.
3. **Dual Stack Complexity:** Operating MongoDB, Express, and an external OAuth provider creates excessive operational burden for an open-source project.

## Decision
We adopt **Supabase (Managed PostgreSQL + Supabase Auth + Row Level Security)** as the primary backend platform for LaunchPad.
- **Database:** PostgreSQL becomes the single source of truth for canonical opportunities, user profiles, tracking states, and ingestion telemetry.
- **Authentication:** Supabase Auth replaces custom JWT middleware and endpoints, handling email/password authentication, Google OAuth, session refresh, and password recovery.
- **Authorization:** PostgreSQL Row Level Security (RLS) policies enforce data isolation directly at the database engine level (`auth.uid() = user_id`).
- **Direct Client Access with RLS:** The client can query public opportunity listings and private user tracking records directly via the Supabase client without an intermediate Express proxy.

## Consequences
### Positive
- **Guaranteed Tenant Isolation:** Private student notes and trackers cannot be queried or updated by unauthorized users, even if frontend code is modified.
- **Relational Integrity:** Foreign keys, enums, check constraints, and unique indexes guarantee database consistency.
- **Full-Text Search:** Built-in PostgreSQL `tsvector` and GIN indexing support fast full-text opportunity search without external search clusters (Elasticsearch/Algolia).
- **Contributor Ergonomics:** Local development runs reproducibly via the Supabase CLI with declarative SQL migrations and seeds.

### Negative / Trade-offs
- **Migration Effort:** Existing Mongoose models, controllers, and in-memory mock stores must be methodically migrated to PostgreSQL schemas.
- **Database Tooling Requirement:** Contributors must install Docker and Supabase CLI for local database emulation, or connect to a free Supabase cloud development project.
