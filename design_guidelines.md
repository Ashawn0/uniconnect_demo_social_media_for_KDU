# Kyungdong University - UniConnect Design Guidelines

## Design Approach
**University-Branded Social Platform**: A modern student community platform combining Discord's dark theme with Instagram's clean interface, branded with Kyungdong University's official colors and identity.

## Color Palette (Kyungdong University Theme)
- **KDU Blue** (#003366): Primary brand color - deep navy blue for navbar, headers, and key branding elements
- **KDU Gold** (#d4af37): Accent color for highlights, buttons, and interactive elements
- **KDU Gray** (#f5f6fa): Soft background for light mode cards and surfaces
- **Dark Backgrounds**: #1a1f2e (primary dark), #242936 (secondary dark) for dark mode
- **Text Colors**: #ffffff (primary on dark), #f0f0f0 (secondary on dark), #1a1f2e (primary on light)

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
- Sticky top position with KDU blue background (#003366)
- "Kyungdong University - UniConnect" logo/text on left
- KDU logo/icon integrated
- Navigation links: Home, Following, Groups, Events, Resources, Profile
- Gold accent on hover/active states
- Subtle bottom border or shadow for depth

### Post Cards (Feed)
- Glassmorphism effect: semi-transparent background with backdrop-blur
- Rounded corners (rounded-xl to rounded-2xl)
- Structure: Avatar (left) → Username/timestamp (top) → Content text → Image (if present) → Reaction/Comment buttons (bottom)
- Hover glow effect using box-shadow with gold accent
- Avatar: circular, 12-16 units diameter
- Action buttons with icon + count display
- Multiple reaction options (like, love, fire, etc.)

### Profile Page
- Circular avatar with KDU gold border (2-3px stroke)
- Bio section below avatar, centered layout
- Posts grid: 2-3 columns on desktop, 1 column on mobile
- Edit profile button with KDU colors
- User stats: posts count, followers/following

### Buttons
- Primary: KDU Gold (#d4af37) with smooth hover effects
- Secondary: KDU Blue (#003366)
- Accent: Gold to blue gradient for special CTAs
- Ghost/outline: Transparent with gold or blue border
- All buttons: Smooth hover transitions (scale, brightness changes)
- Rounded (rounded-lg to rounded-full)

### Forms
- Centered card layout with glassmorphism
- Input fields: Dark background with lighter border, rounded corners
- Focus states: KDU gold border glow
- Clear labels above inputs
- Submit buttons using KDU brand colors

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
- **Hover States**: Subtle scale (scale-105) and gold glow effects on interactive elements
- **Transitions**: Use transition-all duration-200 to duration-300 for smooth interactions
- **Brand Highlights**: Apply KDU gold accents to interactive elements, borders, and CTAs

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

## University Features
- **Hero Banner**: KDU logo with tagline "A space where Kyungdong University students connect, share, and grow"
- **Student Footer**: Credit signature with student name, ID, department, and batch
- **Academic Integration**: Groups by department, semester, and clubs
- **Events**: University and club event posting with RSVP
- **Resources**: File sharing for notes, PDFs, and study materials
- **Study Buddy**: Student matching for study groups
- **Achievements**: Badges for student milestones

This design creates a university-branded student community platform that combines modern social features with academic collaboration tools.