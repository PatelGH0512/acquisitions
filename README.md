# Acquisitions API (Docker + Neon)

This project is a Node.js (ESM) Express API using Drizzle ORM and Neon.

## Environments

### Development (Neon Local via Docker)

In development, you run **Neon Local** (a local proxy to your Neon Cloud project) alongside the API.

- The API connects to the Neon Local Postgres endpoint:
  - `postgres://neon:npg@neon-local:5432/dbname?sslmode=require`
- Neon Local automatically creates an ephemeral branch on startup and deletes it when stopped.

#### Prereqs

- Docker / Docker Compose
- A Neon account +:
  - `NEON_API_KEY`
  - `NEON_PROJECT_ID`
  - optionally `PARENT_BRANCH_ID` (parent branch to fork)

#### Start dev stack

1. Create an env file (recommended):

```bash
cp .env.development .env
```

2. Start:

```bash
docker compose -f docker-compose.dev.yml up --build
```

API should be available at:

- `http://localhost:3000/`
- `http://localhost:3000/health`

### Production (Neon Cloud)

In production, you connect directly to **Neon Cloud** using the managed `DATABASE_URL` (no Neon Local container).

`docker-compose.prod.yml` only runs the API. It expects `DATABASE_URL` to be injected from the environment.

#### Start “prod-like” stack locally

1. Create an env file (recommended):

```bash
cp .env.production .env
```

2. Start:

```bash
docker compose -f docker-compose.prod.yml up --build
```

## Environment variable switching

- **Development** (Neon Local):
  - `NEON_LOCAL=true`
  - `NEON_LOCAL_ENDPOINT=http://neon-local:5432/sql`
  - `DATABASE_URL=postgres://neon:npg@neon-local:5432/dbname?sslmode=require`

- **Production** (Neon Cloud):
  - `NEON_LOCAL=false`
  - `DATABASE_URL=postgres://...neon.tech/...`

> Note: With the Neon **serverless** driver, Neon Local requires `fetchEndpoint` to be set. This repo handles that in `src/config/database.js` when `NEON_LOCAL=true`.
