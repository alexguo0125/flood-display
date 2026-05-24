# Flood Display — E-ink Maribyrnong Flood Communication Prototype

This is an ENGR90051 demo prototype. It is **not** an official flood prediction or emergency warning system.

The prototype demonstrates this pipeline:

```text
Current/historical flood data → simple rule layer → optional OpenRouter communication layer → e-ink resident action display
```

The design goal is last-mile understanding: translating flood-related data into short, calm, action-first messages for Maribyrnong residents.

## Main functions

- E-ink style resident display with READY, PREPARE, ACT NOW, LEAVE NOW and OFFLINE states.
- Current Official Mode using `data/current_official_mode.json` for the current no-warning demo case.
- Historical Scenario Mode using `data/historical_scenario_mode.json` for controlled demo states.
- System states: Normal, Low Battery, Connection Lost and Night Mode.
- AI Risk Analysis panel using:
  - River level at Maribyrnong gauge (m)
  - Rainfall last 24 h (mm)
  - Official warning active true/false
- Six-language selector: English, Chinese, Vietnamese, French, Japanese and Korean.
- Mobile/PWA layout: the main e-ink display fills the screen; demo controls open from the top-right hamburger menu.

## Safe AI/backend structure

The OpenRouter API key must **never** be placed in `app.js`, `index.html`, GitHub Pages, or any public frontend file.

Use this deployment structure:

```text
GitHub Pages frontend
  ↓ fetch
Vercel backend: POST /api/analyse-risk
  ↓ server-side only
OpenRouter API
  ↓
safe JSON response
  ↓
e-ink display action message
```

If OpenRouter fails, the backend and frontend both have rule-based fallback so the demo still works.

## Demo rule thresholds

The AI/rule demo uses Maribyrnong gauge values:

- `officialWarning = true` or `riverLevel >= 2.9` → LEAVE NOW
- `riverLevel >= 2.3` or `rainfall24h >= 60` → ACT NOW
- `riverLevel >= 1.7` or `rainfall24h >= 30` → PREPARE
- otherwise → READY

These thresholds are for the prototype demo only and must be validated before any real-world use.

## Run locally

```bash
npm install
npm start
```

Open:

```text
http://localhost:8080
```

Local endpoints:

```text
POST /api/analyse-risk
GET  /api/flood-status
GET  /api/sources
```

Without an OpenRouter key, the AI endpoint automatically returns rule-based fallback results.

## Local OpenRouter setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then add your real key locally:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
ALLOWED_ORIGIN=http://localhost:8080
APP_PUBLIC_URL=http://localhost:8080
PORT=8080
```

Do not commit `.env`.

## GitHub Pages + Vercel deployment

### Frontend: GitHub Pages

Host the static files:

```text
index.html
style.css
app.js
manifest.json
sw.js
icon.svg
assets/
data/
```

Before publishing, replace this placeholder in `app.js`:

```js
https://YOUR-VERCEL-BACKEND.vercel.app
```

with your real Vercel backend URL.

### Backend: Vercel

Deploy these backend files to Vercel:

```text
api/analyse-risk.js
lib/risk-analysis.js
package.json
vercel.json
```

Set Vercel Environment Variables:

```text
OPENROUTER_API_KEY=your real OpenRouter key
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
ALLOWED_ORIGIN=https://YOUR-GITHUB-USERNAME.github.io
APP_PUBLIC_URL=https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO-NAME/
```

Then redeploy.

## What to say in the demo

> This prototype does not predict floods. It tests how official or cleaned flood-related data can be translated into simple, trusted and actionable guidance for Maribyrnong households.

