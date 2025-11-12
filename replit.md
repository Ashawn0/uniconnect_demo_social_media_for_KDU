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

**Authentication Strategy**: The application uses cookie-based anonymous user authentication. This design choice:
- Eliminates the need for user registration/login flows
- Automatically creates anonymous users on first visit
- Stores userId in httpOnly cookies (secure in production)
- Allows immediate platform access without authentication barriers
- Cookies persist for 1 year, maintaining user identity across sessions

**API Design**: RESTful API endpoints organized by resource:
- `/api/auth/user` - Get current user information
- `/api/user/profile` - Profile updates
- `/api/posts` - Post creation and retrieval
- `/api/posts/:id/like` - Toggle likes on posts
- `/api/posts/:id/react` - Add icon-based reactions to posts
- `/api/posts/:id/comments` - Comment creation
- `/api/users/:id/follow` - Toggle follow/unfollow for users
- `/api/users/:id/stats` - Get user statistics (followers, following, posts)
- `/api/groups` - Group creation and retrieval
- `/api/groups/:id/join` - Join/leave groups
- `/api/resources` - Resource upload and retrieval
- `/api/resources/:id/download` - Track resource downloads
- `/api/notifications` - Get user notifications
- `/api/notifications/:id/read` - Mark notification as read
- `/api/notifications/read-all` - Mark all notifications as read
- `/api/notifications/unread-count` - Get unread notification count
- `/api/objects/upload` - Get presigned upload URL for Object Storage
- `/api/images` - Set ACL policy after image upload
- `/objects/:objectPath` - Serve uploaded objects with ACL enforcement

**File Upload Handling**: The application uses Replit Object Storage for persistent image uploads:
- **Secure Upload Flow**: Server tracks upload intents to prevent URL injection attacks
  1. Client requests upload URL via `/api/objects/upload` → receives uploadId token
  2. Client uploads directly to Google Cloud Storage using presigned URL
  3. Client finalizes upload via `/api/images` with uploadId → server sets ACL and returns object path
- **Security**: Upload intents validated for userId ownership, expire after 15 minutes, one-time use
- **Storage**: Images persist in Google Cloud Storage (not ephemeral filesystem)
- **ACL Enforcement**: Public images accessible to all, private images require ownership check
- **Environment Variables**: PRIVATE_OBJECT_DIR and PUBLIC_OBJECT_SEARCH_PATHS (auto-configured)

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

**Object Storage**: Replit Object Storage (Google Cloud Storage backend)
- Service layer: `server/objectStorage.ts` with GCS client integration
- ACL system: `server/objectAcl.ts` for access control (public/private visibility)
- Bucket: Auto-configured via environment variables
- Upload flow: Presigned URLs for direct client-to-GCS uploads
- Serving: `/objects/:objectPath` endpoint with ACL enforcement
- **Critical for Production**: Autoscale deployments require persistent storage (ephemeral filesystem causes failures)

**Database Service**: Neon Serverless PostgreSQL
- Connection via `process.env.DATABASE_URL`
- WebSocket-based serverless connections
- Stores all application data (users, posts, groups, etc.)

**UI Component Libraries**:
- Radix UI primitives for accessible components
- Lucide React for icons (NO emojis anywhere in the app)
- date-fns for timestamp formatting
- Uppy for file upload UI (@uppy/core, @uppy/react, @uppy/dashboard, @uppy/aws-s3)

**Development Tools** (Replit-specific):
- `@replit/vite-plugin-runtime-error-modal` - Development error overlay
- `@replit/vite-plugin-cartographer` - Code navigation
- `@replit/vite-plugin-dev-banner` - Development mode indicator

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

### Critical Production Fix (November 2024)
- **Object Storage Migration**: Fixed complete production deployment failure
  - **Problem**: Ephemeral `/uploads` directory in Autoscale deployments caused 500 errors
  - **Solution**: Migrated to Replit Object Storage for persistent image uploads
  - **Implementation**:
    - Created `server/objectStorage.ts` service layer with Google Cloud Storage client
    - Created `server/objectAcl.ts` ACL system for access control
    - Implemented secure upload intent tracking to prevent URL injection attacks
    - Server tracks upload sessions via uploadId tokens (not client-supplied URLs)
    - Upload intents validated for userId ownership, 15-minute expiry, one-time use
  - **Security**: Fixed SEVERE vulnerability where clients could inject arbitrary URLs
  - **Testing**: End-to-end tested, security validated (arbitrary URL injection blocked)
  - **Production Status**: ✅ Ready for deployment, images persist across restarts

### Technical Improvements
- Fixed critical backend bug: corrected `sql` import in storage.ts
- Proper TypeScript type safety throughout
- Cache invalidation for all mutations
- Responsive design for mobile and desktop
- Comprehensive data-testid coverage for testing
- Secure upload intent validation pattern for all file uploads