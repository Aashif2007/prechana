# PRECHANA

**Your Problem. The Right Authority.** An AI-assisted civic complaint reporting, routing,
reminder and escalation platform (demo mode).

Stack: Next.js 15, React 19, TypeScript, Tailwind CSS 4, Supabase (Postgres + PostGIS, Auth, Storage, RLS),
Leaflet / OpenStreetMap, Gemini API (optional; a keyword-based demo classifier is the default).

## Product rules

- AI only suggests a category. Authorities and contacts always come from the database.
- Nothing is ever sent to a real government authority. All routing is labelled "Demo Routing".
- SLA times are admin-configured. The seeded ones are tiny demo values.

## Setup

1. Create a Supabase project. Turn **off** "Confirm email" (Auth settings) for the demo.
2. In the SQL editor run, in order: `database/01_schema.sql`, `02_auth_trigger.sql`, `03_security.sql`, `04_seed_demo.sql`.
3. Copy `.env.example` to `.env.local` and fill in the Supabase URL, anon key and service-role key.
   Optional: set `AI_PROVIDER=gemini`, `GEMINI_API_KEY` and `GEMINI_MODEL`.
4. `npm install` then `npm run dev`, and open http://localhost:3000
5. Sign up on `/signup` (this creates a **citizen**). Optional: run `database/05_seed_complaints.sql` for 5 sample complaints.
6. Sign up two or three more accounts, edit the emails in `database/06_demo_roles.sql`, and run it to make an admin, a councillor and a department officer.

## Demo walkthrough

1. Citizen: `/report`, add a description like "street light not working", tap the map inside a demo ward
   (for example latitude 11.025, longitude 77.003 is Peelamedu), submit.
2. Councillor (`/authority/dashboard`): Acknowledge, then Forward to Department.
3. Department officer (`/department/dashboard`): Accept, Start Work, Mark Completed.
4. Citizen: on the complaint page answer YES (resolved) or NO (reopened, back to level 1).
5. Reminders and escalation: as admin (`/admin`) use "Advance demo clock" once for a reminder and again for an escalation.

## Project layout

```
app/          pages and server actions ((app) = logged-in area)
components/   reusable UI
lib/          auth, Supabase clients, helpers
services/     ai/ routing/ escalation/ sla/ notifications/ timeline/
database/     SQL: schema, RLS, demo seed
types/
```

## Not built yet

Notification preferences, profile page, extra evidence and completion photo uploads, "Request Information" action,
admin screens for managing users / wards / hierarchy / SLA (edit in SQL for now), admin filters,
department and monthly charts, email / WhatsApp sending, a scheduled job for `runEscalationCheck`.
