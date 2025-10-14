# Домофонная служба | ИП Бухтеев

## Overview

This is a landing page website for a professional intercom installation and repair service company operating in the Tula region of Russia. The site serves as a digital storefront to showcase services, build trust, and collect customer requests through an embedded Google Form. The application is built as a single-page React application with a focus on professional presentation and user conversion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management (currently unused but available)
- **Tailwind CSS** with custom theming for responsive styling

**Design System:**
- **shadcn/ui** component library (New York variant) providing 40+ pre-built accessible components
- **Radix UI** primitives for headless component logic
- Material Design-inspired approach with custom color palette
- Light/dark mode support with theme persistence via localStorage
- Responsive layout system using Tailwind breakpoints

**Component Architecture:**
- Single-page application with modular section components:
  - `Header` - Sticky navigation with theme toggle and CTA
  - `Hero` - Full-screen hero section with background image
  - `Services` - Two-column service cards (Installation & Repair)
  - `Benefits` - Three-column benefits showcase
  - `RequestForm` - Embedded Google Form with height management
  - `Contact` - Contact information cards
  - `Footer` - Site footer with links and company info
- Props-driven design with callback handlers for cross-component communication
- Smooth scroll behavior for navigation

**State Management:**
- Local component state using React hooks
- Theme state persisted in localStorage
- No global state management (TanStack Query configured but not actively used)

### Backend Architecture

**Server Framework:**
- **Express.js** with TypeScript for the Node.js server
- Middleware for JSON parsing and URL encoding
- Request/response logging middleware with timing metrics
- Error handling middleware with status code support

**Development Environment:**
- Vite development server with HMR (Hot Module Replacement)
- Custom Vite plugins for Replit integration:
  - Runtime error overlay
  - Cartographer for code navigation
  - Development banner
- Middleware mode integration between Express and Vite

**Build Process:**
- Client: Vite bundles React app to `dist/public`
- Server: esbuild bundles Express server to `dist/index.js`
- ESM (ES Modules) format throughout
- TypeScript compilation with strict mode enabled

**Storage Layer (Currently Minimal):**
- In-memory storage implementation (`MemStorage` class)
- User CRUD interface defined but not actively used
- Prepared for database integration via Drizzle ORM

### Data Storage Solutions

**Database Configuration:**
- **PostgreSQL** via Neon serverless database (`@neondatabase/serverless`)
- **Drizzle ORM** configured with schema-first approach
- Migration files output to `./migrations` directory
- Schema defined in `shared/schema.ts` with user table structure

**Current Schema:**
- `users` table with UUID primary key, username, and password fields
- Zod validation schemas derived from Drizzle schema
- Currently not actively used (storage is in-memory)

**Session Management:**
- `connect-pg-simple` configured for PostgreSQL session storage
- Not currently implemented but infrastructure ready

### External Dependencies

**Third-Party Services:**
- **Google Forms** - Embedded form for customer request collection
  - URL: `https://docs.google.com/forms/d/e/1FAIpQLScSO3weGn0GU23qVuIXFoARSsra0B2sYFjMEAuDsD6UNQd2_w/viewform`
  - PostMessage API integration for form submission detection
  - Dynamic height adjustment based on form state

**Design Resources:**
- **Google Fonts** - Manrope and Inter font families
- Hero background image stored in `attached_assets` directory

**UI Libraries:**
- **Radix UI** - 25+ headless component primitives for accessibility
- **Lucide React** - Icon library for UI elements
- **Embla Carousel** - Carousel/slider functionality (installed but not used)
- **cmdk** - Command palette component (installed but not used)

**Deployment:**
- **GitHub Pages** deployment scripts provided (`deploy-github.sh` and `deploy-github.bat`)
- `gh-pages` package for automated deployment
- Requires repository name configuration

**Development Tools:**
- **Replit-specific plugins** for enhanced development experience
- **date-fns** for date manipulation (installed but not used)
- **react-day-picker** for calendar components (installed but not used)

**Type Safety:**
- **Zod** for runtime validation and type inference
- **drizzle-zod** for automatic Zod schema generation from database schema
- TypeScript strict mode with comprehensive type checking

### OneSignal Push Notifications Integration

**Service Configuration:**
- **OneSignal SDK v16** for web push notifications
- App ID: `3a40bd59-5a8b-40a1-ba68-59676525befb`
- Custom domain: `www.obzor71.ru`
- Service Worker: `OneSignalSDKWorker.js` in public directory

**Implementation Details:**
- SDK loaded via CDN in SSR template (`client/renderer/+onRenderHtml.jsx`)
- Custom prompt after form submission for notification subscription
- User tags automatically saved: name, phone, city, address, message
- Admin panel at `/admin` for managing notifications

**Content Security Policy:**
- CSP meta tag added to allow OneSignal CDN resources:
  - `script-src`: Allows OneSignal SDK scripts
  - `img-src`: Allows external images (OneSignal assets)
  - `connect-src`: Allows API connections to OneSignal servers
  - `worker-src`: Allows Service Worker registration

**Admin Panel (`/admin`):**
- Password-protected interface (password: `admin123`)
- Lists all OneSignal subscribers with their details
- Three notification actions per subscriber:
  - 🔵 "Заявка в обработке" (Request in progress)
  - 🚗 "Мастер выехал" (Master departed)
  - ✅ "Проблема решена" (Problem solved)
- Direct REST API integration for sending notifications
- No backend required - all operations via OneSignal API

### GitHub Pages Deployment Configuration

**SPA Routing Support:**
- `404.html` created for client-side routing compatibility
- Redirects all 404s to index.html while preserving the path
- Uses `sessionStorage` to store redirect path
- `App.tsx` reads stored path and navigates on mount

**Build Process:**
- Run `npm run build` to create production bundle
- Post-build script (`post-build.sh`) copies 404.html to dist/public root
- All static assets from `client/public` automatically copied:
  - CNAME (custom domain configuration)
  - robots.txt (SEO)
  - OneSignalSDKWorker.js (push notifications)
  - sitemap.xml, Google/Yandex verification files

**Deployment Files:**
- `dist/public/` contains complete static site
- `dist/public/404.html` enables SPA routing on GitHub Pages
- `dist/public/client/` contains app assets and additional static files