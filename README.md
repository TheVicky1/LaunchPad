# 🚀 LaunchPad

> **"Your next opportunity starts here."**
> A unified opportunity discovery platform for students to discover tech internships, open-source programs, and location-based hackathons.

---

## 🌟 Product Vision & Core Philosophy

Students currently have to navigate dozens of disconnected career portals, community Discord servers, GitHub organizations, and event platforms to find opportunities. **Launchpad** solves this by consolidating all student opportunities into one unified, fast, and accessible platform.

**Core Philosophy:**  
`Discover` ➔ `Prepare` ➔ `Apply` ➔ `Track` ➔ `Grow`

---

## 🏛️ The Three Core Product Pillars

### 1. 💼 Jobs & Internships
- **Unified Listings**: Software engineering, frontend, backend, mobile, data, and devops roles from companies like Google, Microsoft, Amazon, JPMorganChase, Postman, Razorpay, Uber, and emerging startups.
- **Rich Filtering**: Filter by keyword search, category (*Internship*, *Full-time*, *Contract*), work mode (*Remote*, *Hybrid*, *On-site*), and skill tags (*React*, *Python*, *Java*, *Go*, *Docker*, etc.).
- **Direct Application**: Verified official application links opening directly in new tabs.
- **Detail Modals**: In-depth view showing responsibilities, requirements, stipend, and last-verified timestamps.

### 2. 🌐 Open Source & Contribution Programs
- **Structured Programs**: Google Summer of Code (GSoC), LFX Mentorship, GirlScript Summer of Code (GSSoC), Outreachy, GitHub Octernships, and Hacktoberfest.
- **Curated Repositories**: High-impact open source repositories with curated beginner-friendly tags (*good first issue*).
- **Interactive 6-Step Guide**: Embedded "Getting Started with Open Source" roadmap breaking down repo selection, reading READMEs, finding issues, forking, branching, and opening pull requests.

### 3. 🎪 Location-Based Events & Hackathons
- **City-Specific Discovery**: Real location-based querying across **Bengaluru** (default), **Hyderabad**, **Mumbai**, **Delhi**, **Pune**, and **Remote / Online**.
- **Diverse Formats**: Hackathons, GDG DevFests, AWS Community Days, technical workshops, and developer meetups.
- **Calendar-style Badges**: Clear event dates, venue details, and registration links.

---

## 📋 Personal Opportunity Tracker

- **Multi-Stage Pipeline**: Track applications across 6 stages:
  - `Saved`
  - `Preparing`
  - `Applied`
  - `Interviewing`
  - `Completed`
  - `Rejected`
- **Dual-Layer Persistence**: State is automatically synchronized with the backend REST API and persisted in browser `localStorage`, ensuring data survives reloads and operates even in offline mode.
- **Personal Notes**: Record interview dates, referral names, or portfolio submission links directly on any tracked item.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18
  - Vite 6
  - Tailwind CSS 3
  - Lucide React (feather-style minimalist icons)
  - React Router DOM 6
  - Fetch API
- **Backend**:
  - Node.js (v20+)
  - Express.js
  - RESTful API design with CORS & Centralized Error Handler
- **Database & Persistence**:
  - MongoDB & Mongoose schemas with compound indexes
  - Graceful In-Memory & Seed Dataset Fallback (ensures 100% functionality even when MongoDB is offline)

---

## 📁 Project Structure

