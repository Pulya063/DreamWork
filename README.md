# DreamWork

> Career growth assistant that helps a user understand where they are now, where they want to go, and what concrete steps will move them toward that goal.

## Why This App Exists

DreamWork is a web application focused on practical career navigation.
Its main goal is not just to "show information", but to help a person:

- evaluate their current position
- simulate a path toward a desired role
- receive a learning roadmap with phases and tasks
- track progress over time
- stay motivated through clear next steps

In simple terms, DreamWork acts like a digital career companion between "I want a better future" and "here is what I should do this week".

---

## Social Value

DreamWork is socially useful because it lowers the barrier to professional growth.
For many people, career switching or upskilling is emotionally heavy, financially risky, and full of uncertainty.

The application can help:

- students who do not yet understand how to build a career path
- junior specialists who want to move into stronger roles
- people changing profession and needing a structured plan
- users with limited time who need realistic study pacing
- anyone who benefits from turning anxiety into a step-by-step plan

Its core social contribution is clarity.
Instead of vague advice like "learn more" or "improve your skills", DreamWork translates ambition into specific actions, milestones, and measurable progress.

---

## Main Product Idea

DreamWork combines:

- profile management
- career simulation
- roadmap generation
- task tracking
- AI support
- learning resource discovery

The result is a product that can play several roles at once:

### 1. Career Navigator

Helps the user choose a target role and understand the distance between current skills and desired outcomes.

### 2. Learning Planner

Builds a phased study plan with tasks, topics, deadlines, and supporting resources.

### 3. Progress Tracker

Shows active tasks, completed work, due-soon items, and overall progress metrics.

### 4. AI Assistant

Supports the user with advice and task verification logic.

### 5. Motivation Layer

Turns large career goals into visible, manageable steps that feel achievable.

---

## What DreamWork Can Do Right Now

### Authentication and account flow

- user registration
- login
- logout
- access token refresh
- account deletion

### User profile

- view profile summary
- update profile data
- display skills
- display target role
- show simulation context

### Career simulation

- run a simulation for a desired role
- estimate growth potential
- estimate required learning time
- return recommended skills
- view latest simulation
- view simulation history
- open a specific simulation by ID

### Roadmap generation

- generate a study plan from a simulation
- load the current roadmap
- split the roadmap into phases
- attach tasks, topics, and resources to each phase

### Task system

- fetch current task list
- identify the active task
- verify task completion via AI flow
- delete tasks
- track progress statistics

### Dashboard

- aggregate progress indicators
- show latest task / plan / simulation state
- show due-soon tasks
- show completed task progress

### AI and recommendation layer

- request AI advice
- search learning resources for a target job

---

## Product Flow

Typical user journey:

1. Create an account or sign in
2. Fill in profile and target role context
3. Run a career simulation
4. Review salary growth, skill gaps, and time estimate
5. Generate a roadmap
6. Work through tasks phase by phase
7. Submit task results for verification
8. Track progress from the dashboard
9. Re-run simulations as goals evolve

---

## Tech Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Motion
- Lucide Icons

### Backend

- FastAPI
- SQLAlchemy (async)
- PostgreSQL
- Redis
- Alembic
- httpx
- BeautifulSoup

### AI / logic layer

- OpenAI SDK
- custom simulation / roadmap generation flow
- task verification support

---

## Project Structure

```text
DreamWork/
├─ backend/              # FastAPI application
├─ frontend/             # Next.js application
├─ alembic/              # database migrations
├─ docker-compose.yml    # full stack container orchestration
└─ README.md
```

---

## Environment Variables

The project uses environment variables for backend configuration.
At minimum, check these values before running locally:

### Backend

- `DATABASE_URL`
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `REFRESH_TOKEN_EXPIRE_DAYS`
- `OPENAI_API_KEY` or `API_KEY`

### Frontend

- `NEXT_PUBLIC_API_BASE_URL`

Important:

- in frontend code, the variable currently used is `NEXT_PUBLIC_API_BASE_URL`
- in `docker-compose.yml`, the frontend service currently defines `NEXT_PUBLIC_API_URL`

