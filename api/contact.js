import { handleContactRequest } from '../shared/contactRequest.js';

function parseRequestBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === 'string') {
    return JSON.parse(body);
  }

  return body;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  let payload;

  try {
    payload = parseRequestBody(req.body);
  } catch {
    return res.status(400).json({ message: 'Invalid request body.' });
  }

  const response = await handleContactRequest({
    env: process.env,
    origin: req.headers.origin,
    payload,
    remoteIp: req.socket?.remoteAddress,
    requestOrigin: `http://${req.headers.host || 'localhost'}`,
    secFetchMode: req.headers['sec-fetch-mode'],
    secFetchSite: req.headers['sec-fetch-site'],
  });

  return res.status(response.status).json(await response.json());
}
