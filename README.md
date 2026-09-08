# ThreatCapital: GhostGrid

Autonomous Cyber Risk Quantification and Active Deception demo platform.

This repository contains a FastAPI backend (analysis & deception engine) and a React + Vite frontend (defender console and attacker shell). It is intended as a local demo for evaluating domain posture (SPF/DMARC, open ports, breach history) and exercising layered deception.

## Quickstart

Prerequisites
- Python 3.10+ and `venv` (backend)
- Node 18+ and `npm` (frontend)

1) Backend (FastAPI)

Windows PowerShell example:

```powershell
.
venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Interactive API docs: http://127.0.0.1:8000/docs

2) Frontend (React + Vite)

```powershell
cd frontend
npm install
npm run dev -- --host
```

Open the UI at the printed Vite URL (usually http://localhost:5173). For the attacker console, append `?mode=hacker` to the URL.

## Important runtime notes
- The backend provides a deterministic fallback scanner when DNS or external lookups fail. Live DNS checks require outbound DNS resolution.
- Layer‑2 deception sessions are keyed by a browser-local session id stored under `localStorage` key `ghost_session_id`. This makes attacker actions and defender telemetry reference the same session (survives page reload while the backend is running).

## API Endpoints (current)

1) Layer 1 — External risk scan
- Route: `GET /api/v1/scan?domain=<domain>`
- Response highlights (JSON): `score` (300–850), `rating`, `financial_exposure_inr` (numeric), `loss` (formatted), `spf`, `dmarc`, `open_ports`, `hibp_breaches`, `masquerade_score`, `penetration_score`.

Example:

```
GET /api/v1/scan?domain=example.com
```

2) Layer 2 — Decoy action / telemetry
- Route: `POST /api/v1/bubble/action`
- Body JSON fields: `session_id` (string), `command` (string). Backend returns telemetry for the session including `prevented_exposure_inr`, `actual_loss_inr`, `generated_filename`, and other deception metadata.

Example request body:

```json
{ "session_id": "ghost-sess-abc123", "command": "search payroll" }
```

Notes: the frontend uses `localStorage` key `ghost_session_id` to persist the session id; align any manual testing to use the same key so telemetry updates properly.

## Frontend features
- `RiskGauge` component: runs Layer 1 scans and displays Cyber FICO score plus two sub-scores — `masquerade_score` (SPF/DMARC) and `penetration_score` (ports/breaches).
- `AttackFeed` component: defender telemetry showing `prevented_exposure_inr` and `actual_loss_inr` for the active session.
- `Terminal` component (hacker mode): sends commands to `POST /api/v1/bubble/action` and displays returned outputs. Use `?mode=hacker` to see the attacker shell.

## Development notes
- If you change backend code, restart or rely on `uvicorn --reload` for quick iterations.
- If the frontend shows stale behavior after edits, stop and restart Vite dev server.

## Common troubleshooting
- If different domains produce identical scores, check that DNS resolution works from the environment where the backend runs. When DNS fails we fall back to deterministic heuristics, which may look similar across domains.
- If Layer‑2 telemetry doesn't update, ensure both `Terminal` and `AttackFeed` use the same `ghost_session_id` in `localStorage`.

## Layer 2: Verification & Testing
If you want to verify the deception engine and that the defender UI updates live, follow these short checks.

1) Start backend and frontend (see Quickstart above).

2) Open the attacker shell in a browser tab (append `?mode=hacker` to the UI URL). Note the `Session ID` shown in the header — this is the `ghost_session_id` used by the terminal.

3) Run a command in the attacker shell, for example:

```
search payroll
```

4) From any machine (or the defender tab), poll the sessions endpoint to see active sessions and activity timestamps:

```powershell
curl http://localhost:8000/api/v1/bubble/sessions
```

5) Poll the session telemetry directly (replace the session id):

```powershell
curl -X POST http://localhost:8000/api/v1/bubble/action -H "Content-Type: application/json" -d '{"session_id":"<session_id_here>","command":""}'
```

6) Expected behavior:
- The sessions list shows the attacker session with a recent `last_activity` timestamp.
- The `POST /api/v1/bubble/action` response includes `penetration_depth`, `prevented_exposure_inr`, `generated_filename`, and `output` (LLM content or fallback). 
- The defender UI (`AttackFeed`) should automatically follow the active session (or you can reload to pick up `ghost_session_id`) and display the generated LLM content, updated `Prevented` amount, and the penetration-level progress bar.

If the UI doesn't reflect the changes, confirm the browser running the defender UI has the same backend host/port and that there are no CORS/network issues.

## Project structure (high level)
- `backend/` — FastAPI app, Layer 1 scans and Layer 2 deception/session code.
- `frontend/` — React + Vite UI, components under `src/components`.

## Next actions you might want
- Remove hard-coded session examples in `README.md` (done in this update).
- Consider WebSocket or server-sent events for lower-latency Layer‑2 telemetry.

---
If you'd like, I can also add a short CONTRIBUTING section or a one-shot `dev.ps1` helper script to automate setup. Tell me which you prefer.