# –dle Hub

A web application for collecting, organizing, and sharing "-dle" style games.

> This is not a real application. This is an example project to prepare for [Hack the 6ix 2025](https://hackthe6ix.com/).

![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-20.10.24-blue?style=flat&logo=docker)
![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-0.31.4-blue?style=flat&logo=drizzle)
![Nix](https://img.shields.io/badge/Nix-2.29.1-blue?style=flat&logo=nixos)

## Features

### User Authentication

- **GitHub OAuth** - Secure authentication via GitHub
- **Session Management** - Persistent login sessions with better-auth

### Game List Management

- **Multiple Lists** - Create and organize multiple game collections
- **Customizable Metadata** - Add names, tags, and descriptions to each list
- **URL Integration** - Add any game URL with automatic site name extraction
- **Privacy Controls** - Mark lists as public or private
- **Drag & Drop Reordering** - Intuitive list organization

### Discovery & Social Features

- **Explore Page** - Browse all public game lists
- **Trending Content** - "New" and "Top Rated" tabs for discovery
- **Voting System** - Simple thumbs-up/down rating for lists
- **User Profiles** - Individual pages showcasing public lists

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router and Server-Side Rendering
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL 16](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Containerization**: [Docker](https://www.docker.com/) & Docker Compose
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Development**: [Nix](https://nixos.org/) development environment

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) & Docker Compose
- Optional: [Nix](https://nixos.org/) for reproducible development environment

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd matt-init-example-project
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # If you're using Nix, you can also run:
   nix develop
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

4. **Start NextJS and the database**

   ```bash
   pnpm run dev
   ```

5. **Run database migrations**

   ```bash
   pnpm run db:push
   ```

The application will be available at `http://localhost:3000`.

This will set up all necessary dependencies automatically.

## Available Scripts

- `pnpm run dev` - Start development server with database
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Fix ESLint issues
- `pnpm run db:migrate` - Run database migrations
- `pnpm run db:generate` - Generate migration files
- `pnpm run db:push` - Push schema changes to database
- `pnpm run db:studio` - Open Drizzle Studio
- `pnpm run dev:db` - Start PostgreSQL container
- `pnpm run db:down` - Stop database container
- `pnpm run db:reset` - Reset database container
- `pnpm run db:wipe` - Wipe database and volumes

## Project Structure

```text
src/
├── app/                    # Next.js App Router pages
│   ├── api/auth/          # Authentication API routes
│   ├── dashboard/         # User dashboard
│   ├── signin/           # Sign in page
│   ├── signup/           # Sign up page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication configuration
│   ├── env.ts            # Environment validation
│   └── db/               # Database configuration
│       ├── index.ts      # Database connection
│       └── schema/       # Database schemas
└── middleware.ts         # Next.js middleware
```

## Database Schema

The application uses Drizzle ORM with PostgreSQL. Key entities include:

- **Users** - User authentication and profile data
- **Game Lists** - User-created collections of games
- **Games** - Individual game entries with URLs and metadata
- **Votes** - User ratings for public lists
- **Sessions** - Authentication session management
