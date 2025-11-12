# UniConnect Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from Discord's dark futuristic aesthetic and Instagram's vibrant, smooth interface to create a modern social media experience.

## Color Palette
- **Base Backgrounds**: #1E1E2F (primary dark), #2A2A40 (secondary dark)
- **Primary Accent**: #5865F2 (Discord blurple) for interactive elements
- **Gradient Accent**: Instagram-style linear gradient (#833AB4 → #FD1D1D → #FCAF45) for highlights and special elements
- **Text Colors**: #EDEDED (primary text), #D1D5DB (secondary/muted text)

## Typography
- **Font Family**: Use Inter or DM Sans via Google Fonts for clean, modern readability
- **Hierarchy**:
  - Headlines: 2xl-3xl, font-semibold to font-bold
  - Body text: base to lg, font-normal
  - Metadata (timestamps, usernames): sm, font-medium
  - Buttons/CTAs: sm to base, font-semibold

## Layout System
**Spacing**: Use Tailwind units of 2, 4, 6, and 8 for consistent rhythm (p-4, m-6, gap-8, etc.)

## Core Components

### Navigation Bar
- Sticky top position with dark background (#1E1E2F)
- "UniConnect" logo on left with gradient text effect
- Navigation links: Feed, Profile, Logout
- Subtle bottom border or shadow for depth

### Post Cards (Feed)
- Glassmorphism effect: semi-transparent background with backdrop-blur
- Rounded corners (rounded-xl to rounded-2xl)
- Structure: Avatar (left) → Username/timestamp (top) → Content text → Image (if present) → Like/Comment buttons (bottom)
- Hover glow effect using box-shadow with blurple accent
- Avatar: circular, 12-16 units diameter
- Action buttons with icon + count display

### Profile Page
- Circular avatar with Instagram-style gradient border (2-3px gradient stroke)
- Bio section below avatar, centered layout
- Posts grid: 2-3 columns on desktop, 1 column on mobile
- Edit profile button with gradient background
- User stats: posts count, optional followers/following

### Buttons
- Primary: Gradient background (#833AB4 → #FD1D1D → #FCAF45)
- Secondary: Blurple solid (#5865F2)
- Ghost/outline: Transparent with colored border
- All buttons: Smooth hover transitions (scale, brightness changes)
- Rounded (rounded-lg to rounded-full)

### Forms (Login/Register)
- Centered card layout with glassmorphism
- Input fields: Dark background with lighter border, rounded corners
- Focus states: Blurple border glow
- Clear labels above inputs
- Submit buttons using gradient style

### Comment Section
- Nested slightly under posts with indentation
- Smaller avatar sizes (8-10 units)
- Lighter background to distinguish from main post
- Reply/timestamp metadata in muted text

## Responsive Behavior
- **Desktop (lg)**: Multi-column feed (1-2 columns), larger avatars and cards
- **Tablet (md)**: Single column feed, moderate spacing
- **Mobile (base)**: Stack all elements, compact spacing, full-width cards

## Visual Effects
- **Glassmorphism**: backdrop-blur-md with bg-opacity-10 on cards
- **Hover States**: Subtle scale (scale-105) and glow effects on interactive elements
- **Transitions**: Use transition-all duration-200 to duration-300 for smooth interactions
- **Gradient Overlays**: Apply Instagram gradient to special elements (profile borders, CTAs, highlights)

## Icons
Use Heroicons via CDN for consistent, clean iconography (heart, comment, user, logout, edit icons)

## Images
- **User Avatars**: Circular crop, gradient border treatment for profile pages
- **Post Images**: Full-width within card, rounded corners matching card style, max-height constraint to prevent excessive vertical space
- **Image Upload**: Placeholder state showing dashed border upload area with icon

## Animations
Use sparingly:
- Smooth fade-in for new posts/comments
- Subtle pulse on like button when clicked
- Hover glow transitions on cards and buttons

This design creates an immersive, visually striking social media experience combining Discord's modern dark aesthetic with Instagram's vibrant energy.