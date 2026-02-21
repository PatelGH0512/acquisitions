# Acquisitions API

**Acquisitions** is a Node.js (ESM) **Express REST API** that demonstrates a production-style backend setup:

- **Authentication** with JWT stored in **HttpOnly cookies**
- **Role-based access control (RBAC)** for protected endpoints
- **PostgreSQL** persistence via **Drizzle ORM**
- **Neon** support (Neon Cloud in prod, **Neon Local** in dev via Docker)
- **Security & rate limiting** via **Arcjet** + **Helmet**
- Structured **logging** with **Winston** + request logging with **Morgan**
- **Validation** with **Zod**
- **Testing** with **Jest** + **Supertest**

This README is written to be recruiter-friendly: it explains the architecture, data flow, and how the system works end-to-end.

---

## 1) Big Picture

- **Project type**
  - Backend web service / REST API
- **Problem it solves**
  - Provides a clean baseline for building an API with user management (CRUD), authentication, authorization, validation, logging, and a modern Postgres workflow.

---

## 2) Core Architecture

This repo follows a **layered Express architecture** (a “modular monolith”):

- **Routes** define URL → controller mappings.
- **Controllers** handle HTTP concerns (req/res), validation, and orchestration.
- **Services** contain business logic and database access using Drizzle.
- **Middleware** enforces cross-cutting concerns (auth, RBAC, security policies).
- **Models** define the database schema.

### High-level folder layout

```text
src/
  app.js                      # Express app (middleware + routes)
  index.js                    # Loads env and starts the server
  server.js                   # app.listen()
  config/
    database.js               # Neon serverless driver + Drizzle setup
    logger.js                 # Winston logger
    arcjet.js                 # Arcjet security client + default rules
  controllers/
    auth.controller.js        # signup controller (validation + JWT cookie)
    users.controller.js       # users CRUD controllers
  middleware/
    auth.middleware.js        # authenticateToken + requireRole
    security.middleware.js    # Arcjet protect() + role-based rate limits
  models/
    user.model.js             # Drizzle schema (users table)
  routes/
    auth.routes.js            # /api/auth routes
    users.routes.js           # /api/users routes
  services/
    auth.service.js           # createUser + password hashing
    users.services.js         # get/update/delete users
  utils/
    jwt.js                    # JWT sign/verify wrapper
    format.js                 # Zod error formatting
  validations/
    auth.validations.js       # Zod schemas for auth payloads
    users.validation.js       # Zod schemas for user params/body

drizzle/                      # Generated migrations/meta
tests/                        # Jest tests
docker-compose.*.yml          # Dev + prod container stacks
```

---

## 3) Key Components (What Each Part Does)

### Entry points

- **`src/index.js`**
  - Loads environment variables via `dotenv/config`
  - Imports `server.js`
- **`src/server.js`**
  - Starts the HTTP server (`app.listen(PORT)`)
- **`src/app.js`**
  - Configures Express middleware
  - Registers routes
  - Provides a fallback `404` handler

### Routing layer

- **`src/routes/auth.routes.js`**
  - `POST /api/auth/sign-up` → `signup`
  - Includes placeholder handlers for `sign-in` and `sign-out`
- **`src/routes/users.routes.js`**
  - Protects endpoints with `authenticateToken`
  - Uses `requireRole(['admin'])` for admin-only delete

### Controller layer

- **`src/controllers/auth.controller.js`**
  - Validates payload with Zod (`signupSchema`)
  - Calls service `createUser`
  - Generates a JWT and sets it as an **HttpOnly cookie**
- **`src/controllers/users.controller.js`**
  - Validates params/body with Zod
  - Enforces authorization rules (self-update vs admin update)
  - Calls users services for DB operations

### Service layer (business logic + DB access)

- **`src/services/auth.service.js`**
  - Hashes passwords with `bcrypt`
  - Inserts users via Drizzle
- **`src/services/users.services.js`**
  - Implements user read/update/delete operations
  - Uses `drizzle-orm` queries (`select`, `update`, `delete`, `eq`)

### Database & schema

- **`src/config/database.js`**
  - Uses **Neon serverless driver** (`@neondatabase/serverless`)
  - Creates `sql` via `neon(DATABASE_URL)`
  - Creates a Drizzle client via `drizzle(sql)`
  - Supports **Neon Local** by setting `neonConfig.fetchEndpoint` when `NEON_LOCAL=true`
- **`src/models/user.model.js`**
  - Defines `users` table schema (id, name, email, password, role, createdAt, updatedAt)

### Middleware

- **`src/middleware/auth.middleware.js`**
  - Reads `token` cookie
  - Verifies token via `utils/jwt.js`
  - Sets `req.user`
  - `requireRole([...])` enforces RBAC for routes
- **`src/middleware/security.middleware.js`**
  - Runs Arcjet protection on requests
  - Applies different **rate limits** by `req.user.role` (`guest`, `user`, `admin`)

### Validation & utilities

- **Zod validation**
  - `src/validations/*.js`
- **JWT wrapper**
  - `src/utils/jwt.js` wraps `jsonwebtoken` sign/verify and centralizes secret/expiry
- **Validation error formatting**
  - `src/utils/format.js`

---

## 4) Data Flow & Communication

### Request flow (ASCII diagram)

