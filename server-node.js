'use strict';

// Flood Display — local Node/Express backend
// GitHub Pages should host the frontend, while Vercel should host api/analyse-risk.js.
// This local server is for testing the same backend logic on http://localhost:8080.

require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const { analyseRisk } = require('./lib/risk-analysis');

const app = express();
const PORT = process.env.PORT || 8080;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const DISPLAY_STATE_KEY = 'display:state';
let latestDisplayState = {
  lang: 'English',
  risk: 'MEDIUM',
  mode: 'normal',
  night: false,
  selectedDataMode: 'historical',
  displayState: 'PREPARE',
  alarmActive: false,
  alarmSeq: 0,
  updatedAt: new Date().toISOString(),
};

async function readDisplayState() {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!redisUrl || !redisToken) return latestDisplayState;

  const response = await fetch(`${redisUrl.replace(/\/$/, '')}/get/${encodeURIComponent(DISPLAY_STATE_KEY)}`, {
    headers: { Authorization: `Bearer ${redisToken}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Redis GET HTTP ${response.status}`);
  const body = await response.json();
  return body.result ? JSON.parse(body.result) : latestDisplayState;
}

async function writeDisplayState(nextState) {
  latestDisplayState = {
    ...latestDisplayState,
    ...nextState,
    updatedAt: nextState.updatedAt || new Date().toISOString(),
  };

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && redisToken) {
    const value = encodeURIComponent(JSON.stringify(latestDisplayState));
    const response = await fetch(`${redisUrl.replace(/\/$/, '')}/set/${encodeURIComponent(DISPLAY_STATE_KEY)}/${value}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${redisToken}` },
    });
    if (!response.ok) throw new Error(`Redis SET HTTP ${response.status}`);
  }
  return latestDisplayState;
}

app.use(express.json());

// CORS for testing GitHub Pages frontend against local/deployed backend.
app.use((req, res, next) => {
  const origin = req.headers.origin || ALLOWED_ORIGIN;
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN === '*' ? '*' : origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Serve static frontend files for local testing.
app.use(express.static(path.join(__dirname)));

app.post('/api/analyse-risk', async (req, res) => {
  const result = await analyseRisk(req.body || {});
  res.json(result);
});

app.get('/api/display-state', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    res.json(await readDisplayState());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/display-state', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, state: await writeDisplayState(req.body || {}) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Local convenience endpoint only. GitHub Pages frontend now reads the JSON file directly.
app.get('/api/flood-status', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'data', 'current_official_mode.json');
    res.json(JSON.parse(fs.readFileSync(filePath, 'utf8')));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sources', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'data', 'official_sources.json');
    res.json(JSON.parse(fs.readFileSync(filePath, 'utf8')));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\nFlood Display local server running at http://localhost:${PORT}`);
  console.log(`OpenRouter key loaded: ${process.env.OPENROUTER_API_KEY ? 'yes' : 'NO — fallback rules will be used'}`);
  console.log(`OpenRouter model: ${process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free'}`);
  console.log('Endpoints:');
  console.log('  POST /api/analyse-risk');
  console.log('  GET  /api/display-state');
  console.log('  POST /api/display-state');
  console.log('  GET  /api/flood-status');
  console.log('  GET  /api/sources\n');
});
