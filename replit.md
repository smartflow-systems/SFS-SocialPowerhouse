# SFS Social PowerHouse - Replit Configuration

## Overview

SFS Social PowerHouse is a premium AI-powered social media automation platform built by SmartFlow Systems. The application enables users to create, schedule, and optimize social media content across multiple platforms using AI-driven content generation, intelligent scheduling, and comprehensive analytics. It serves agencies, businesses, and social media professionals who need sophisticated automation and AI assistance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom SFS design system

**Design System:**
The application uses a custom "SFS Design System" with:
- **Color Palette**: SFS Black (#0D0D0D), SFS Brown (#3B2F2F), SFS Gold (#FFD700)
- **Visual Effects**: Glassmorphism UI with backdrop blur, golden circuit animations, pulse/shimmer/float effects
- **Typography**: Inter font family from Google Fonts
- **Component Library**: Custom glass-effect cards, golden buttons, circuit backgrounds built on top of Radix UI and shadcn/ui

**Key Frontend Patterns:**
- Component composition using Radix UI headless components
- Reusable glass-morphism wrapper components (GlassCard, GoldenButton, CircuitBackground)
- Dashboard layout with collapsible sidebar navigation
- Responsive mobile-first design
- Toast notifications for user feedback
- Form validation with React Hook Form and Zod schemas
- Landing page feature cards with navigation links to app sections

**Landing Page Features:**
- Interactive feature cards in FeaturesGrid component
- Each card links to corresponding app functionality:
  - AI Content Generation → /ai-studio
  - Multi-Platform Scheduling → /posts/create
  - Analytics Dashboard → /analytics
  - Team Collaboration → /connections/team
  - Content Calendar → /calendar
  - Smart Suggestions → /ai-studio

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL (via Neon serverless driver)
- **Authentication**: Passport.js with local strategy and express-session
- **Password Security**: bcrypt for hashing

**API Structure:**
- RESTful API endpoints under `/api` prefix
- **Authentication**: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **Team Management**: `/api/team`, `/api/team/members` (GET/POST/PATCH/DELETE)
- **Social Accounts**: `/api/social-accounts` (GET/POST/PATCH/DELETE)
- **User Settings**: `/api/settings/preferences`, `/api/settings/profile`
- **AI Generation**: `/api/ai/generate`, `/api/ai/optimize`, `/api/ai/hashtags`, `/api/ai/repurpose`
- **Posts**: `/api/posts` (GET/POST/PATCH/DELETE with scheduling)
- **Templates**: `/api/templates` (GET/POST/PATCH/DELETE)
- **Analytics**: `/api/analytics` (aggregated metrics)
- Session-based authentication with in-memory session store (MemoryStore)
- Middleware for request logging and authentication guards

**Authentication Flow:**
- Passport.js local strategy for username/password authentication
- Sessions stored in memory with 7-day cookie expiration
- Password hashing with bcrypt (10 salt rounds)
- Protected routes using `requireAuth` middleware
- User serialization/deserialization for session management

**Data Storage Pattern:**
- Abstracted storage layer with IStorage interface
- Initial implementation using MemStorage (in-memory) for development
- Designed to support Drizzle ORM with PostgreSQL for production
- Schema defined in `shared/schema.ts` for type safety across client/server

### Database Schema

**Core Tables:**
1. **users**: User accounts with subscription tiers and SFS level (gamification)
2. **teams**: Workspace entity for team collaboration (each user gets default workspace on registration)
3. **teamMembers**: Team membership with roles (owner, admin, editor, viewer) and UNIQUE(teamId, userId) constraint
4. **userPreferences**: User settings (theme, timezone, notification preferences)
5. **socialAccounts**: Connected social media platform accounts (accountName, accountId, OAuth tokens)
6. **posts**: Content posts with scheduling, AI metadata, and platform targeting
7. **analytics**: Performance metrics for posts
8. **contentTemplates**: Reusable content templates
9. **hashtags**: Hashtag research and performance tracking
10. **schedules**: Queue system for automated posting

**Key Relationships:**
- Users have one default team (created on registration)
- Teams have many members via teamMembers junction table
- Users have many social accounts (one-to-many)
- Users have one set of preferences (one-to-one)
- Users have many posts (one-to-many)
- Posts reference multiple platforms via JSONB array
- Analytics tied to individual posts
- Cascade deletes on user removal (teams, members, accounts, preferences)

**Design Decisions:**
- UUID primary keys for all tables
- JSONB columns for flexible data (platforms array, profile data, hashtags)
- Timestamp fields (createdAt, updatedAt) for audit trails
- Subscription tier system: starter, growth, agency, enterprise
- Gamification element: SFS level (1-10, "Level 10 Mage" easter egg)

## Design Kit Distribution

**SFS Design Kit** is available for easy copying to other apps:
- **Location**: `sfs-design-kit/` folder in project root
- **Contains**: Reusable components (HamburgerMenu, GlassCard, GoldenButton, Navigation), CSS theme, and setup scripts
- **Setup Methods**:
  1. **Auto Script** (30 seconds): Run `bash ../sfs-socialpowerhouse/sfs-design-kit/setup.sh`
  2. **Copy-Paste** (1 min): Right-click `sfs-design-kit` folder → Copy/Paste in new app
  3. **Web Wizard** (Interactive): Open `sfs-design-kit/SETUP-WIZARD.html` in browser for guided setup
  4. **Manual** (5 min): Follow step-by-step guide in `sfs-design-kit/SETUP-GUIDE.md`
- **For Updates**: Edit design kit components in master app, then re-copy to other apps

## External Dependencies

### Third-Party Services

**AI/ML Services:**
- **OpenAI API**: Primary AI content generation engine
  - Used for: Multi-tone content generation (10 tones), platform optimization, hashtag suggestions, content repurposing
  - Configuration: Requires `OPENAI_API_KEY` environment variable
  - Fallback: Returns 503 error when API key not configured

**Database:**
- **Neon Serverless PostgreSQL**: Production database via `@neondatabase/serverless`
  - Configuration: `DATABASE_URL` environment variable required
  - Drizzle ORM for schema management and migrations
  - Migration files stored in `./migrations` directory

**Social Media Platform APIs (Planned):**
- Facebook Graph API
- Instagram Basic Display API
- Twitter/X API v2
- LinkedIn API
- TikTok Business API
- YouTube Data API
- Pinterest API

**Authentication:**
- Supabase client library included (`@supabase/supabase-js`) for potential auth extension
- Currently using Passport.js local strategy

### UI Component Libraries

**Core UI Dependencies:**
- **Radix UI**: 20+ headless component primitives for accessibility
- **shadcn/ui**: Component templates built on Radix UI
- **Lucide React**: Icon library
- **React Icons**: Additional icons (Social media logos via `react-icons/si`)
- **DND Kit**: Drag-and-drop for content calendar (@dnd-kit/core, @dnd-kit/sortable)
- **Recharts**: Charts and analytics visualization
- **date-fns**: Date formatting and manipulation
- **React Day Picker**: Calendar component for scheduling
- **Embla Carousel**: Carousel/slider functionality

### Build and Development Tools

**Development:**
- **tsx**: TypeScript execution for dev server
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server-side bundling for production
- **Replit plugins**: Runtime error modal, cartographer, dev banner

**Code Quality:**
- TypeScript with strict mode enabled
- ESLint and Prettier configuration (implied by project structure)
- Path aliases: `@/*` for client, `@shared/*` for shared schemas

### Session and State Management

**Client-side:**
- TanStack React Query for server state caching and synchronization
- Custom query client with credentials: "include" for cookie-based auth
- Stale time set to Infinity for manual cache invalidation

**Server-side:**
- express-session with memorystore for session persistence
- Session secret from environment variable or default
- 7-day session cookie lifetime
- HttpOnly cookies in production

### Asset Management

**Static Assets:**
- Generated images stored in `attached_assets/generated_images/`
- Custom favicon support
- Google Fonts CDN for typography (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)
- SVG patterns for circuit background animations

### Environment Configuration

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `OPENAI_API_KEY`: OpenAI API authentication
- `SESSION_SECRET`: Session encryption key (optional, has default)
- `NODE_ENV`: development/production flag

**Optional Configuration:**
- Session cookie security settings based on NODE_ENV
- Vite development server options
- CORS and allowed hosts configuration