```text
Client
  |
  |  HTTP request
  v
Express app (src/app.js)
  |
  |  helmet, cors, json, cookie-parser, morgan
  v
Arcjet Security Middleware (src/middleware/security.middleware.js)
  |
  |  protect(): bot detection, shield rules, rate limiting
  v
Routes (src/routes/*.routes.js)
  |
  |  (optional) authenticateToken / requireRole
  v
Controllers (src/controllers/*.controller.js)
  |
  |  Zod validation + orchestration
  v
Services (src/services/*.js)
  |
  |  Drizzle ORM queries
  v
Postgres (Neon Cloud or Neon Local)
  |
  v
Response (JSON + status codes + cookies)
```

### Internal communication

- **Controllers → Services**: direct JS imports, async calls
- **Services → DB**: Drizzle ORM over the Neon serverless driver
- **Middleware → Controllers**: middleware attaches `req.user` used downstream

---

## 5) Tech Stack & Dependencies

### Runtime

- **Node.js** (ES Modules)
- **Express 5**: web framework
- **PostgreSQL**: database
- **Neon serverless driver** (`@neondatabase/serverless`): serverless Postgres connectivity
- **Drizzle ORM** (`drizzle-orm`): typed SQL builder/ORM

### Security

- **Helmet**: common HTTP security headers
- **Arcjet** (`@arcjet/node`, `@arcjet/inspect`):
  - Shield protections (common attacks)
  - Bot detection
  - Sliding window rate limiting

### Auth

- **jsonwebtoken**: JWT sign/verify
- **cookie-parser**: parse HttpOnly cookie token
- **bcrypt**: password hashing

### Validation + DX

- **zod**: runtime input validation
- **winston**: application logging
- **morgan**: HTTP request logging
- **dotenv**: environment variable loading

### Testing & quality

- **jest**: unit/integration test runner
- **supertest**: HTTP assertions for Express
- **eslint** + **prettier**: linting/formatting

### DevOps

- **Docker / Docker Compose**: reproducible local dev & prod-like runs
- **drizzle-kit**: migrations/studio

---

## 6) Execution Flow (Typical Workflows)

### Example: User sign-up (`POST /api/auth/sign-up`)

```text
POST /api/auth/sign-up
  -> auth.routes.js
  -> auth.controller.js (Zod validate)
  -> auth.service.js (bcrypt hash + Drizzle insert)
  -> controller signs JWT + sets cookie("token", ...)
  -> 201 Created + user payload
```

**What you send (example)**

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "supersecret",
  "role": "user"
}
```

**What you get back (example)**

```json
{
  "message": "User Registered",
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "role": "user"
  }
}
```

### Example: Fetch users (`GET /api/users`)

```text
GET /api/users
  -> security middleware (Arcjet)
  -> authenticateToken reads req.cookies.token
  -> users.controller.js fetchAllUsers()
  -> users.services.js getAllUsers() (Drizzle select)
  -> 200 OK + list
```

---

## 7) Environments & Deployment Model

### Development (Neon Local via Docker)

In development, you run **Neon Local** (a local proxy to your Neon Cloud project) alongside the API.

- The API connects to the Neon Local endpoint:
  - `postgres://neon:npg@neon-local:5432/dbname?sslmode=require`
- Neon Local creates an ephemeral branch on startup and deletes it on shutdown.

#### Prerequisites

- Docker / Docker Compose
- Neon credentials in `.env.development` (used by Neon Local)

#### Start dev stack

```bash
docker compose -f docker-compose.dev.yml up --build
```

API endpoints:

- `http://localhost:3000/`
- `http://localhost:3000/health`
- `http://localhost:3000/api`

### Production (Neon Cloud)

In production, the API connects directly to **Neon Cloud** using `DATABASE_URL`.

```bash
docker compose -f docker-compose.prod.yml up --build
```

### Environment variable switching

- **Development** (Neon Local):
  - `NEON_LOCAL=true`
  - `NEON_LOCAL_ENDPOINT=http://neon-local:5432/sql`
  - `DATABASE_URL=postgres://neon:npg@neon-local:5432/dbname?sslmode=require`
- **Production** (Neon Cloud):
  - `NEON_LOCAL=false`
  - `DATABASE_URL=postgres://...neon.tech/...`

Important implementation detail:

- When `NEON_LOCAL=true`, `src/config/database.js` sets `neonConfig.fetchEndpoint` because the Neon serverless driver needs an explicit fetch endpoint for Neon Local.

---

## 8) Database Migrations (Drizzle)

Commands:

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

Drizzle schema is defined in:

- `src/models/*.js`

---

## 9) Testing

Run tests:

```bash
npm test
```

Tests live in:

- `tests/app.test.js`

---

## 10) Strengths & Tradeoffs

### Strengths

- Clear separation of concerns (routes/controllers/services/middleware)
- Strong runtime validation with Zod
- Secure-by-default baseline (Helmet + Arcjet + HttpOnly cookie auth)
- Modern Postgres workflow with Neon + Drizzle migrations
- Dockerized dev/prod workflows

### Tradeoffs / things to watch

- `sign-in` and `sign-out` are currently placeholders in `auth.routes.js` (signup is implemented).
- JWT secret defaults to a placeholder in `src/utils/jwt.js` and **must be overridden** in real deployments.
- Password update flow exists in validation but is not yet wired to re-hash on update (current `updateUser` updates fields as provided).

---

## 11) 2–3 Sentence Summary (for teammates)

Acquisitions is a layered Express API that uses Drizzle ORM over Neon Postgres to provide user authentication and user management endpoints. Requests flow through security middleware (Helmet/Arcjet), optional JWT/RBAC middleware, then controllers that validate input with Zod and call services for database operations. The project is container-ready, testable with Jest/Supertest, and designed as a solid backend starter for production-style APIs.
