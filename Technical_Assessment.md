# Technical Assessment

## Senior Full Stack Engineer (Python)

### Project Brief

Build a Real-Time Analytics & Reporting Platform that allows
organizations to ingest data from multiple sources, visualize metrics
through customizable dashboards, set up alerts, and generate scheduled
reports.

------------------------------------------------------------------------

## Authentication & Multi-Tenancy

-   Sign up / Sign in with email & password
-   JWT access token + refresh token
-   OAuth2 integration (optional)
-   Organization creation & invite onboarding
-   Role hierarchy: Owner → Admin → Analyst → Viewer
-   Permission guards
-   Organization-level data isolation

## Data Ingestion & Sources

-   REST API endpoint for event ingestion
-   CSV uploads & webhook receivers
-   Event schema validation using Pydantic
-   Async event processing via Celery + Redis
-   Data normalization and storage
-   Rate limiting
-   API key management

## Dashboards & Visualizations

-   Custom dashboards
-   Line, bar, pie, KPI, and table widgets
-   Saved queries & configurable time ranges
-   Dashboard sharing
-   Auto-refresh
-   Dashboard templates
-   Full-screen mode

## Alerts & Notifications

-   Threshold-based alerts
-   Celery Beat scheduling
-   Email, in-app, and webhook notifications
-   Alert history
-   Mute/snooze alerts
-   Alert statuses

## Scheduled Reports

-   Daily, weekly, monthly reports
-   PDF/PNG snapshots
-   Email delivery
-   Report archive

## Real-Time Features

-   WebSocket updates
-   Real-time alerts
-   Live event stream viewer
-   Automatic reconnection

## Technical Specifications

### Frontend

-   Next.js 14+
-   React 18+ with TypeScript
-   Zustand or Redux Toolkit
-   Tailwind CSS or Shadcn/UI
-   Recharts, Chart.js, or D3.js
-   TanStack Query
-   WebSocket client

### Backend

-   FastAPI or Django REST Framework
-   Python 3.11+
-   PostgreSQL
-   SQLAlchemy 2.0 or Django ORM
-   Alembic or Django migrations
-   Celery + Redis
-   Pydantic v2
-   pytest + pytest-asyncio + httpx

## Architecture Expectations

-   Clean Architecture
-   Async/await throughout
-   Centralized error handling
-   Security best practices
-   Optimized database design
-   Background processing
-   Observability

## Deliverables

1.  GitHub Repository
2.  README.md
3.  Deployed Demo

## Evaluation Criteria

  Criteria                             Weight
  ------------------------------------ --------
  Python Code Quality & Architecture   30%
  Functionality & Completeness         25%
  UI/UX & Frontend                     10%

## Bonus Points

-   GraphQL API
-   OpenTelemetry
-   SQL query sandbox
-   Data retention policies
-   Webhook retry system
-   CI/CD pipeline
-   Load testing
-   Feature flags
