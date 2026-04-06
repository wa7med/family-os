# Family Life OS

A mobile-first Progressive Web App for managing your entire family's life — appointments, tasks, expenses, contracts, and more — all in one place.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** SQLite (better-sqlite3) + Drizzle ORM
- **Styling:** TailwindCSS 3 + shadcn/ui
- **Icons:** Lucide React
- **Data Fetching:** SWR
- **Containerization:** Docker + Docker Compose

## Features

- **Dashboard** — Urgent items, finance snapshot, contract alerts, daily focus
- **Calendar** — Month view with day-level item list
- **Appointments** — Doctor visits, school meetings, visa renewals
- **Tasks & Goals** — To-dos, habits with frequency tracking
- **Expenses** — Spending tracker with tax deduction support
- **Contracts** — Subscriptions & contracts with cancellation deadline engine
- **Family Members** — Role-based profiles (husband, wife, son, daughter, etc.) with emoji avatars
- **Quick Add (+)** — FAB button to quickly create any item type or add a member
- **PWA** — Installable on mobile with standalone display

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### Run (zero local installs)

```bash
docker compose up --build -d
```

The app will be available at **http://localhost:3000**.

On first run, the database is automatically created, migrated, and seeded with sample data.

### Reset Database

To wipe the database and start fresh:

```bash
docker compose down -v
docker compose up -d
```

### Useful Commands

| Command | Description |
|---|---|
| `docker compose up -d` | Start in background |
| `docker compose logs -f app` | Follow live logs |
| `docker compose down` | Stop containers |
| `docker compose down -v` | Stop and delete volumes (reset DB) |
| `docker compose up --build -d` | Rebuild image and start |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # RESTful API endpoints
│   │   ├── appointments/   # GET, POST
│   │   ├── calendar/       # GET (date range query)
│   │   ├── contracts/      # GET, POST
│   │   ├── dashboard/      # GET (aggregated data)
│   │   ├── expenses/       # GET, POST
│   │   ├── family-members/ # GET, POST
│   │   ├── items/          # GET (filtered)
│   │   └── tasks/          # GET, POST
│   ├── appointments/       # Appointments list & new form
│   ├── calendar/           # Calendar page
│   ├── contracts/          # Contracts list & new form
│   ├── family/             # Family list, detail & new member form
│   ├── money/              # Expenses list & new form
│   ├── tasks/              # Tasks list & new form
│   ├── layout.tsx          # Root layout with AppShell
│   └── page.tsx            # Dashboard (home)
├── components/
│   ├── layout/             # AppShell, BottomNav, TopBar, QuickAddModal
│   ├── shared/             # FamilyBadge, PriorityBadge, EmptyState
│   └── ui/                 # shadcn/ui primitives (Button, Card, Badge, etc.)
├── db/
│   ├── index.ts            # Drizzle ORM client
│   ├── schema.ts           # Database schema definitions
│   └── seed.ts             # Sample data seeder
├── hooks/
│   └── use-fetch.ts        # SWR-based data fetching + API helpers
└── lib/
    ├── constants.ts        # Roles, categories, colors, avatars
    ├── db-migrate.ts       # Raw SQL migration script
    ├── deadline-engine.ts  # Contract cancellation deadline logic
    └── utils.ts            # Utility functions (cn)
```

## Data Model

- **family_members** — Name, role, sex, date of birth, color, avatar
- **items** — Unified table for all item types (appointment, task, expense, contract)
- **appointments** — Location, category, reminders, recurrence
- **tasks** — Category, habit tracking, frequency, goals
- **expenses** — Amount, currency, tax deduction, receipt
- **contracts** — Provider, cost, dates, notice period, auto-renew, cancellation deadline

## Family Member Roles

| Role | Avatar |
|---|---|
| Husband | 👨 |
| Wife | 👩 |
| Son | 👦 |
| Daughter | 👧 |
| Grandfather | 👴 |
| Grandmother | 👵 |
| Aunt | 👩 |
| Uncle | 👨 |
| Relative | 🧑 |

## License

Private project.
