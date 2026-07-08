# Nova - Productivity Workspace

**DecodeLabs Internship Final Project 4**  
**Author:** Muhammad Yahya

---

## Overview

Nova is a full-stack personal productivity workspace built with React, TypeScript, Tailwind CSS, and Supabase. It provides a centralized dashboard for managing projects, tasks, notes, bookmarks, and developer resources — all in one beautifully designed application with secure user authentication.

---

## Features

### 1. User Authentication
- Secure email/password signup and login via Supabase Auth
- Session persistence across browser refreshes
- Protected routes for authenticated users only

### 2. Dashboard
- Real-time statistics overview (projects, tasks, notes, bookmarks)
- Activity summary with task completion tracking
- Quick navigation to all workspace sections

### 3. Projects Management
- Create, edit, and delete projects
- Custom color coding for visual organization
- Status tracking: Active, Completed, Archived
- Project descriptions for detailed documentation

### 4. Tasks System
- Full CRUD operations for tasks
- Priority levels: Low, Medium, High, Urgent
- Status workflow: To-Do, In Progress, Completed, Cancelled
- Due date tracking with calendar integration
- Project association for organized task grouping
- Search and filter functionality

### 5. Notes
- Create personal notes with rich content
- Color coding for visual categorization
- Pin important notes to keep them at the top
- Clean, distraction-free editing experience

### 6. Bookmarks
- Save and organize important URLs
- Automatic favicon detection
- Category grouping for better organization
- Quick access to frequently used resources

### 7. Developer Resources
- Curated collection of development tools, libraries, and documentation
- Category system: Tool, Library, Documentation, Tutorial, Course, Other
- Tagging system for flexible organization
- Resource descriptions and direct links

### 8. UI/UX Highlights
- **Custom Nova branding** with distinctive warm color palette
- **Interactive logo animation** — the Nova logo spins based on scroll position
- **Responsive design** — works beautifully on desktop, tablet, and mobile
- **Smooth transitions** and micro-interactions throughout
- **Dark/light visual hierarchy** for excellent readability
- **Accessible design** with proper contrast ratios

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript |
| Styling | Tailwind CSS 3.4 |
| Routing | React Router DOM 7 |
| Icons | Lucide React |
| Backend | Supabase (PostgreSQL + Auth) |
| Build Tool | Vite 5 |
| Package Manager | npm |

---

## Project Structure

```
nova/
├── public/
│   └── Nova_Logo_Icon.png      # Custom logo asset
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # Main app shell with sidebar
│   │   ├── Loading.tsx         # Loading spinner component
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   └── Sidebar.tsx         # Side navigation menu
│   ├── context/
│   │   └── AuthContext.tsx     # Authentication state management
│   ├── hooks/
│   │   └── useScrollRotation.ts # Custom hook for logo spin
│   ├── lib/
│   │   └── supabase.ts         # Supabase client & type definitions
│   ├── pages/
│   │   ├── Auth.tsx            # Login/Signup page
│   │   ├── Dashboard.tsx       # Home dashboard
│   │   ├── Projects.tsx        # Projects management
│   │   ├── Tasks.tsx           # Tasks management
│   │   ├── Notes.tsx           # Notes management
│   │   ├── Bookmarks.tsx       # Bookmarks management
│   │   └── DeveloperResources.tsx # Developer resources
│   ├── App.tsx                 # Root component with routing
│   ├── main.tsx                # Application entry point
│   └── index.css               # Tailwind & custom styles
├── supabase/
│   └── migrations/
│       └── 20260707132800_create_nova_schema.sql # Database schema
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Database Schema

The application uses five main tables with Row Level Security (RLS) enabled:

| Table | Purpose |
|-------|---------|
| `projects` | User projects with name, color, status |
| `tasks` | Tasks linked to projects with priority & due dates |
| `notes` | Personal notes with pinning support |
| `bookmarks` | Saved URLs with categories |
| `developer_resources` | Developer tools and resources |

All tables implement owner-scoped access — users can only CRUD their own data.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/myahyashk/Nova.git
   cd Nova
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   
   Run the migration in your Supabase SQL editor:
   ```sql
   -- Contents of supabase/migrations/20260707132800_create_nova_schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type check |

---

## Screenshots

The application features a warm, professional design with:
- Custom Nova branding in cream, tan, and dark brown tones
- Interactive spinning logo that responds to scrolling
- Clean card-based layouts with subtle shadows
- Intuitive navigation with active state indicators

---

## Author

**Muhammad Yahya**  
*DecodeLabs Internship Participant*

---

## License

This project was created as part of the DecodeLabs Internship program.

---

## Acknowledgments

- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Lucide](https://lucide.dev/) for the beautiful icon set
- [React Router](https://reactrouter.com/) for client-side routing
