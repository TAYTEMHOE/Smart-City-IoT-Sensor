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

## Sensor simulator

`npm run dev:simulator` publishes readings for 3 sensors, one per type, each on its own
timer:

| Sensor ID | Type | Unit |
|---|---|---|
| `temp-01` | `temperature` | `°C` |
| `humidity-01` | `humidity` | `%` |
| `air-01` | `air_quality` | `AQI` |

Each sensor mostly publishes values in a normal range, with a ~12% chance per tick of
publishing an out-of-threshold spike (see [Alert thresholds](#alert-thresholds) below),
so alerting has something to react to during a demo.

Configurable via `simulator/.env` (copy from `simulator/.env.example`):

- `MQTT_BROKER_URL` — defaults to `mqtt://localhost:1883`
- `PUBLISH_INTERVAL_MS` — defaults to `3000`

## MQTT payload schema

Topic: `smartcity/sensors/{sensorId}/reading`

```json
{
  "sensorId": "temp-01",
  "sensorType": "temperature",
  "value": 42.7,
  "unit": "°C",
  "timestamp": "2026-09-15T09:12:00.000Z"
}
```

## Alert thresholds

| Sensor type | Min | Max |
|---|---|---|
| `temperature` | -10 °C | 40 °C |
| `humidity` | 10 % | 90 % |
| `air_quality` | — | 150 AQI |

These are defined by the simulator's spike ranges for now; the backend's own threshold
config (F6) will be the source of truth once alerting is implemented.

## Assumptions

> TODO.

## What I'd improve with more time

> TODO.
