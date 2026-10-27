# ADR-002: Ingestion Engine Architecture & Adapter Pattern

## Status
Accepted

## Context
LaunchPad cannot depend on manual data entry to maintain a valuable opportunity discovery platform. However, building hardcoded scrapers scattered across routes or running web scraping jobs inside interactive request handlers introduces severe performance and legal risks:
1. Scraping inside request handlers leads to request timeouts, server blocking, and crashes.
2. Hardcoding scraping scripts without a uniform adapter interface makes adding new sources difficult and error-prone.
3. Blind scraping violates Terms of Service of platforms like LinkedIn and results in IP bans and stale data.

## Decision
We establish a **decoupled, source-agnostic Ingestion Worker** utilizing the **Adapter Pattern**:
1. **Isolated Execution:** Ingestion executes in a separate scheduled background process, completely isolated from user-facing web requests.
2. **Adapter Contract:** Every source implements a standardized `SourceAdapter` interface responsible only for fetching raw data and mapping it to a normalized schema.
3. **Shared Ingestion Services:** Validation, canonical URL sanitization, deduplication, and persistence are centralized in reusable pipeline utilities.
4. **Idempotent Upserts:** Data is persisted using PostgreSQL `ON CONFLICT` constraints, ensuring repeat executions never duplicate records.
5. **Observability via `ingestion_runs`:** Every run logs execution duration, record counts (fetched, created, updated, skipped), and errors.

## Consequences
### Positive
- Adding a new opportunity source requires only writing a single isolated adapter and registering it in the adapter registry.
- Zero impact on user response times; background jobs run independently.
- High observability: administrators and open-source contributors can immediately see which sources are healthy and which are failing.

### Negative / Trade-offs
- Requires a separate execution runtime (e.g. Node worker, GitHub Actions cron, or serverless scheduled functions) in production.
