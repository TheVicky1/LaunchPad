# 🚀 LaunchPad

> **"Your next opportunity starts here."**  
> An open-source, unified opportunity discovery and personal tracking platform.

---

## 🌟 Product Vision & Core Philosophy

Today, people looking for internships, tech jobs, hackathons, open-source contribution programs, and technical events must manually search across fragmented platforms. Information is duplicated, stale, difficult to filter, and often discovered after application deadlines have expired.

**LaunchPad** unifies discovery across multiple legitimate sources, normalizes opportunities into a consistent schema, provides fast deterministic search and filtering, and offers a personal application tracker with guaranteed user data privacy.

**Long-Term Promise:**  
`One platform. Multiple opportunity sources. Reliable discovery. Personal tracking.`

---

## 🏛️ Core Product Pillars

### 1. 💼 Jobs & Internships
- **Unified Listings:** Software engineering, frontend, backend, product, and data opportunities from top global companies and high-growth startups.
- **Deterministic Filtering:** Keyword search, category (*Internship*, *Full-time*, *Contract*), work mode (*Remote*, *Hybrid*, *On-site*), location, and skill tags (*React*, *Python*, *Java*, *Go*, *Docker*, etc.).
- **Direct Application:** Canonical links to verified career portals.
- **Detail Modals:** Complete view with role requirements, compensation/stipend, and verified timestamps.

### 2. 🌐 Open Source & Mentorship Programs
- **Structured Initiatives:** Google Summer of Code (GSoC), LFX Mentorship, Outreachy, and open source fellowship programs.
- **Beginner-Friendly Discovery:** Direct access to repositories welcoming first-time contributors.
- **Interactive Roadmap:** Embedded 6-step guide covering issue discovery, git workflows, forking, and pull request etiquette.

### 3. 🎪 Location-Based Events & Hackathons
- **City-Specific Discovery:** Dedicated location querying across Bengaluru, Hyderabad, Mumbai, Delhi, Pune, and Remote.
- **Diverse Formats:** College hackathons, technical conferences, hands-on workshops, and community meetups.
- **Schedule Awareness:** Direct registration links and deadline calendars.

---

## 📋 Personal Opportunity Tracker

- **Multi-Stage Pipeline:** Track progress across `SAVED`, `PLANNING_TO_APPLY`, `APPLIED`, `INTERVIEWING`, `OFFERED`, `REJECTED`, `WITHDRAWN`, and `COMPLETED`.
- **Database Row Level Security (RLS):** Private notes and application statuses are protected directly in PostgreSQL (`auth.uid() = user_id`). No user can access or mutate another student's tracker data.
- **Session Restoration:** Synchronized across devices via Supabase Auth.

---

## 🛠️ Technology Stack

- **Frontend:**
  - React 18 & Vite 6
  - Tailwind CSS 3
  - Lucide React minimalist icons
  - React Router DOM 6
  - `@supabase/supabase-js` client
- **Database & Identity (Primary Platform):**
  - **Supabase PostgreSQL 15+** with relational foreign keys, check constraints, and compound indexes
  - **Supabase Auth** with email/password authentication, session management, and Google OAuth
  - **Row Level Security (RLS)** enforcing tenant isolation directly at the database engine level
  - **PostgreSQL Full-Text Search (FTS)** via GIN indexing and `tsvector`
- **Background Ingestion Worker (Scheduled):**
  - Decoupled background service running isolated `SourceAdapter` implementations
  - Deterministic deduplication (canonical URL, source external ID, title/company matching)
  - Telemetry and health tracking recorded in `ingestion_runs`

---

## 📁 Repository Structure

```text
LaunchPad/
├── client/                      # Frontend React + Vite SPA (migrating to Next.js in Phase 3)
│   ├── src/
│   │   ├── components/          # Reusable UI components (Cards, Modals, Badges, Nav)
│   │   ├── context/             # AuthContext (Supabase Auth) & TrackerContext
│   │   ├── lib/                 # Supabase client initialization & validation
│   │   ├── pages/               # Dashboard, Jobs, Open Source, Events, Tracker, Profile, Auth
│   │   ├── services/            # Supabase data services (Opportunities, Tracking, Profile)
│   │   ├── App.jsx              # Main router & application layout
│   │   └── main.jsx             # React entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── supabase/                    # Supabase database configuration & migrations
│   ├── config.toml              # Local Supabase CLI configuration
│   ├── migrations/              # Version-controlled SQL migrations (single source of truth)
│   └── seed.sql                 # Deterministic local seed data
├── docs/
│   ├── architecture/            # System overview & ingestion architecture
│   └── decisions/               # Architecture Decision Records (ADRs)
├── CONTRIBUTING.md              # Contributor guide & source adapter specifications
├── SECURITY.md                  # Security policies & vulnerability disclosure
├── .env.example                 # Sanitized environment variable placeholders
└── package.json                 # Workspace scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v20.x or higher)
- **npm** (v10.x or higher)
- **Docker Desktop** (optional, for local Supabase CLI execution)

### 2. Environment Setup
Copy the environment example file and configure your Supabase project credentials:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Local Supabase Setup (Optional with Supabase CLI)
To run Supabase locally with Docker:
```bash
# Start local PostgreSQL, Auth, and Studio
npx supabase start

# Apply declarative schema migrations and seed data
npx supabase db reset
```

### 4. Running the Web Application
```bash
# Install dependencies
npm run install:client

# Start Vite development server
npm run dev
```

Visit `http://localhost:5173` to explore LaunchPad.

### 5. Running Build Checks
```bash
# Build production client bundle
npm run build
```

---

## 📄 License & Open-Source Standards

LaunchPad is licensed under the MIT License. Contributions following our architectural charter and security guidelines are warmly welcomed! See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.
