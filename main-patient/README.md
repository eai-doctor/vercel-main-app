# EAI Patient App

Independent React/Vite frontend. No parent source files, workspace packages, sibling app or backend checkout is required.

## Run

Requires Node 20.19+ or 22.12+. Run from this directory:

```sh
npm ci
cp .env.example .env.development.local
npm run dev
npm test
npm run build
```

Default port: 5182. Configure reachable backend/auth services. Local auth uses a same-origin proxy so HttpOnly refresh cookies work without browser-side service keys. AUTH_PROXY_TARGET defaults to the existing hosted auth service when unset; .env.example selects local auth. VITE_* overrides apply in both development and production. Set the other portal URL to its real deployment URL in production; the shared header hides its switch if unset.

## Deploy

Create a separate Vercel project with this directory as Root Directory, build command `npm run build` and output `dist`. Existing API rewrites and SPA fallback are included. Do not use local URLs in production. Set VITE_* endpoints and backend CORS/cookie policy for each origin; no backend changes are included here.

## Ownership

Contains patient home, health consultation, profile, medical reports and self-triage. No clinician or admin pages and no patientApi.

Public UI, login context/modal, translations and shared API adapters are independent local copies. Changes to shared behavior must be reviewed in both apps. FHIR data helpers live under utils/healthRecords and constants/healthRecords, outside page folders. The root legacy app is retained only as a migration baseline.
