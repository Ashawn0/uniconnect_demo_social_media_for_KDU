# UniConnect

## Overview

UniConnect is a modern social media web application that combines Discord's dark futuristic aesthetic with Instagram's vibrant, smooth interface. Built as a full-stack TypeScript application, it enables users to share posts, engage through likes and comments, and manage their profiles in a visually striking dark-themed environment.

The application uses a monorepo structure with a React-based frontend (Vite), Express backend, and PostgreSQL database with Drizzle ORM. Authentication is handled through Replit's OpenID Connect (OIDC) system, providing seamless user management within the Replit environment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, built using Vite for fast development and optimized production builds.

**UI Component System**: The application uses shadcn/ui components built on Radix UI primitives, providing accessible and customizable components. All UI components follow a consistent design system defined in `design_guidelines.md` with:
- Dark color palette (#1E1E2F, #2A2A40)
- Discord blurple accent (#5865F2)
- Instagram-style gradient (#833AB4 → #FD1D1D → #FCAF45)
- Glassmorphism effects with backdrop blur

**Styling**: TailwindCSS with custom configuration for dark mode, using CSS variables for theming. The design system emphasizes:
- Rounded corners and smooth transitions
- Hover elevation effects
- Gradient buttons for primary actions
- Responsive layouts optimized for mobile and desktop

**State Management**: React Query (@tanstack/react-query) for server state management, including:
- Automatic query invalidation
- Optimistic updates for likes and comments
- Error handling with automatic retry logic

**Routing**: Wouter for lightweight client-side routing, with protected routes that redirect unauthenticated users to login.

**Key Pages**:
- Landing page for unauthenticated users
- Feed page displaying posts from all users
- Profile page showing user-specific posts and bio
- 404 Not Found page

### Backend Architecture

**Framework**: Express.js with TypeScript, running in ESM mode for modern JavaScript features.

**Authentication Strategy**: The application uses Replit's OIDC authentication system via passport.js. This design choice:
- Eliminates the need for custom user registration/login flows
- Leverages Replit's existing user accounts
- Provides secure session management through PostgreSQL-backed sessions
- Automatically syncs user profile data (email, name, profile image)

Session management uses `connect-pg-simple` to store sessions in the database, with a 7-day TTL.

**API Design**: RESTful API endpoints organized by resource:
- `/api/auth/*` - Authentication and user session management
- `/api/posts` - Post creation and retrieval
- `/api/posts/:id/like` - Toggle likes on posts
- `/api/posts/:id/comments` - Comment creation
- `/api/user/profile` - Profile updates

**File Upload Handling**: Multer middleware processes image uploads with:
- In-memory storage before writing to filesystem
- 5MB file size limit
- MIME type validation for images only
- UUID-based filename generation to prevent conflicts

**Error Handling**: Centralized error handling with consistent JSON error responses. Unauthorized errors (401) trigger automatic redirects to login on the client.

### Data Storage

**Database**: PostgreSQL accessed through Neon's serverless driver, chosen for:
- Compatibility with Replit's environment
- Connection pooling for efficient resource usage
- WebSocket support for serverless connections

**ORM**: Drizzle ORM provides type-safe database operations with:
- Schema-first approach with TypeScript types
- Automatic migration generation
- Relationship mapping between users, posts, comments, and likes

**Database Schema**:
- `sessions` - Stores user session data for authentication
- `users` - User profiles with email, name, bio, and profile image
- `posts` - Post content with optional image URLs
- `comments` - Comments linked to posts and users
- `likes` - Many-to-many relationship between users and posts

All tables use UUID primary keys and include `createdAt`/`updatedAt` timestamps. Cascading deletes ensure referential integrity when users or posts are removed.

**Storage Pattern**: The `IStorage` interface abstracts database operations, allowing for potential future storage implementations. The current `DatabaseStorage` class handles all CRUD operations with proper type safety.

### External Dependencies

**Authentication Provider**: Replit OIDC (OpenID Connect)
- Discovery endpoint: `process.env.ISSUER_URL` (defaults to https://replit.com/oidc)
- Client ID: `process.env.REPL_ID`
- Handles user identity and session refresh tokens

**Database Service**: Neon Serverless PostgreSQL
- Connection via `process.env.DATABASE_URL`
- WebSocket-based serverless connections
- Session storage through `connect-pg-simple`

**UI Component Libraries**:
- Radix UI primitives for accessible components
- Lucide React for icons
- date-fns for timestamp formatting

**Development Tools** (Replit-specific):
- `@replit/vite-plugin-runtime-error-modal` - Development error overlay
- `@replit/vite-plugin-cartographer` - Code navigation
- `@replit/vite-plugin-dev-banner` - Development mode indicator

**File Storage**: Local filesystem storage for uploaded images in `/attached_assets/` directory. Images are served as static assets through the Vite development server or Express in production.