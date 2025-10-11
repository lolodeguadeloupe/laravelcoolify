# Laravel React Starter Kit

## Project Overview

This is a Laravel-based web application using React for the frontend, built with the Laravel React Starter Kit. The project utilizes:

- **Backend**: Laravel 12.x framework with PHP 8.2+
- **Frontend**: React 19.x with TypeScript, using Inertia.js for seamless integration with Laravel
- **Styling**: Tailwind CSS v4 with Tailwind CSS Animate
- **UI Components**: Radix UI primitives and Headless UI components
- **Build Tools**: Vite as the build tool with Laravel Vite Plugin
- **Database**: SQLite by default (configurable)

Key features include authentication (Laravel Fortify), Inertia.js for SPA-like experience, and a modern component-based architecture using React.

## Project Structure

```
├── app/                    # Application source code
│   ├── Http/              # Controllers, Middleware, Requests
│   ├── Models/            # Eloquent models
│   └── Providers/         # Service providers
├── resources/             # Frontend assets
│   ├── css/              # CSS files
│   └── js/               # React components and JavaScript
├── routes/               # Route definitions
├── database/             # Migrations, seeds, factories
├── config/               # Laravel configuration files
├── public/               # Publicly accessible files
└── storage/              # Storage for files and logs
```

## Building and Running

### Initial Setup

```bash
# Install dependencies
composer install
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Build frontend assets
npm run build
```

Alternatively, you can use the composer script:
```bash
composer run setup
```

### Development Mode

```bash
# Start development server with hot reloading
npm run dev

# Or use the comprehensive development command
composer run dev
```

This will start multiple processes simultaneously:
- PHP development server
- Queue listener
- Laravel Pail for logs
- Vite dev server

### Production Build

```bash
# Build frontend assets for production
npm run build
```

### Testing

```bash
# Run PHPUnit tests
composer run test

# Run ESLint for frontend code
npm run lint

# Run TypeScript type checking
npm run types

# Format code with Prettier
npm run format
```

## Key Technologies and Libraries

- **Laravel**: Modern PHP framework with built-in features for authentication, routing, sessions, etc.
- **React**: Component-based UI library
- **Inertia.js**: Allows building single-page apps with classic server-side routing
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible UI primitives
- **Headless UI**: Completely unstyled, fully accessible UI components
- **Vite**: Fast build tool with hot module replacement
- **Laravel Fortify**: Authentication backend package
- **Pest PHP**: PHP testing framework

## Development Conventions

### Code Style
- PHP code follows PSR-12 standards with Laravel conventions
- JavaScript/TypeScript code is formatted with Prettier
- PHP code is formatted with Laravel Pint
- ESLint is used for JavaScript/TypeScript linting

### Frontend Structure
- React components are located in `resources/js/`
- TypeScript is used throughout the frontend
- Components follow a component-first approach
- Inertia.js is used to pass props from Laravel controllers to React components

### Backend Structure
- Controllers are in `app/Http/Controllers/`
- Models are in `app/Models/`
- Middleware is in `app/Http/Middleware/`
- Routes are defined in `routes/`

## Environment Configuration

The application uses environment variables defined in `.env`. Key variables include:
- Database configuration (defaults to SQLite)
- Application URL and key
- Session and cache drivers
- Mail configuration
- Redis and queue settings

## Authentication

The application uses Laravel Fortify for authentication backend and provides React components for login, registration, and password reset functionality. The authentication state is managed through Laravel's session system and passed to React components via Inertia.

## Database

- Migrations are stored in `database/migrations/`
- Seeders are in `database/seeders/`
- Model factories are in `database/factories/`
- SQLite is used by default (can be changed to MySQL, PostgreSQL, etc.)

## API and Integration

The application uses Inertia.js to seamlessly integrate Laravel backend with React frontend. API endpoints can be created as standard Laravel routes that return Inertia responses instead of JSON.