For consistency, it is recommended to align them to one name, preferably:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## Local Run

## Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL
- Redis

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd DreamWork
```

## 2. Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install uv
uv sync
```

Create or update your backend `.env` with valid values:

```env
DATABASE_URL=postgresql+asyncpg://admin:pass@localhost:5432/dream_work
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
OPENAI_API_KEY=your_openai_key
```

## 3. Run migrations

From the project root:

```bash
alembic upgrade head
```

## 4. Start backend

From the project root:

```bash
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at:

```text
http://localhost:8000
```

## 5. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## 6. Start frontend

```bash
npm run dev
```

Frontend will be available at:

```text
http://localhost:3000
```

---

## Run with Docker

The repository already contains `docker-compose.yml` for the full stack.

## Start the application

From the project root:

```bash
docker compose up --build
```

Services:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8000`
- postgres: `localhost:5432`
- redis: `localhost:6379`

## Stop containers

```bash
docker compose down
```

## Notes for Docker usage

- backend depends on PostgreSQL and Redis
- frontend depends on backend
- if environment variables change, rebuild the containers
- if you need a clean start, use:

```bash
docker compose down -v
docker compose up --build
```

---

## Recommended Basic README Tasks Already Covered Here

This README intentionally includes the basic things a healthy project document should contain:

- product purpose
- clear feature overview
- social value of the application
- architecture summary
- local setup instructions
- Docker setup instructions
- environment variable guidance
- expected development flow
- current features
- features in progress
- testing direction

---

## API Areas

The backend currently exposes functional routes for:

- `/api/auth`
- `/api/users`
- `/api/simulation`
- `/api/plan`
- `/api/tasks`
- `/api/dashboard`
- `/api/ai`
- `/api/resources`

This gives the project a clear split between identity, profile, simulation, planning, tasks, dashboard, and recommendation services.

---

## Testing Status

At the moment, the project has development dependencies for `pytest`, but the testing layer is still at an early stage.

### What is already possible

- backend test setup can be built with `pytest`
- frontend type safety can be checked with:

```bash
cd frontend
npm run build
```

or

```bash
cd frontend
npm run typecheck
```

### Tests planned for the next stages

- unit tests for simulation helpers
- unit tests for task progress and deadline calculations
- API tests for auth, profile, simulation, roadmap, and task endpoints
- integration tests for database-backed flows
- frontend rendering and interaction tests
- end-to-end flows for:
  - registration
  - login
  - simulation
  - roadmap generation
  - task completion

### Suggested future test commands

Backend:

```bash
pytest
```

Frontend:

```bash
npm run typecheck
npm run build
```

---

## Features in Progress

The application is already useful, but several areas are still actively evolving.

### In progress / not yet fully polished

- stronger AI-generated guidance quality
- more stable resource search results
- richer labor market parsing
- notification flows
- better test coverage
- improved resilience when external job sources are unavailable
- more polished production-ready error handling
- deeper analytics for user growth over time

### Product opportunities for the next iterations

- role comparison mode
- weekly learning calendar
- mentorship suggestions
- streaks and motivation mechanics
- portfolio/project scoring
- recommendations based on local market trends
- admin insights dashboard

---

## Known Development Notes

- frontend currently expects `NEXT_PUBLIC_API_BASE_URL`
- Docker compose currently sets `NEXT_PUBLIC_API_URL`
- external market parsing may fail if the remote source is unavailable
- some AI behaviors currently rely on example responses / stubbed logic during development

These are normal for an actively evolving student/startup-style product and should be documented clearly rather than hidden.

---

## Who This README Is For

This document is written for:

- developers joining the project
- mentors or reviewers evaluating the architecture
- product stakeholders who want to understand the idea
- future contributors who need a quick but clear onboarding point

---

## Final Summary

DreamWork is not just a dashboard.
It is a socially useful career support system that helps users transform uncertainty into a practical action plan.

Its strongest idea is simple:

> give people a realistic path forward, not just abstract motivation.

If developed further, DreamWork can become a meaningful educational and social tool for career mobility, skill growth, and opportunity access.
