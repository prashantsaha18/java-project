# Stacks — Library/Inventory Management System

A full-stack library management system built for SDE placement portfolios:
Spring Boot backend with transactional borrow/return logic, JWT auth, a
scheduled overdue job, and an admin reporting module; React frontend for
members and admins.

```
library-system/
├── backend/    Spring Boot 3 REST API (Java 17)
└── frontend/   React 18 + Vite SPA, deployable to Vercel
```

## Quick start

**Backend** (needs Java 17 + Maven; Docker only required for the
Testcontainers integration test):
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

**Frontend**:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Demo admin login: `admin@library.com` / `admin123`.

## Deployment

- **Backend** → Render or Railway (Spring Boot needs a long-running server, not a serverless platform). See `backend/README.md`.
- **Frontend** → Vercel. See `frontend/README.md`. Set `VITE_API_URL` to your deployed backend's URL.

## What each side demonstrates (for interviews)

**Backend**
- JPA entity relationships (many-to-many Book↔Category, one-to-many via BorrowRecord)
- Optimistic locking (`@Version`) proven under real concurrency with a Testcontainers integration test
- `@Transactional` boundaries around the borrow/return flow
- Stateless JWT auth + role-based method security
- `@Scheduled` job for nightly overdue/fine accrual
- Aggregation queries for reporting + CSV export
- Unit tests (Mockito) and an integration test (Testcontainers + real Postgres)

**Frontend**
- Protected/role-gated routes, JWT persisted client-side
- Axios interceptor for auth headers + 401 handling
- Chart-based reporting dashboard (Recharts) and CSV download
- Deployable as a static SPA with correct client-side routing config for Vercel
