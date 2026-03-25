import { sendContactEmail } from './_lib/contact.js';

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

  const result = await sendContactEmail(payload);
  return res.status(result.status).json({ message: result.message });
}
