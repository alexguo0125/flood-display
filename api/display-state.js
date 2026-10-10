'use strict';

const DISPLAY_STATE_KEY = 'display:state';

let memoryState = {
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

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (err) { reject(err); }
    });
    req.on('error', reject);
  });
}

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

async function redisGet() {
  const config = redisConfig();
  if (!config) return null;
  const response = await fetch(`${config.url}/get/${encodeURIComponent(DISPLAY_STATE_KEY)}`, {
    headers: { Authorization: `Bearer ${config.token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Redis GET HTTP ${response.status}`);
  const body = await response.json();
  return body.result ? JSON.parse(body.result) : null;
}

async function redisSet(state) {
  const config = redisConfig();
  if (!config) return;
  const value = encodeURIComponent(JSON.stringify(state));
  const response = await fetch(`${config.url}/set/${encodeURIComponent(DISPLAY_STATE_KEY)}/${value}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}` },
  });
  if (!response.ok) throw new Error(`Redis SET HTTP ${response.status}`);
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  try {
    if (req.method === 'GET') return send(res, 200, await redisGet() || memoryState);
    if (req.method === 'POST') {
      const body = await readBody(req);
      memoryState = {
        ...memoryState,
        ...body,
        updatedAt: body.updatedAt || new Date().toISOString(),
      };
      await redisSet(memoryState);
      return send(res, 200, { ok: true, state: memoryState });
    }
    return send(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    return send(res, 500, { error: err.message });
  }
};
