'use strict';

const { analyseRisk } = require('../lib/risk-analysis');

function setCors(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*'; // TODO: set to GitHub Pages URL in Vercel
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const result = await analyseRisk(body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: 'analyse-risk failed',
      message: error.message,
    });
  }
};
