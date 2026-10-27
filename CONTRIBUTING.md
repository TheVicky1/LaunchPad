# Contributing to LaunchPad

Thank you for your interest in contributing to **LaunchPad**! LaunchPad is an open-source, unified opportunity discovery and personal tracking platform.

We value thoughtful, well-tested contributions that prioritize data quality, security, and developer ergonomics.

---

## Code of Conduct

By participating in this project, you agree to treat everyone with respect, adhere to open-source collaboration best practices, and maintain a harassment-free environment.

---

## How to Get Started

### 1. Prerequisites
- **Node.js** (v20.x or higher)
- **npm** (v10.x or higher)
- **Docker Desktop** (optional, recommended for running local Supabase via CLI)
- **Git**

### 2. Local Setup
```bash
# 1. Clone the repository
git clone https://github.com/TheVicky1/LaunchPad.git
cd LaunchPad

# 2. Install workspace dependencies
npm run install:all

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your local or cloud Supabase credentials

# 4. Start local development
npm run dev
```

---

## Adding a New Opportunity Source

We welcome new source adapters for legitimate, public opportunities! Before contributing an adapter:
1. **Verify Authorization:** Ensure the external site provides an official public API, RSS feed, or explicitly permits programmatic indexing. Never submit adapters that scrape sites prohibiting automation (e.g. LinkedIn).
2. **Implement the Adapter Contract:**
   - Adhere to the `SourceAdapter` interface in `docs/architecture/ingestion-architecture.md`.
   - Implement rate limiting, error handling, and field normalization.
3. **Include Unit Tests & Fixtures:** Provide static sample response fixtures; never run automated tests against live external websites.

---

## Development Principles
1. **Useful before complicated:** Only add features that solve real problems for students and job seekers.
2. **Never commit secrets:** Never commit API keys, JWT secrets, or Supabase service-role keys.
3. **Write tests:** Verify that your changes pass existing unit tests, linting, and build steps (`npm test` in `server/`, `npm run build` in `client/`).
4. **Make focused Pull Requests:** Keep PRs small, well-described, and tied to an issue.
