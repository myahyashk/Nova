# Nova - Productivity Workspace

**DecodeLabs Internship Final Project 4**

---

## Overview

Nova is a personal productivity workspace built with React, TypeScript, and Tailwind CSS. It provides a centralized dashboard for managing projects, tasks, notes, bookmarks, and developer resources — all in one app with sign-up/login, a global search, file attachments on projects, and a rich text editor for notes.

**This build works out of the box — no setup, no API keys, no database needed.** Sign up with any email/password and everything just works.

---

## Features

### 1. Authentication
- Sign up / log in with any email and password (no real account needed)
- Protected routes for authenticated users only
- Editable Profile page (name + bio), shown in the navbar and dashboard

### 2. Dashboard
- Stat cards for projects, tasks, notes, bookmarks, dev resources
- **Due Soon widget** — overdue and upcoming tasks, sorted soonest first
- Task status breakdown chart
- Recent tasks and active projects

### 3. Projects
- Create, edit, delete projects with color coding and status
- **File attachments** — drag-and-drop or click to browse, with type and size validation (PDF, Word, text, spreadsheets, slides, images, `.zip`, `.json` — 10MB max per file)

### 4. Tasks
- Priority levels and status workflow (To-Do → In Progress → Completed / Cancelled)
- Due dates, feeding the Dashboard's Due Soon widget
- Search and filter

### 5. Notes
- **Rich text editor** — bold, italic, underline, font size
- Color coding and pinning

### 6. Bookmarks & Developer Resources
- Save URLs and dev tools/links with categories and tags

### 7. Global Search
- One search bar in the navbar, searches across tasks, notes, bookmarks, and resources at once

### 8. UI/UX
- Custom Nova branding, warm navy/tan/cream palette
- Interactive logo that spins based on scroll position
- Compass-themed empty states
- Responsive layout

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript |
| Styling | Tailwind CSS 3.4 |
| Routing | React Router DOM 7 (HashRouter) |
| Icons | Lucide React |
| Charts | Recharts |
| Data | In-memory mock store (see note below) |
| Build Tool | Vite 5 |

---

## Important: this build uses a mock backend

`src/lib/supabase.ts` is **not** the real Supabase client — it's a lightweight in-memory mock that mimics the same API surface (`auth.signUp`, `auth.signInWithPassword`, `from(table).select/insert/update/delete`, etc.) so the whole app works without any backend setup.

What this means:
- Any email/password "works" for sign up/login — it's not real authentication
- Data (tasks, notes, projects, bookmarks, resources, profile) lives only in memory for that browser tab/session
- **Refreshing the page resets everything back to the seeded demo data**
- Logging out and back in *without* refreshing keeps your changes (the mock store survives sign-out)

This is intentional — it's meant to be an instantly-working demo/portfolio piece, not a real multi-user product.

### If you want real persistence later
Swap `src/lib/supabase.ts` back to a real `@supabase/supabase-js` client (the `Project`, `Task`, `Note`, `Bookmark`, `DeveloperResource` type shapes and the SQL schema in `supabase/migrations/` already match), add a `.env` with:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
and run the migration in `supabase/migrations/` against your Supabase project. You would also want to add a `profiles` table (user_id, full_name, bio) since that one was added for the mock and isn't in the original migration.

---

## Project Structure

```
nova/
├── public/
│   └── Nova_Logo_Icon.png
├── src/
│   ├── components/
│   │   ├── Layout.tsx           # App shell, fixed-height with internal scroll
│   │   ├── Navbar.tsx           # Top bar: logo, global search, profile badge
│   │   ├── Sidebar.tsx          # Side navigation
│   │   ├── GlobalSearch.tsx     # Cross-page search
│   │   ├── FileUpload.tsx       # Drag/drop + validation for project attachments
│   │   ├── RichTextEditor.tsx   # Bold/italic/underline/size editor for Notes
│   │   ├── EmptyState.tsx       # Shared compass-themed empty state
│   │   └── Loading.tsx
│   ├── context/
│   │   └── AuthContext.tsx      # Auth + profile state
│   ├── hooks/
│   │   └── useScrollRotation.ts # Logo spin-on-scroll
│   ├── lib/
│   │   ├── supabase.ts          # Mock backend (see note above)
│   │   └── logo.ts              # Base64-embedded logo
│   ├── pages/
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Projects.tsx
│   │   ├── Tasks.tsx
│   │   ├── Notes.tsx
│   │   ├── Bookmarks.tsx
│   │   ├── DeveloperResources.tsx
│   │   └── Profile.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/migrations/         # Reference schema, for if you go real Supabase later
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```



## Author
**Muhammad Yahya**
*DecodeLabs Internship Participant*
