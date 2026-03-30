import { sendContactEmail } from '../api/_lib/contact.js';
import {
  getRequiredEmailConfig,
} from './contact.js';
import {
  enforceContactRateLimit,
  getAllowedOrigins,
  isAllowedFetchMetadata,
  isAllowedRequestOrigin,
  verifyTurnstileToken,
} from './contactSecurity.js';

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });
}

export async function handleContactRequest({
  env = {},
  origin,
  payload,
  rateLimitStore,
  remoteIp,
  requestOrigin,
  secFetchMode,
  secFetchSite,
}) {
  const allowedOrigins = getAllowedOrigins(env.CONTACT_ALLOWED_ORIGINS);

  if (
    !isAllowedRequestOrigin({ allowedOrigins, origin, requestOrigin }) ||
    !isAllowedFetchMetadata({ secFetchMode, secFetchSite })
  ) {
    return jsonResponse({ message: 'Origin not allowed.' }, { status: 403 });
  }

  if (!env.RESEND_API_KEY) {
    return jsonResponse(
      { message: 'Email service is not configured yet.' },
      { status: 500 }
    );
  }

  const emailConfig = getRequiredEmailConfig(env);

  if (!emailConfig.ok) {
    return jsonResponse({ message: emailConfig.message }, { status: emailConfig.status });
  }

  const rateLimitResult = await enforceContactRateLimit({
    key: remoteIp,
    maxRequests: Number(env.CONTACT_RATE_LIMIT_MAX || 5),
    store: rateLimitStore,
    windowMs: Number(env.CONTACT_RATE_LIMIT_WINDOW_MS || 600000),
  });

  if (!rateLimitResult.ok) {
    return jsonResponse(
      { message: rateLimitResult.message },
      { status: rateLimitResult.status }
    );
  }

  const turnstileResult = await verifyTurnstileToken({
    remoteIp,
    secretKey: env.TURNSTILE_SECRET_KEY,
    token: payload?.turnstileToken,
  });

  if (!turnstileResult.ok) {
    return jsonResponse(
      { message: turnstileResult.message },
      { status: turnstileResult.status }
    );
  }

  const result = await sendContactEmail(payload, env);

  return jsonResponse(
    { message: result.message },
    { status: result.status }
  );
}
