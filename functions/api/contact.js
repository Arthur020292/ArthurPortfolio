import { handleContactRequest } from '../../shared/contactRequest.js';

export async function onRequestPost(context) {
  let payload;

  try {
    payload = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ message: 'Invalid request body.' }), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 400,
    });
  }

  return handleContactRequest({
    env: context.env,
    origin: context.request.headers.get('Origin'),
    payload,
    rateLimitStore: context.env.CONTACT_RATE_LIMIT_KV,
    remoteIp: context.request.headers.get('CF-Connecting-IP'),
    requestOrigin: new URL(context.request.url).origin,
    secFetchMode: context.request.headers.get('Sec-Fetch-Mode'),
    secFetchSite: context.request.headers.get('Sec-Fetch-Site'),
  });
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      Allow: 'POST, OPTIONS',
    },
    status: 204,
  });
}
