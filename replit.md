# GestureOS - Hand Gesture Recognition Application

## Overview

GestureOS is a real-time hand gesture recognition web application that uses MediaPipe Hands for computer vision processing. The application allows users to detect hand gestures through their webcam and train custom gesture samples that are persisted to a PostgreSQL database. It features a futuristic, neon-themed UI with particle effects and smooth animations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Animations**: Framer Motion for smooth transitions
- **Webcam**: react-webcam for camera integration

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/`
- Reusable components in `client/src/components/`
- Custom hooks in `client/src/hooks/`
- Utility functions in `client/src/lib/`

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ES modules)
- **Build Tool**: Vite for frontend, esbuild for server bundling
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts`

The server uses a simple architecture:
- `server/index.ts`: Express app setup and middleware
- `server/routes.ts`: API route handlers
- `server/storage.ts`: Database abstraction layer
- `server/db.ts`: Drizzle ORM database connection

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with Zod schema validation
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Generated to `./migrations` directory

Database schema includes:
- `gesture_samples` table: Stores gesture label, landmarks (JSONB), and timestamp

### API Structure
All API routes are defined in `shared/routes.ts` using a typed route definition pattern:
- `GET /api/gestures` - List all gesture samples
- `POST /api/gestures` - Create a new gesture sample
- `DELETE /api/gestures/:id` - Delete a gesture sample

### Development vs Production
- Development: Vite dev server with HMR, proxied through Express
- Production: Static files served from `dist/public`, server bundled to `dist/index.cjs`

## External Dependencies

### Computer Vision
- **MediaPipe Hands**: Loaded from CDN (`@mediapipe/hands`) for hand landmark detection
- Processes webcam feed to extract 21 hand landmark points in real-time

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage (available but sessions not currently implemented)

### Build & Runtime
- **Vite**: Frontend bundler with React plugin
- **esbuild**: Server-side bundling for production
- **tsx**: TypeScript execution for development

### Key NPM Packages
- `drizzle-orm` + `drizzle-zod`: Database ORM and schema validation
- `@tanstack/react-query`: Server state management
- `framer-motion`: Animation library
- `react-webcam`: Webcam integration
- Comprehensive Radix UI primitives for accessible components