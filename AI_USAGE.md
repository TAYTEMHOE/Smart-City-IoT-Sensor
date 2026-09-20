# AI Usage

Disclosure of where and how AI tools were used on this project. One entry per project area; each explains *why* that approach was chosen, not just "AI generated this."

I used Claude Code (Anthropic) at different points and to different degrees across the project — as a design/architecture collaborator up front, as a bug-finder/reviewer for the backend I wrote myself, and as the implementer for the frontend based on my mockups and direction. The breakdown below is honest about which is which.

## Architecture doc & environment setup

I wrote the requirements and user stories for this project. I used Claude Code to turn
those into the initial architecture/design document — tech stack choices, module/DI
structure, data models, API contracts, and the F1–F14 feature list — before writing any
code. I then had it scaffold the project environment from that doc: the npm-workspaces
monorepo layout, the NestJS backend and React/Vite frontend folder structures,
`package.json`/`tsconfig` wiring, and the Docker Compose setup for Mosquitto and MongoDB.
This gave me a correctly-wired skeleton to build the actual features into, instead of
hand-assembling boilerplate for each package myself.

## Backend (F1–F7)

I wrote the backend feature code, the Mosquitto broker config (F1), the
sensor simulator (F2), MQTT ingestion (F3), readings persistence (F4), the `GET /readings`
endpoint (F5), threshold-based alerting (F6), and the `GET /alerts` endpoint (F7). Claude
Code's role here was as an assistant, not an author: finding and fixing bugs I ran into,
checking my implementation against the design doc, and suggesting small improvements (e.g.
tightening a Zod schema, cleaning up a piece of DI wiring) rather than writing the feature
logic itself.

## Frontend (F8–F9)

For the frontend, I gave Claude Code a mockup design and a description of the UI/UX I
wanted, along with the relevant user stories (F8 readings view, F9 alerts panel, plus the
later KPI/trends-chart additions). It built the implementation from that the polling
hooks, the readings table, the alerts panel, the filter bar, the KPI cards, and the trends
chart and I reviewed each pass against the mockup, either adjusting it directly or
sending it back with specific feedback for another round (card sizing, removing list
bullets, fixing the alerts panel's height/scroll behavior, syncing the trends chart to the
active filter, and so on). That review → feedback → revise loop is how most of the frontend
reached its current state, and it's also where several real bugs surfaced that only showed
up by actually running the app rather than reading the code — a missing CORS setting, a
missing global `box-sizing: border-box` reset, and a CSS Grid layout that stretched the
alerts panel to match the wrong sibling's height.
