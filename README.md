# UniConnect · Kyungdong University Digital Campus

UniConnect is a production-grade social platform that connects Kyungdong University students, faculty, and departments through a curated activity feed, collaborative groups, and a resource sharing hub. The stack combines a modern React + Tailwind interface with an Express/Neon PostgreSQL backend, session-based authentication, and secure file workflows.

This deployment was formally characterized in a published research paper:

> Gyawali, A., Al-Athwari, B. "Deploying a University Social Platform on Free-Tier Serverless Infrastructure: Performance Characterization and Cold-Start Source Isolation." ResearchGate, 2026. [researchgate.net/publication/403937001](https://www.researchgate.net/publication/403937001)

---

## Visual Overview

### Campus Feed
<img src="./screenshots/homepage.png" alt="Campus feed showing announcements, create-post panel, and sidebar widgets" width="900"/>

### Groups & Collaboration
<img src="./screenshots/groupspage.png" alt="Groups directory with create-group dialog and membership controls" width="900"/>

### Student Profile
<img src="./screenshots/profilepage.png" alt="Profile page with bio editor, stats, and personal posts" width="900"/>

### Resource Hub
<img src="./screenshots/resourceuploadpage.png" alt="Resource upload dialog and shared resources list" width="900"/>

### Authentication Flow

| Login Portal | Registration |
| --- | --- |
| <img src="./screenshots/loginpage.png" alt="Login form with KDU branding" width="420"/> | <img src="./screenshots/signup_registerpage.png" alt="Registration form for new students" width="420"/> |

---

## Core Features

- **Secure authentication** powered by bcrypt hashing, express-session, and SameSite/HTTP-only cookies.
- **Campus feed** for rich-text posts, inline reactions, threaded comments, and optional media attachments.
- **Community groups** enabling department, club, or semester cohorts with create/join/leave flows.
- **Resource library** that accepts PDFs/images, scopes uploads to groups, and serves authenticated download links.
- **Real-time messaging** over a native `ws` WebSocket server with session-based auth.
- **Profile management** with editable bio, avatar, follower metrics, and personal timelines.
- **Notifications center** surfacing unread counts, timestamps, and mark-as-read controls.
- **Responsive UI + theming** built with Tailwind CSS, shadcn/ui primitives, and a light/dark toggle.

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Wouter, TanStack Query, Lucide Icons |
| **Backend** | Express.js, TypeScript, Helmet, express-session, Multer, cookie-parser |
| **Database** | Neon PostgreSQL with Drizzle ORM (pg driver) + Drizzle Kit migrations |
| **Real-time** | Native `ws` WebSocket server, session-based auth |
| **Storage** | Local `/uploads` directory on Render (ephemeral), Multer validation & static serving |
| **Authentication** | Email/password flows with bcrypt hashing and session cookies |
| **Deployment** | Render: static site (frontend) + Node.js web service (backend) |
| **Tooling** | ESLint, Prettier, tsx, cross-env, k6 (load testing), Vite dev server |

---

## Project Architecture Summary

1. **Backend layers** – Routes register modular controllers (posts, users, groups, resources, notifications) behind auth middleware. Controllers validate payloads with Zod, delegate to services for business logic, and the services orchestrate a Drizzle-powered storage layer over Neon PostgreSQL. Multer secures uploads before exposing them through Express static middleware. The system exposes 47 REST API endpoints total, backed by a 13-table schema normalized to Third Normal Form with foreign key `ON DELETE CASCADE` constraints, queried through a node-postgres pool (`PG_POOL_MAX` at its default of 10).
2. **Frontend composition** – Page-level components (Feed, Groups, Profile, Resources) hydrate data with TanStack Query. Shared components (Navbar, PostCard, ProfileHeader, CreatePost, etc.) encapsulate UI logic, while `apiRequest` plus `resolveApiUrl` consolidate API access and error handling. Theme/state helpers keep the SPA snappy and consistent across viewports.
3. **Deployment** – Two Render services: a static site for the frontend and a Node.js web service for the backend, connected to Neon PostgreSQL via a pooled connection string. A prestart hook runs `npx drizzle-kit push` on every deploy. Sessions are held in `memorystore` via express-session, so they do not survive a Render restart.

---

## Research Findings

This deployment was benchmarked as part of the published performance study above. Highlights:

- **Cold-start isolation:** Render container wake-up averaged 52.4s (n=5) versus Neon database resume at 621ms (n=5), a two-order-of-magnitude gap that dominates perceived cold-start latency.
- **Load testing:** zero errors across 10,584 REST requests at 100 concurrent virtual users; p95 latency under 800ms, p99 under 920ms.
- **Root-caused tail latency:** 231-253 connection-pool saturation events per endpoint at peak load, attributed to the 10-connection pool ceiling rather than database cold-starts.
- **Pre-evaluation hardening:** resolved 14 bugs prior to evaluation, including an ORM eager-loading credential leak (`passwordHash` exposed via joined queries), a WebSocket session key mismatch (`req.session.userId` vs. `req.session.passport.user`), and a stored path traversal vulnerability in the resource download endpoint.

Full methodology, tables, and discussion are in the paper linked above. Load test scripts live in `/load-tests`.

---

## Folder Structure

```
.
├── client/
│   ├── public/                # Static assets served by Vite
│   └── src/
│       ├── components/        # Reusable UI building blocks
│       ├── hooks/             # React hooks (useAuth, etc.)
│       ├── lib/               # Query client + helpers
│       └── pages/             # Route-level views (Feed, Groups, Profile, Resources, Login, Register)
├── server/
│   ├── controllers/           # HTTP handlers
│   ├── middleware/            # Auth + error middleware
│   ├── routes/                # Modular Express routers
│   ├── services/              # Business logic
│   ├── storage.ts             # Drizzle ORM queries
│   └── config.ts              # Environment loading & validation
├── shared/                    # Shared Zod schemas & types
├── load-tests/                # k6 scripts for REST, upload, and cold-start isolation tests
├── screenshots/               # Documentation visuals
├── uploads/                    # Runtime upload bucket (gitignored, tracked via .gitkeep)
├── drizzle.config.ts           # Migration configuration
├── render.yaml                 # Render deployment configuration
├── DEPLOYMENT_LOG.md           # Deployment history and incidents
├── package.json                # Scripts + dependencies
└── vite.config.ts              # Vite setup pointing to ./client
```

---

## Environment Variables

Create a `.env` in the repo root (never commit secrets):

| Variable | Description | Example |
| --- | --- | --- |
| `NODE_ENV` | Runtime mode | `development`
| `PORT` | Express server port | `3000`
| `SESSION_SECRET` | 32+ char secret for signing session cookies | `change-me-super-secret`
| `DATABASE_URL` | Neon PostgreSQL pooled connection string | `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require`
| `VITE_API_BASE_URL` | (Optional) API origin when Vite runs separately | `http://localhost:3000`

> Keep `.env` out of git. Commit the provided `.env.example` so teammates can bootstrap quickly.

---

## Installation Guide

1. **Clone the repository**
   ```bash
   # HTTPS
   git clone https://github.com/Ashawn0/uniconnect_demo_social_media_for_KDU.git

   # or SSH
   git clone git@github.com:Ashawn0/uniconnect_demo_social_media_for_KDU.git

   # or GitHub CLI
   gh repo clone Ashawn0/uniconnect_demo_social_media_for_KDU

   cd uniconnect_demo_social_media_for_KDU
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with SESSION_SECRET, DATABASE_URL (Neon connection string), etc.
   ```

4. **Push the schema to your Neon database**
   ```bash
   npx drizzle-kit push
   ```

---

## Running the Project

1. **Start the backend**
   ```bash
   npm run server:dev
   ```
   - Boots Express with API + Vite middleware on `http://localhost:3000`.

2. **Start the frontend (optional separate process)**
   ```bash
   npm run client:dev
   ```
   - Launches standalone Vite dev server on `http://localhost:5173`.
   - Set `VITE_API_BASE_URL=http://localhost:3000` so SPA calls hit the backend.

3. **Visit the app**
   - Full stack via Express: `http://localhost:3000`
   - Standalone Vite: `http://localhost:5173`
   - API health check: `http://localhost:3000/api/health`

> Prefer `npm run dev` when you want Express to host both the API and SPA through a single process.

---

## Contributing Guidelines

1. Fork the repo and create a feature branch (`git checkout -b feature/<name>`).
2. Keep pull requests focused; update or add tests when touching business logic.
3. Run `npm run lint` and `npm run check` before submitting.
4. Open a PR with context, screenshots for UI changes, and a brief rollback plan.

---

## License

Released under the [MIT License](./LICENSE).
