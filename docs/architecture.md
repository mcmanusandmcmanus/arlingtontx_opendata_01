# Public Safety Intelligence Platform – Technical Blueprint

## 80/20 Product Focus
- **Primary outcome**: surface the 20 % of parcels/cases generating 80 % of enforcement workload so field teams can act first where risk is highest.
- **Key signals**: municipal court cases, code complaints, permit valuations/status, inspection SLAs.
- **Actionable outputs**:
  1. High-risk parcel leaderboard with owner/contact context.
  2. Case & complaint volume trendlines for surge detection.
  3. Development watchlist highlighting expensive or stalled permits.

## High-Level Architecture
```
┌────────────────┐     ingest scripts    ┌────────────────────────┐
│ Open Data APIs │ ────────────────►     │ backend/data/raw/*.csv │
└────────────────┘                      └────────────────────────┘
           │                                       │
           │  python pipelines (pandas-lite)       ▼
           └──────────────► backend/scripts/ingest_metrics.py
                                               │ writes
                                               ▼
                                  backend/data/aggregates/*.parquet|json
                                               │ served via ORM
                                               ▼
                         ┌──────────────────────────────────────────────┐
                         │ FastAPI service (backend/app)                │
                         │  • `/api/risk/parcels` (top 80/20 parcels)   │
                         │  • `/api/insights/summary` (KPI cards)       │
                         │  • `/api/permits/watchlist`                  │
                         │  • `/api/offenses/timeseries`                │
                         └──────────────────────────────────────────────┘
                                               │
                                               ▼
                    ┌────────────────────────────────────────────────────┐
                    │ Next.js 14 frontend (frontend/)                    │
                    │  • Server actions fetch API (ISR-enabled)          │
                    │  • Recharts + Tremor for visuals                   │
                    │  • MapLibre heat-map (optional enhancement)        │
                    └────────────────────────────────────────────────────┘
                                               │
                                               ▼
                GitHub Actions → unit tests → Render (FastAPI) + Vercel/Netlify
```

## Backend Overview
- **Framework**: FastAPI + SQLModel for concise models & Pydantic schemas.
- **Database**: SQLite for local dev; swap to Postgres on Render via `DATABASE_URL`.
- **Ingestion**: deterministic ETL script producing materialized risk aggregates:
  - calculates parcel-level risk score = weighted cases + complaints + valuation flags.
  - caches KPI snapshot JSON for rapid Dashboard load.
- **Testing**: Pytest suite covering ETL functions & API responses.
- **Observability**: health endpoint, structured logging (UVicorn).

## Frontend Overview
- **Framework**: Next.js 14 App Router, TypeScript, server components.
- **UI Stack**: Tailwind, Tremor UI for KPI cards, Recharts for charts, Ag-Grid Lite for tables.
- **Data Access**: incremental static regeneration hitting backend REST endpoints with caching headers.
- **UX Flow**:
  1. Landing hero summarizing current risk posture.
  2. KPI strip (total cases, open complaints, high-value permits, SLA breaches).
  3. Risk heat table with filters (address, owner, risk threshold).
  4. Trend visualizations (line, stacked bar).
  5. Watchlist module with drill-ins linking to backend detail route.

## DevOps & Deployment
- **Monorepo** with `frontend/`, `backend/`, shared `docs/`.
- **Tooling**:
  - Poetry-managed backend dependencies + Ruff lint + MyPy (strict).
  - Frontend uses ESLint + Prettier + Vitest (component tests).
- **CI**: GitHub Actions workflow runs lint, pytest, npm test, build checks.
- **CD (Render free tier)**:
  - `render.yaml` defines FastAPI service (`gunicorn -w 2 -k uvicorn.workers.UvicornWorker`).
  - Frontend deploy either to Vercel (recommended) or Render static site using `npm run build` + `next export`.

## Data Governance & Privacy
- Strip PII at ingestion; only retain parcel/tax-id + owner for city staff use.
- Document data lineage (source + timestamp) in `docs/data_sources.md`.
- Provide synthetic sample dataset for open-source repo; keep connectors configurable via `.env`.

## Roadmap Highlights
1. Integrate live city API connectors (Socrata, ArcGIS).
2. Add user auth & role-based parcel notes.
3. Deploy tile-based map with real complaint geocodes.
4. ML risk scoring (gradient boosted tree) with SHAP explanations.

