# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Plank Tracker is a web app for a private group of friends to track plank exercise durations throughout 2026. Users can log attempts via manual entry or an in-app timer, view a leaderboard, and track personal progress.

## Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run dev:local        # Start Docker DB + push schema + dev server

# Database
npm run docker:up        # Start PostgreSQL container
npm run docker:down      # Stop PostgreSQL container
npm run docker:reset     # Reset DB (destroys data)
npm run db:push          # Push schema to DB without migration
npm run db:studio        # Open Prisma Studio GUI
npm run db:migrate       # Run migrations (production)

# Build & Lint
npm run build            # Generate Prisma client + build Next.js
npm run lint             # Run ESLint
```

## Architecture

### Auth Split Pattern (NextAuth v5)
Authentication is split between two files to support Edge runtime in middleware:
- `auth.config.ts` - Edge-compatible config (callbacks, session strategy, public routes)
- `auth.ts` - Node.js only (Credentials provider with bcrypt, Prisma DB queries)

The middleware (`src/middleware.ts`) uses the Edge-compatible config for route protection.

### Prisma 7 with pg Adapter
Uses `@prisma/adapter-pg` for direct PostgreSQL connections. The client is initialized in `src/lib/prisma.ts` with global caching for development hot reload.

### Path Aliases
- `@/*` → `./src/*`
- `@/auth` → `./auth.ts`
- `@/auth.config` → `./auth.config.ts`

### API Routes
All API routes require authentication (checked via `auth()` from `@/auth`):
- `POST /api/auth/register` - User registration
- `GET/POST /api/attempts` - List/create plank attempts
- `GET /api/leaderboard` - Get ranked leaderboard

### Data Models
- **User**: id, email, passwordHash, displayName, timestamps
- **Attempt**: id, userId, durationSeconds, attemptedAt, isPersonalBest

## Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://user:pass@host:port/db
AUTH_SECRET=<random-string>
```

Local Docker DB URL: `postgresql://plank_user:plank_dev_password@localhost:5433/plank_tracker_dev`
