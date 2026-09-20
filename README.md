# Smart City IoT Sensor Monitoring Dashboard

A small end-to-end IoT pipeline: a sensor simulator publishes readings over MQTT, a NestJS
backend ingests/validates/persists them and evaluates threshold alerts, and a React
dashboard polls the REST API to show live readings, trends, and alerts.

```
Simulator (Node/TS) --MQTT--> Mosquitto --MQTT--> NestJS backend --REST--> React dashboard
                                                        |
                                                     MongoDB
```

## Tech stack

| Layer | Technology |
|---|---|
| Backend framework | [NestJS](https://nestjs.com/) (TypeScript) |
| Database | MongoDB via [Mongoose](https://mongoosejs.com/) |
| Messaging | MQTT via [Eclipse Mosquitto](https://mosquitto.org/) (Docker) and the [`mqtt`](https://www.npmjs.com/package/mqtt) client |
| Validation | [Zod](https://zod.dev/) — MQTT payloads and REST query params |
| Frontend | [React](https://react.dev/) + [Vite](https://vite.dev/) + TypeScript |
| Styling | [UnoCSS](https://unocss.dev/) (`presetUno`, `presetAttributify`, `presetIcons` + Lucide icons) |
| Charting | [Recharts](https://recharts.org/) |
| Simulator | Standalone Node.js/TypeScript package, run via [`tsx`](https://github.com/privatenumber/tsx) |
| Containerization | Docker Compose (broker + MongoDB) |
| Monorepo tooling | npm workspaces |
| Linting | [oxlint](https://oxc.rs/docs/guide/usage/linter.html) (backend and frontend) |

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

## Running everything locally

From a clean clone:

```bash
npm install   # installs all three workspaces (backend, frontend, simulator)
```

Then, in order:

1. **Broker & database**

   ```bash
   docker compose up -d
   ```

   Starts Mosquitto (`mqtt://localhost:1883`, no auth — see [MQTT broker](#mqtt-broker)) and
   MongoDB (`mongodb://localhost:27017`).

2. **Backend**

   ```bash
   cp backend/.env.example backend/.env
   npm run dev:backend
   ```

   Starts the NestJS API on `http://localhost:3000`. It subscribes to MQTT on startup, so it
   needs the broker (step 1) already running.

3. **Frontend**

   ```bash
   cp frontend/.env.example frontend/.env
   npm run dev:frontend
   ```

   Starts the Vite dev server on `http://localhost:5173`, pointed at the backend via
   `VITE_API_BASE_URL`.

4. **Simulator**

   ```bash
   cp simulator/.env.example simulator/.env
   npm run dev:simulator
   ```

   Starts publishing simulated readings every few seconds. Without this running, the
   dashboard has nothing to display — the pipeline needs all four pieces (broker, backend,
   frontend, simulator) up to see data end to end.

To tear down the broker/database:

```bash
docker compose down
```

## MQTT broker

`docker compose up -d` starts a Mosquitto broker (`eclipse-mosquitto:latest`) reachable at
**`mqtt://localhost:1883`**, using the config committed at
[`backend/docker/mosquitto/mosquitto.conf`](backend/docker/mosquitto/mosquitto.conf).

- **Auth: none.** `allow_anonymous true` — this is a local dev/test setup only, not a
  production configuration.
- Data and logs persist in the `mosquitto-data` / `mosquitto-log` named Docker volumes.

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
publishing an out-of-threshold spike (see [Alert thresholds](#alert-thresholds)), so
alerting has something to react to during a demo.

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

Validated on ingestion with a Zod schema
([`mqtt-reading-payload.schema.ts`](backend/src/readings/dto/mqtt-reading-payload.schema.ts)).
Malformed payloads (fails JSON parse or fails the schema) are logged and dropped, not
persisted — a bad reading shouldn't crash the ingestion pipeline.

## REST API

### `GET /readings`

Query params (all optional, validated with Zod — invalid values return `400` with a
per-field error message):

| Param | Type | Notes |
|---|---|---|
| `sensorId` | string | exact match |
| `sensorType` | `temperature` \| `humidity` \| `air_quality` | |
| `from` / `to` | ISO datetime | filters on `timestamp` |
| `onlyAlerts` | `"true"` \| `"false"` | only `"true"` narrows results |
| `limit` | number | default `100`, max `500` |
| `page` | number | default `1` |

Response:

```json
{
  "data": [ /* Reading documents, newest first */ ],
  "meta": { "total": 0, "page": 1, "limit": 100 }
}
```

```bash
curl "http://localhost:3000/readings?sensorType=temperature&limit=10"
```

### `GET /alerts`

Query params (all optional, same Zod-validated 400-on-invalid behavior):

| Param | Type | Notes |
|---|---|---|
| `sensorId` | string | exact match |
| `from` / `to` | ISO datetime | filters on `triggeredAt` |
| `acknowledged` | `"true"` \| `"false"` | exact filter; omit to see both |

Response:

```json
{
  "data": [ /* Alert documents, newest first */ ]
}
```

```bash
curl "http://localhost:3000/alerts?sensorId=temp-01"
```

## Alert thresholds

| Sensor type | Min | Max |
|---|---|---|
| `temperature` | -10 °C | 40 °C |
| `humidity` | 10 % | 90 % |
| `air_quality` | — | 150 AQI |

Source of truth: [`backend/src/alerts/config/thresholds.config.ts`](backend/src/alerts/config/thresholds.config.ts).
A reading strictly outside its bounds (`value > max` or `value < min`; exact boundary
values do **not** count) gets an `Alert` document and `isAlert: true` on the `Reading`.
The simulator's spike ranges (above) are set to land outside these same bounds so
alerting has something to react to during a demo.

## Features implemented

| # | Feature | Summary |
|---|---|---|
| F1 | MQTT Broker Setup | Mosquitto via Docker Compose, config committed, no auth (local dev) |
| F2 | Sensor Simulator | 3 sensors across 3 types, configurable interval, occasional threshold-breaching spikes |
| F3 | MQTT Ingestion | Subscribes to `smartcity/sensors/+/reading` on startup, Zod-validates every message, drops malformed payloads, auto-reconnects on broker drop |
| F4 | Readings Persistence | Each valid reading → exactly one `Reading` document with both `timestamp` (payload) and `receivedAt` (server); persistence failures logged, not swallowed |
| F5 | `GET /readings` | Filter by `sensorId`/`sensorType`/`from`/`to`/`onlyAlerts`, paginated, Zod-validated, `400` on invalid params |
| F6 | Threshold-Based Alerting | Per-sensor-type thresholds in one config file; a breach persists an `Alert` and flags the `Reading` |
| F7 | `GET /alerts` | Filter by `sensorId`/time range/`acknowledged`, returns everything the UI needs with no extra lookups |
| F8 | Dashboard: Readings View | Live-updating table with filter controls, alert rows visually flagged |
| F9 | Dashboard: Alerts Panel | Distinct, sortable feed of recent alerts, updates alongside the readings table |

*(F10 Polling Refresh, F11 real-time bonus, F12 README, and F13 AI_USAGE.md are covered
elsewhere rather than listed here as features.)*

## Assumptions

- **No authentication.** This is a local dev/take-home setup, not a production deployment —
  the broker, the REST API, and the dashboard are all open on localhost.
- **Fixed, single-tenant sensor set.** The simulator hardcodes 3 sensors (`temp-01`,
  `humidity-01`, `air-01`); there's no UI or API for registering new sensors dynamically.
- **Alert thresholds are static config**, not user-editable — changing them means editing
  [`thresholds.config.ts`](backend/src/alerts/config/thresholds.config.ts) and restarting
  the backend.
- **Timestamps are UTC ISO strings** everywhere in storage and over the wire (MQTT payload,
  REST responses); the frontend converts to the viewer's local time only at render time
  ([`formatDate`](frontend/src/utils/formatDate.ts)).
- **The readings table always shows the latest 100 records** (server-sorted by `timestamp`
  desc) for whatever filter is active — there's no "next page" control in the UI, even
  though the backend supports `page`/`limit` for exactly that.

## What I'd improve with more time

- **Automated tests.** There's no Jest/Vitest suite for the backend services (ingestion
  validation, alert threshold evaluation, readings query filtering) or the frontend
  components/hooks — everything was verified manually against a live broker/DB/browser
  during development, which caught real bugs (see `AI_USAGE.md`) but doesn't guard against
  regressions.
- **Pagination UI.** The backend already supports `page`/`limit`; the frontend just never
  exposes a "load more" / page control, so anything past the latest 100 filtered records is
  invisible in the table.
- **`PATCH /alerts/:id/acknowledge`.** Listed as bonus scope in the design doc and never
  implemented — the `acknowledged` field exists on the `Alert` schema and is filterable via
  `GET /alerts`, but nothing ever sets it to `true`.
- **Real-time push (F11 bonus).** The dashboard polls every 5s; an MQTT-over-WebSocket or
  SSE channel would cut that latency and the constant re-fetching.
- **KPI accuracy at scale.** "Active Sensors" is derived from the currently-loaded page of
  readings (up to 100), not a true full-dataset aggregation — fine at this data volume, but
  would undercount if there were more distinct sensors than fit on one page. "System
  Health" already does a full-dataset count via a separate lightweight query, so it doesn't
  have this issue.
- **Pinned Docker image tags.** `docker-compose.yml` uses `eclipse-mosquitto:latest` and
  `mongo:latest` — fine for a local demo, but I'd pin specific versions before anything
  resembling production.
