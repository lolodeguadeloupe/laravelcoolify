# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Laravel React Starter Kit application using Inertia.js for seamless backend-frontend integration. Configured for deployment on Coolify (via nixpacks.toml and Dockerfile).

## Commands

### Development with Sail (Docker)
```bash
sail up -d                # Start containers (PostgreSQL + Laravel)
sail down                 # Stop containers
sail npm run dev          # Start Vite dev server (run after sail up)
sail artisan migrate      # Run migrations
sail artisan <command>    # Any artisan command
sail composer <command>   # Composer commands
sail shell                # Shell into container
sail tinker               # Laravel Tinker REPL
```

### Without Docker
```bash
composer run dev          # Start all dev services (PHP server, queue, logs, Vite)
npm run dev               # Vite dev server only
```

### Build & Production
```bash
npm run build             # Build frontend assets
npm run build:ssr         # Build with SSR support
composer run setup        # Full project setup (install deps, generate key, migrate, build)
```

### Testing & Quality
```bash
sail artisan test                        # Run Pest tests via Sail
sail artisan test --filter=TestName      # Run single test
sail pest tests/Feature/SomeTest.php     # Run specific test file
npm run lint                             # ESLint with auto-fix
npm run types                            # TypeScript type check
npm run format                           # Prettier format
```

## Architecture

### Backend (Laravel 12)
- **Routes**: `routes/web.php` (main), `routes/auth.php` (authentication), `routes/settings.php`
- **Controllers**: `app/Http/Controllers/` - Auth controllers handle registration, login, password reset, email verification
- **Authentication**: Laravel Fortify backend with Inertia-rendered React components

### Frontend (React 19 + TypeScript)
- **Entry point**: `resources/js/app.tsx` - Inertia app bootstrap with theme initialization
- **Pages**: `resources/js/pages/` - Inertia page components (auth/, settings/, dashboard.tsx, welcome.tsx)
- **Components**: `resources/js/components/` - Reusable components + `ui/` subdirectory for shadcn/ui primitives
- **Layouts**: `resources/js/layouts/` - Page layout wrappers
- **Path alias**: `@/*` maps to `resources/js/*`

### UI System
- **shadcn/ui**: Configured in `components.json` (new-york style, neutral base color)
- **Radix UI primitives**: Dialog, Dropdown, Avatar, Checkbox, etc.
- **Tailwind CSS v4**: Styles in `resources/css/app.css`
- **Icons**: Lucide React

### Inertia.js Integration
- Controllers return `Inertia::render('page-name')` which renders corresponding `resources/js/pages/page-name.tsx`
- Props passed from Laravel are available as React component props
- Laravel Wayfinder plugin generates typed route helpers

## Database

- **Development**: PostgreSQL 17 via Laravel Sail (docker-compose.yml)
- **Connection**: `DB_HOST=pgsql`, `DB_PORT=5432`
- Migrations: `database/migrations/`
- Seeders: `database/seeders/`

## Deployment

Configured for Coolify deployment:
- `nixpacks.toml`: Nixpacks build configuration
- `Dockerfile`: Alternative Docker-based deployment with nginx + supervisor
