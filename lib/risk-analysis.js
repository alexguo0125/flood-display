'use strict';

// Shared backend logic for Express local server and Vercel serverless API.
// AI supports communication only: cleaned flood data -> plain-language action.
// Official/rule-based thresholds are the safety layer for this prototype.

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const ALLOWED_RISK = ['READY', 'PREPARE', 'ACT_NOW', 'LEAVE_NOW'];
const ALLOWED_MODE = ['ready', 'prepare', 'act_now', 'leave_now'];

function normaliseInput(input = {}) {
  return {
    sourceMode: String(input.sourceMode || 'demo'),
    riverLevel: Number(input.riverLevel) || 0,
    rainfall24h: Number(input.rainfall24h) || 0,
    officialWarning: Boolean(input.officialWarning),
    location: String(input.location || 'Maribyrnong'),
    gauge: String(input.gauge || 'Maribyrnong gauge'),
    language: String(input.language || 'en'),
  };
}

function fallbackCopy(displayMode) {
  switch (displayMode) {
    case 'leave_now':
      return {
        headline: 'Emergency flood conditions possible near Maribyrnong.',
        action: 'Leave now if authorities advise evacuation.',
        shortChecklist: ['Take medicine, ID and phone.', 'Move to higher ground.', 'Avoid floodwater.'],
      };
    case 'act_now':
      return {
        headline: 'River or rainfall conditions are concerning.',
        action: 'Act now and prepare to leave.',
        shortChecklist: ['Move car and pets higher.', 'Charge phone.', 'Monitor official warnings.'],
      };
    case 'prepare':
      return {
        headline: 'Rain and river levels may rise.',
        action: 'Prepare now. Conditions may change.',
        shortChecklist: ['Pack medicine, ID and charger.', 'Move valuables higher.', 'Check on neighbours.'],
      };
    default:
      return {
        headline: 'No active flood warning for Maribyrnong.',
        action: 'Stay ready and review your flood plan.',
        shortChecklist: ['Keep phone charged.', 'Know your safe route.', 'Check official updates.'],
      };
  }
}

function ruleBasedResult(rawInput, reason = 'Rule-based fallback used.') {
  const data = normaliseInput(rawInput);
  let riskLevel = 'READY';
  let displayMode = 'ready';

  // Maribyrnong-gauge demo thresholds for the prototype.
  // officialWarning always overrides lower levels.
  if (data.officialWarning || data.riverLevel >= 2.9) {
    riskLevel = 'LEAVE_NOW';
    displayMode = 'leave_now';
  } else if (data.riverLevel >= 2.3 || data.rainfall24h >= 60) {
    riskLevel = 'ACT_NOW';
    displayMode = 'act_now';
  } else if (data.riverLevel >= 1.7 || data.rainfall24h >= 30) {
    riskLevel = 'PREPARE';
    displayMode = 'prepare';
  }

  return {
    riskLevel,
    displayMode,
    ...fallbackCopy(displayMode),
    confidenceNote: reason,
    source: 'fallback',
  };
}

function validateModelResult(result, rawInput) {
  const data = normaliseInput(rawInput);
  if (!result || typeof result !== 'object') throw new Error('Model response is not JSON object');

  let cleaned = { ...result };

  // Safety override: never let AI downgrade an active official warning.
  if (data.officialWarning) {
    cleaned = {
      ...ruleBasedResult(data, 'Official warning override applied.'),
      ...cleaned,
      riskLevel: 'LEAVE_NOW',
      displayMode: 'leave_now',
    };
  }

  if (!ALLOWED_RISK.includes(cleaned.riskLevel)) throw new Error(`Invalid riskLevel: ${cleaned.riskLevel}`);
  if (!ALLOWED_MODE.includes(cleaned.displayMode)) throw new Error(`Invalid displayMode: ${cleaned.displayMode}`);

  const backup = ruleBasedResult(data, 'Fallback copy used for missing AI field.');
  cleaned.headline = String(cleaned.headline || backup.headline).slice(0, 140);
  cleaned.action = String(cleaned.action || backup.action).slice(0, 140);
  cleaned.shortChecklist = Array.isArray(cleaned.shortChecklist)
    ? cleaned.shortChecklist.slice(0, 3).map(item => String(item).slice(0, 90))
    : backup.shortChecklist;
  cleaned.confidenceNote = String(cleaned.confidenceNote || 'Prototype result; verify with official sources.').slice(0, 180);
  cleaned.source = String(cleaned.source || 'openrouter');

  return cleaned;
}

async function callOpenRouter(rawInput) {
  const data = normaliseInput(rawInput);
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  const model = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free';
  const referer = process.env.APP_PUBLIC_URL || process.env.ALLOWED_ORIGIN || 'http://localhost:8080';

  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  const prompt = `You are a flood communication assistant for a Maribyrnong e-ink display prototype.

Role:
- Convert cleaned flood inputs and rule-based context into plain-language resident-facing guidance.
- Do NOT act as the official emergency decision maker.
- Do NOT invent official warnings.
- Return JSON only.

Input:
${JSON.stringify(data, null, 2)}

Rule thresholds used by prototype:
- officialWarning true OR riverLevel >= 2.9 -> LEAVE_NOW / leave_now
- riverLevel >= 2.3 OR rainfall24h >= 60 -> ACT_NOW / act_now
- riverLevel >= 1.7 OR rainfall24h >= 30 -> PREPARE / prepare
- otherwise -> READY / ready

Return exactly this JSON shape:
{
  "riskLevel": "READY" | "PREPARE" | "ACT_NOW" | "LEAVE_NOW",
  "displayMode": "ready" | "prepare" | "act_now" | "leave_now",
  "headline": "short plain-language sentence",
  "action": "one clear action sentence",
  "shortChecklist": ["action 1", "action 2", "action 3"],
  "confidenceNote": "short limitation note"
}`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': referer,
      'X-OpenRouter-Title': 'Flood Display Prototype',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 360,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter HTTP ${response.status}: ${body.slice(0, 220)}`);
  }

  const json = await response.json();
  const text = String(json.choices?.[0]?.message?.content || '').trim();
  const cleanedText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const parsed = JSON.parse(cleanedText);
  return { ...validateModelResult(parsed, data), source: 'openrouter' };
}

async function analyseRisk(rawInput) {
  const data = normaliseInput(rawInput);
  try {
    return await callOpenRouter(data);
  } catch (error) {
    return ruleBasedResult(data, `OpenRouter unavailable (${error.message}); rule-based fallback used.`);
  }
}

module.exports = {
  analyseRisk,
  callOpenRouter,
  ruleBasedResult,
  validateModelResult,
  normaliseInput,
  ALLOWED_RISK,
  ALLOWED_MODE,
};
