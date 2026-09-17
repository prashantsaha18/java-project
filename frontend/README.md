# Stacks — Library Management (Frontend)

React 18 + Vite SPA for the Library Management System backend. Member
catalog browsing/borrowing, an admin panel for book CRUD, active-loan
tracking, and report dashboards (charts + CSV export).

## Stack

- React 18, React Router 6
- Vite
- Axios (JWT attached via interceptor)
- Recharts (report charts)

## Run locally

```bash
npm install
cp .env.example .env   # then set VITE_API_URL to your backend URL
npm run dev
```

Default demo login (seeded by the backend): `admin@library.com` / `admin123`

## Deploying to Vercel

**Option A — Vercel dashboard**
1. Push this `frontend/` folder to a GitHub repo (or import just this subdirectory if the repo has both frontend and backend).
2. In Vercel: "Add New Project" → import the repo → set **Root Directory** to `frontend` if needed.
3. Framework preset: Vite (auto-detected). Build command `npm run build`, output directory `dist` (auto-detected).
4. Add an environment variable: `VITE_API_URL` = your deployed backend URL (e.g. `https://library-backend.onrender.com`).
5. Deploy.

**Option B — Vercel CLI**
```bash
npm install -g vercel
cd frontend
vercel
# follow prompts, then set VITE_API_URL in the Vercel dashboard
vercel --prod
```

`vercel.json` in this folder rewrites all routes to `index.html` so React
Router's client-side routes (`/catalog`, `/admin`, etc.) work on refresh
and direct link — without it, Vercel would 404 on any route that isn't `/`.

## Notes

- The backend must be deployed and reachable (CORS is already open on the
  Spring Boot side) before the frontend will work against anything but
  `localhost`.
- If you don't have a backend deployed yet, see `../backend/README.md`.