```text
LaunchPad/
├── client/                      # Frontend React + Vite application
│   ├── src/
│   │   ├── components/          # Reusable UI components (Cards, Modals, Badges, etc.)
│   │   ├── context/             # AuthContext & TrackerContext
│   │   ├── pages/               # Dashboard, Jobs, Open Source, Events, Tracker, Profile
│   │   ├── services/            # API client service layer
│   │   ├── App.jsx              # Main router & layout shell
│   │   ├── index.css            # Tailwind directives & styles
│   │   └── main.jsx             # React DOM entry
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                      # Backend Node.js + Express API
│   ├── src/
│   │   ├── config/              # Database connection & status
│   │   ├── controllers/         # Express controllers (Opportunities, Events, OSS, User, Auth)
│   │   ├── middleware/          # Centralized error handler & Auth middleware
│   │   ├── models/              # Mongoose models (Opportunity, Event, OSS, User, Tracker)
│   │   ├── routes/              # Express API route modules
│   │   ├── seed/                # Curated seed datasets & seed runner
│   │   ├── services/            # StoreService (Unified MongoDB & in-memory data store)
│   │   └── app.js               # Express application setup
│   ├── package.json
│   └── server.js                # Server entry point (port 5000)
├── .env.example
├── .gitignore
├── package.json                 # Monorepo orchestration scripts
└── README.md
```

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or later)
- [npm](https://www.npmjs.com/) (v9.0.0 or later)
- (Optional) Local MongoDB or MongoDB Atlas URI

### 2. Installation
Clone the repository and install all dependencies:

```bash
# Clone repository
git clone https://github.com/TheVicky1/LaunchPad.git
cd LaunchPad

# Install root, backend, and frontend dependencies
npm run install:all
```

Alternatively, install individually:
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` in the `server/` directory:

```bash
# In server directory
cp .env.example .env
```

Default variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/launchpad
CLIENT_URL=http://localhost:5173
JWT_SECRET=launchpad_super_secure_jwt_secret_key_2026
```

> **Note**: If `MONGODB_URI` is left unconfigured or MongoDB is not running locally, the server will automatically activate the **curated in-memory fallback dataset** with zero crashes and full API capabilities.

### 4. Running the Application

You can start both frontend and backend concurrently from the root directory:

```bash
npm run dev
```

Or run them in separate terminals:

```bash
# Terminal 1 - Backend API (runs on port 5000)
npm run server

# Terminal 2 - Frontend Client (runs on port 5173)
npm run client
```

Open your browser at: **`http://localhost:5173`**

### 5. Seeding MongoDB (Optional)
If you have a live MongoDB instance and want to populate it with the 45+ seed records:

```bash
npm run seed
```

---

## 📡 API Reference Endpoints

### System Health
- `GET /api/health` — Returns server health status and active database mode (`mongodb` vs `in-memory-demo`).

### Opportunities (Jobs & Internships)
- `GET /api/opportunities` — Query opportunities with filters:
  - `search` (keyword search across title, company, description, skills)
  - `category` (`Internship`, `Full-time`, `Contract`)
  - `location` (e.g. `Bengaluru`, `Hyderabad`, `Remote`)
  - `mode` (`Remote`, `Hybrid`, `On-site`)
  - `skills` (comma-separated skills)
  - `sort` (`newest`, `deadline`, `company`)
  - `page`, `limit` (pagination)
- `GET /api/opportunities/featured` — Top 4 highlighted opportunities.
- `GET /api/opportunities/:id` — Details of a specific opportunity.

### Events & Hackathons
- `GET /api/events` — Query events with filters:
  - `city` (`Bengaluru`, `Hyderabad`, `Mumbai`, `Delhi`, `Pune`, `Remote`)
  - `category` (`Hackathon`, `Conference`, `Workshop`, `Meetup`)
  - `mode` (`Offline`, `Online`, `Hybrid`)
  - `search` (keyword search across title, organizer, tags)
  - `sort` (`date`, `newest`)
- `GET /api/events/:id` — Specific event details.

### Open Source Programs
- `GET /api/open-source` — Query programs with filters:
  - `technology` (e.g. `Python`, `JavaScript`, `Go`, `Rust`)
  - `difficulty` (`Beginner`, `Intermediate`, `Advanced`)
  - `beginnerFriendly` (`true` / `false`)
  - `programStatus` (`Open`, `Upcoming`)
- `GET /api/open-source/:id` — Specific program details.

### User Opportunity Tracking
- `GET /api/me/opportunities` — Fetch tracked opportunities for current user.
- `POST /api/me/opportunities` — Save/bookmark an opportunity.
- `PATCH /api/me/opportunities/:id` — Update application status (`Preparing`, `Applied`, etc.) or notes.
- `DELETE /api/me/opportunities/:id` — Remove an item from tracking.

### User Profile
- `GET /api/auth/profile` — Fetch student profile.
- `PUT /api/auth/profile` — Update skills, interests, and graduation year.

---

## 🧪 Testing & Verification

All 5 core user flows were tested and verified via automated end-to-end browser walkthrough:
1. **Flow A (Find Internship)**: Searched `software`, filtered by `Internship`, verified cards, opened detail modal, verified external links.
2. **Flow B (Discover Open Source)**: Explored programs, interacted with the 6-step roadmap, filtered by `Beginner Friendly Only`.
3. **Flow C (Discover Local Events)**: Tested real city filtering across `Bengaluru` and `Hyderabad`, verified hackathons.
4. **Flow D (Track Opportunity)**: Saved items, changed stage to `Interviewing`, added notes, refreshed browser, and verified persistent state.
5. **Flow E (Empty Search)**: Searched nonexistent terms, verified custom `EmptyState` component, clicked `Clear All Filters` and restored list.
