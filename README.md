# Smart City IoT Sensor Monitoring Dashboard

MQTT sensor simulation → NestJS ingestion/API → React dashboard.

## Repository layout

```
smart-city-dashboard/
├── backend/     # NestJS app (MQTT ingestion, REST API, MongoDB persistence)
├── frontend/    # React + Vite + TS + UnoCSS dashboard
├── simulator/   # Standalone sensor simulator (Node/TS)
├── docker-compose.yml
├── README.md
└── AI_USAGE.md
```

## Prerequisites

- Node.js (see individual `package.json` engines)
- Docker (for the Mosquitto broker and MongoDB)

## Setup

> TODO: fill in once the broker, backend, frontend, and simulator are runnable end to end.

1. **Broker & database** — `docker compose up` (TODO: document ports / config)
2. **Backend** — `cp backend/.env.example backend/.env` then `npm run dev:backend`
3. **Frontend** — `cp frontend/.env.example frontend/.env` then `npm run dev:frontend`
4. **Simulator** — `cp simulator/.env.example simulator/.env` then `npm run dev:simulator`

## MQTT payload schema

> TODO: document the `smartcity/sensors/{sensorId}/reading` payload shape.

## Alert thresholds

> TODO: document per-sensor-type thresholds and rationale.

## Assumptions

> TODO.

## What I'd improve with more time

> TODO.
