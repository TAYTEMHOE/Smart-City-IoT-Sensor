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

1. **Broker & database** — `docker compose up -d` (see [MQTT broker](#mqtt-broker) below)
2. **Backend** — `cp backend/.env.example backend/.env` then `npm run dev:backend`
3. **Frontend** — `cp frontend/.env.example frontend/.env` then `npm run dev:frontend`
4. **Simulator** — `cp simulator/.env.example simulator/.env` then `npm run dev:simulator`

## MQTT broker

`docker compose up -d` starts a Mosquitto broker (`eclipse-mosquitto:2`) reachable at
**`mqtt://localhost:1883`**, using the config committed at
[`backend/docker/mosquitto/mosquitto.conf`](backend/docker/mosquitto/mosquitto.conf).

- **Auth: none.** `allow_anonymous true` — this is a local dev/test setup only, not a
  production configuration.
- Data and logs persist in the `mosquitto-data` / `mosquitto-log` named Docker volumes.
- `docker compose up -d` also starts MongoDB, reachable at `mongodb://localhost:27017`.

To verify the broker is up, subscribe and publish from two terminals:

```bash
docker compose exec mosquitto mosquitto_sub -h localhost -t "smartcity/sensors/+/reading"
docker compose exec mosquitto mosquitto_pub -h localhost -t "smartcity/sensors/temp-01/reading" -m '{"sensorId":"temp-01","value":21.5}'
```

## MQTT payload schema

> TODO: document the `smartcity/sensors/{sensorId}/reading` payload shape.

## Alert thresholds

> TODO: document per-sensor-type thresholds and rationale.

## Assumptions

> TODO.

## What I'd improve with more time

> TODO.
