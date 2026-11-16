# Business Management System (NestJS API)

REST API built with NestJS for company operations: employees, work hours, leave management, and an ordering system for company-manufactured products.

## Key Features

### User Management & RBAC

Strict Role-Based Access Control (RBAC):

- **User (Employee):** View personal work logs, request annual leave, and track days off.
- **Admin (Department Head):** Manage employees within their sector, approve/reject leave requests, and monitor team performance.
- **Super Admin (Owner/Director):** Full system access, departments, administrator assignments, and overall business reporting.

### Time Tracking & Absences

- **Attendance Tracking:** Digital check-in/check-out for work hours.
- **Leave Management:** Workflow for requesting and approving vacations and sick leaves.

### Production & Ordering

- **Order Management:** Catalog of company products with placing and tracking orders.
- **Product Catalog:** CRUD for items produced by the company.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | NestJS (Node.js) |
| Database | MySQL / MariaDB |
| ORM | TypeORM |
| Cache / sessions | Redis |
| Authentication | Passport.js & JWT (httpOnly cookies) |
| API docs | Swagger (`/api`, non-production only) |
| Email | Nodemailer / Resend |

## Prerequisites

- Node.js **v18+** (v20 recommended; see `Dockerfile`)
- npm
- MySQL 8 or MariaDB (local install or Docker)
- Redis

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/SlobodanSkaric/inco81app.git
cd inco81app/backand81
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root (same folder as `package.json`). Example:

```env
# Database (MySQL / MariaDB — not PostgreSQL)
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=inco81app
DATABASE_USERNAME=schara81
DATABASE_PASSWORD=your_password
DATABASE_DIALECT=mysql
# Use DATABASE_DIALECT=mariadb if you connect to MariaDB

# App
APP_PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
TRUST_PROXY_HOPS=0
THROTTLE_LIMIT=200

# JWT (httpOnly cookies)
SECRET_TOKEN_KEY=change_me_access_secret
SECRET_REFRESH_TOKEN_KEY=change_me_refresh_secret

# Redis
REDIS_URL=redis://127.0.0.1:6379
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
# REDIS_PASSWORD=

# PDF export paths
SERVER_PDF_PATH=./exports/
HOST_MACHINE_PDF_PATH=/path/on/host/for/pdfs/

# Mail (optional for local bootstrap)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
ADMIN_EMAIL=
# RESEND_API_KEY=

# Fingerprint risk thresholds (Redis)
REDIS_RECENT_COUNT=45
FP_SOFT_THRESHOLD=30
FP_HARD_THRESHOLD=70
```

`synchronize` is **disabled**. Schema changes go through TypeORM migrations.

### 4. Start database and Redis (optional via Docker)

```bash
docker compose up -d db redis
```

- MySQL is exposed on host port **3306**.
- Redis inside Compose is already aligned: the `app` service gets `REDIS_HOST=redis` and `REDIS_PORT=6379` (container network). Host mapping `6380:6379` only matters if Nest runs on the host and Redis runs in Docker — then point `.env` at `127.0.0.1:6380`. For a local Redis on `6379`, keep the default `.env` values.

### 5. Run migrations

```bash
npm run migration:run
```

Useful migration scripts:

| Script | Purpose |
| --- | --- |
| `npm run migration:generate -- src/migrations/Name` | Generate a new migration |
| `npm run migration:run` | Apply pending migrations |
| `npm run migration:revert` | Revert the last migration |
| `npm run migration:show` | Show migration status |

### 6. Create a super administrator (optional)

```bash
npm run superadmin:create
```

### 7. Run the application

```bash
# development (watch mode)
npm run start:dev

# production build
npm run build
npm run start:prod
```

API listens on `APP_PORT` (default **3000**).

Swagger UI (when `NODE_ENV` is not `production`): [http://localhost:3000/api](http://localhost:3000/api)

Auth uses the httpOnly `access_token` cookie — log in via a `/auth` endpoint from Swagger so the browser sends the cookie automatically.

## Docker (full stack)

```bash
docker compose up --build
```

Starts MySQL, Redis, and the Nest app. Ensure `.env` exists; Compose overrides DB/Redis hosts for the `app` service.

## Project scripts

| Script | Description |
| --- | --- |
| `npm run start:dev` | Dev server with reload |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run compiled app |
| `npm run migration:run` | Run DB migrations |
| `npm run superadmin:create` | CLI: create super admin |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests |
