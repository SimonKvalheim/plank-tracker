# Plank Tracker – Product Requirements Document

**Version:** 1.0  
**Author:** Simon  
**Date:** January 2025  
**Status:** Draft

---

## 1. Overview

### 1.1 Problem Statement

A group of friends wants to compete on who can hold a plank the longest throughout 2026. Currently, there's no easy way to track attempts, compare progress, or maintain a leaderboard without manual coordination.

### 1.2 Solution

A lightweight web application that allows users to log plank attempts (either manually or via an in-app timer), view a leaderboard, and track personal progress over time.

### 1.3 Success Criteria

- All ~20-30 friends can register, log attempts, and view the leaderboard
- The app is live and stable on Railway by end of January 2025
- Users actively log attempts throughout 2026

---

## 2. Users & Access

### 2.1 Target Users

- A private group of 20-30 friends
- No public access; registration required

### 2.2 Authentication

- Email/password registration and login
- "Fairly secure" – hashed passwords, session management
- No OAuth/social login required (keep it simple)

### 2.3 Privacy & GDPR

Since users are in the EEA:
- Store only necessary data (email, hashed password, plank attempts)
- Provide a simple privacy notice on the registration page
- Allow users to delete their account and data upon request
- No third-party data sharing

---

## 3. Features & Scope

### 3.1 Core Features (MVP)

| Feature | Description |
|---------|-------------|
| **User registration** | Sign up with email and password |
| **User login/logout** | Secure session-based authentication |
| **Log attempt (manual)** | Enter a plank time (mm:ss) with automatic timestamp |
| **Log attempt (timer)** | Start/stop an in-app timer that records the duration |
| **Leaderboard** | Ranked list of users by their personal best time |
| **Personal history** | View all your past attempts with dates |
| **Personal best badge** | Highlight when a new attempt beats your previous best |

### 3.2 Nice-to-Have (Post-MVP)

| Feature | Description |
|---------|-------------|
| Progress chart | Visual graph showing improvement over time |
| Weekly/monthly leaderboards | Filter leaderboard by time period |
| Streak tracking | Consecutive days with a logged plank |
| Push notifications | Reminders to plank or celebrate new records |
| Profile customization | Display name, avatar |

### 3.3 Out of Scope

- Video/photo verification
- Mobile native app (web-only, but responsive)
- Social features (comments, likes)
- Public profiles or sharing

---

## 4. User Stories

### 4.1 Registration & Auth

- As a new user, I can register with my email and password so I can join the competition.
- As a registered user, I can log in to access my data and the leaderboard.
- As a logged-in user, I can log out to secure my session.

### 4.2 Logging Attempts

- As a user, I can manually enter a plank time so I can log attempts done offline.
- As a user, I can use an in-app timer to record my plank in real-time.
- As a user, I see confirmation when my attempt is saved, including whether it's a new personal best.

### 4.3 Leaderboard & History

- As a user, I can view a leaderboard showing all participants ranked by their best time.
- As a user, I can see my own rank highlighted on the leaderboard.
- As a user, I can view my personal attempt history sorted by date.
- As a user, I can see my personal best and how recent attempts compare.

---

## 5. Data Model

### 5.1 Entities

```
User
├── id: UUID (PK)
├── email: String (unique)
├── passwordHash: String
├── displayName: String (optional, defaults to email prefix)
├── createdAt: DateTime
└── updatedAt: DateTime

Attempt
├── id: UUID (PK)
├── userId: UUID (FK → User)
├── durationSeconds: Integer
├── attemptedAt: DateTime
├── createdAt: DateTime
└── isPersonalBest: Boolean (computed or stored)
```

### 5.2 Key Queries

- **Leaderboard:** For each user, get their maximum `durationSeconds`, rank by descending duration
- **Personal history:** All attempts for a user, ordered by `attemptedAt` descending
- **Personal best:** Maximum `durationSeconds` for a given user

---

## 6. Technical Architecture

### 6.1 Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | NextAuth.js (Credentials Provider) |
| Hosting | Railway (web app + managed Postgres) |

### 6.2 Project Structure (Suggested)

```
plank-tracker/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── leaderboard/
│   │   │   ├── history/
│   │   │   └── timer/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   └── attempts/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Timer.tsx
│   │   ├── LeaderboardTable.tsx
│   │   ├── AttemptForm.tsx
│   │   └── ...
│   └── lib/
│       ├── prisma.ts
│       └── auth.ts
├── .env
├── package.json
└── README.md
```

### 6.3 Deployment

**Railway setup:**
1. Create a new project with a PostgreSQL database
2. Add a service from GitHub repo (Next.js auto-detected)
3. Set environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
4. Prisma migrations run via deploy command: `prisma migrate deploy && next build`

### 6.4 Security Considerations

- Passwords hashed with bcrypt (via NextAuth)
- HTTPS enforced by Railway
- Environment variables for secrets
- Session tokens stored in HTTP-only cookies
- Input validation on all API routes

---

## 7. UI/UX Wireframes (Conceptual)

### 7.1 Main Pages

1. **Landing / Login page** – Simple form, link to register
2. **Register page** – Email, password, confirm password
3. **Dashboard (home)** – Quick stats (your rank, your PB), CTA to start timer
4. **Timer page** – Large timer display, start/stop button, save attempt
5. **Leaderboard page** – Table with rank, name, best time, date achieved
6. **History page** – Personal attempts list with timestamps

### 7.2 Design Principles

- Mobile-first responsive design (planking often done away from desktop)
- Minimal UI – focus on the timer and leaderboard
- Celebratory feedback on new personal bests

---

## 8. Milestones & Timeline

| Milestone | Target Date | Deliverables |
|-----------|-------------|--------------|
| **M1: Setup** | Week 1 | Repo, Railway project, DB, auth working |
| **M2: Core features** | Week 2-3 | Timer, manual entry, basic leaderboard |
| **M3: Polish** | Week 4 | History page, PB badges, responsive UI |
| **M4: Launch** | End of Jan | Invite friends, go live for 2026 tracking |

---

## 9. Open Questions

- [ ] Should the leaderboard show only active users (logged attempt in last X days)?
- [ ] Do we want a "display name" separate from email for privacy on leaderboard?
- [ ] Any interest in team/group competitions later?

---

## 10. Appendix

### 10.1 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Credentials Provider](https://next-auth.js.org/providers/credentials)
- [Prisma with Next.js](https://www.prisma.io/nextjs)
- [Railway Deployment Guide](https://docs.railway.app/)

### 10.2 Example Leaderboard Query (Prisma)

```typescript
const leaderboard = await prisma.user.findMany({
  select: {
    id: true,
    displayName: true,
    attempts: {
      orderBy: { durationSeconds: 'desc' },
      take: 1,
      select: {
        durationSeconds: true,
        attemptedAt: true,
      },
    },
  },
});

// Sort by best attempt duration descending
const ranked = leaderboard
  .filter(u => u.attempts.length > 0)
  .sort((a, b) => b.attempts[0].durationSeconds - a.attempts[0].durationSeconds)
  .map((user, index) => ({
    rank: index + 1,
    ...user,
  }));
```