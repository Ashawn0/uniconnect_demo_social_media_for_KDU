# Kyungdong University Connect (KDU Connect)

## Overview

KDU Connect is a branded social media platform designed specifically for Kyungdong University students and community. Built as a full-stack TypeScript application, it features university-branded design elements and comprehensive social features including follow/unfollow system, emoji reactions (icon-based), polls, groups, resource sharing, notifications, and events.

The application uses a monorepo structure with a React-based frontend (Vite), Express backend, and PostgreSQL database with Drizzle ORM. Authentication is handled through Replit's OpenID Connect (OIDC) system, providing seamless user management. The platform uses KDU's official colors (navy blue #003366, gold #d4af37) throughout the interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, built using Vite for fast development and optimized production builds.

**UI Component System**: The application uses shadcn/ui components built on Radix UI primitives, providing accessible and customizable components. All UI components follow a consistent design system defined in `design_guidelines.md` with:
- KDU navy blue primary (#003366)
- KDU gold accent (#d4af37)
- Soft gray backgrounds (#f5f6fa)
- University-branded hero banners and gradients
- NO emojis (all reactions/interactions use lucide-react icons)

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
- Feed page with KDU hero banner, displaying posts from all users with reactions and follow buttons
- Profile page showing user stats (posts, followers, following) and bio
- Groups page for creating and joining academic/social groups
- Resources page for sharing and downloading educational materials
- Events page for university events calendar
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
- `/api/posts/:id/react` - Add emoji reactions (icon-based) to posts
- `/api/posts/:id/comments` - Comment creation
- `/api/users/:id/follow` - Toggle follow/unfollow for users
- `/api/users/:id/stats` - Get user statistics (followers, following, posts)
- `/api/user/profile` - Profile updates
- `/api/groups` - Group creation and retrieval
- `/api/groups/:id/join` - Join/leave groups
- `/api/resources` - Resource upload and retrieval
- `/api/resources/:id/download` - Track resource downloads
- `/api/notifications` - Get user notifications
- `/api/notifications/:id/read` - Mark notification as read
- `/api/notifications/read-all` - Mark all notifications as read
- `/api/notifications/unread-count` - Get unread notification count

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
- `users` - User profiles with email, name, bio, profile image, and statistics
- `posts` - Post content with optional image URLs and poll data
- `comments` - Comments linked to posts and users
- `likes` - Many-to-many relationship between users and posts
- `reactions` - Emoji reactions (icon-based) on posts with type tracking
- `follows` - User follow relationships (follower/followee)
- `groups` - University groups (Academic, Social, Sports, etc.)
- `groupMembers` - Group membership tracking
- `resources` - Educational resource sharing with file metadata
- `resourceDownloads` - Download tracking for resources
- `notifications` - User notifications with read/unread status
- `polls` - Poll data associated with posts
- `pollOptions` - Poll option choices
- `pollVotes` - User votes on poll options
- `events` - University events calendar

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

## Recent Changes (November 2024)

### KDU Branding Transformation
- Implemented university-branded hero banner on Feed page with KDU colors and gradient
- Updated color scheme to use KDU official colors throughout the application
- Added KDU logo and branding elements to the interface

### Social Features
- **Reactions System**: Added 6 icon-based reaction types (like, love, laugh, wow, sad, celebrate) using lucide-react icons
  - Reaction picker popup on posts
  - Reaction count display with icons
  - NO emojis used anywhere (strict compliance with design guidelines)
- **Follow/Unfollow System**: Implemented follow buttons on PostCard component
  - Follow buttons appear on posts from other users (not on own posts)
  - Toggle functionality with backend API integration
  - Toast notifications for success/error states
- **User Statistics**: Added follower/following/posts stats display on Profile page
  - Three-column stats layout
  - Real-time counts from backend queries

### Groups & Resources
- **Groups Feature**: Complete group management system
  - Create group modal with form validation
  - Join/leave group actions with real-time member count updates
  - Group types: Academic, Social, Sports, Cultural, Professional
- **Resources Feature**: Educational resource sharing
  - Upload resource modal with file metadata
  - Download tracking integration
  - Resource cards with file type and group association

### Notifications System
- Implemented notifications dropdown in Navbar
  - Popover component with notification list
  - Mark individual notifications as read
  - Mark all notifications as read button
  - Unread count badge on bell icon
  - Timestamp formatting with "time ago" display

### Technical Improvements
- Fixed critical backend bug: corrected `sql` import in storage.ts
- Proper TypeScript type safety throughout
- Cache invalidation for all mutations
- Responsive design for mobile and desktop
- Comprehensive data-testid coverage for testing