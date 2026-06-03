# Real-Time Analytics & Reporting Platform

A production-grade full-stack platform for ingesting data, visualizing metrics via customizable dashboards, managing threshold alerts, and scheduling reports.

## Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI · SQLAlchemy 2.0 · Alembic · PostgreSQL |
| Auth | JWT (access + refresh) · bcrypt |
| Queue | Celery · Redis · Celery Beat |
| Reports | ReportLab (PDF) |
| Real-Time | FastAPI WebSocket |
| Frontend | Next.js 14 · TypeScript · Zustand · Recharts · TanStack Query |
| Observability | OpenTelemetry SDK · OTLP exporter |
| Infra | Docker Compose |
| CI | GitHub Actions |

## Quick Start

### Prerequisites
- Docker & Docker Compose

### 1. Clone and configure

```bash
git clone <repo>
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Edit `backend/.env` — at minimum set `SECRET_KEY` and SMTP credentials.

### 2. Run

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/docs |
| Flower (Celery) | http://localhost:5555 |

### 3. Database migrations

Runs automatically on backend startup via `alembic upgrade head`.

To create a new migration:
```bash
cd backend
alembic revision --autogenerate -m "description"
```

## Architecture

```
backend/
├── app/
│   ├── api/v1/         # Route handlers (auth, orgs, ingestion, dashboards, alerts, reports, ws)
│   ├── core/           # Config, security (JWT/bcrypt), deps, telemetry
│   ├── db/             # AsyncEngine, session, Base
│   ├── models/         # SQLAlchemy ORM models
│   ├── schemas/        # Pydantic v2 request/response schemas
│   ├── services/       # Business logic (stateless, DB-injected)
│   ├── tasks/          # Celery tasks (ingestion, alerts, reports)
│   └── workers/        # WebSocket connection manager
frontend/
├── src/
│   ├── app/            # Next.js 14 App Router pages
│   ├── components/     # UI components (WidgetCard, Sidebar)
│   ├── lib/            # API client (axios + JWT refresh), WebSocket hook
│   ├── store/          # Zustand stores (auth, org)
│   └── types/          # TypeScript domain types
```

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/signup` | Register |
| POST | `/api/v1/auth/signin` | Login |
| POST | `/api/v1/auth/refresh` | Refresh tokens |
| POST | `/api/v1/orgs` | Create organization |
| POST | `/api/v1/orgs/{id}/invite` | Invite member |
| POST | `/api/v1/ingest/events` | Bulk event ingest (API key) |
| POST | `/api/v1/orgs/{id}/ingest/csv` | CSV upload |
| POST | `/api/v1/ingest/webhook/{source_id}` | Webhook receiver |
| CRUD | `/api/v1/orgs/{id}/dashboards` | Dashboard management |
| CRUD | `/api/v1/orgs/{id}/alerts` | Alert management |
| POST | `/api/v1/orgs/{id}/alerts/{id}/mute` | Mute alert |
| CRUD | `/api/v1/orgs/{id}/reports` | Report scheduling |
| WS | `/api/v1/ws/{org_id}?token=...` | Real-time stream |

## Multi-Tenancy

Shared schema with `org_id` column on all tenant-scoped tables. All queries filter by `org_id` enforced at the service layer. Users can belong to multiple organizations with independent roles.

## Role Hierarchy

`Owner → Admin → Analyst → Viewer`

- Owner/Admin: full CRUD + member management
- Analyst: create/edit dashboards, alerts, reports
- Viewer: read-only

## Running Tests

```bash
cd backend
pytest --cov=app -q
```

## Environment Variables

See `backend/.env.example` for all required variables.
