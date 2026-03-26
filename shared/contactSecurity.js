function normalizeOrigin(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function getAllowedOrigins(configuredOrigins) {
  if (typeof configuredOrigins !== 'string') {
    return [];
  }

  return configuredOrigins
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);
}

export function isAllowedRequestOrigin({
  allowedOrigins = [],
  origin,
  requestOrigin,
}) {
  const normalizedOrigin = normalizeOrigin(origin);

  if (!normalizedOrigin) {
    return true;
  }

  const normalizedRequestOrigin = normalizeOrigin(requestOrigin);

  if (normalizedRequestOrigin && normalizedOrigin === normalizedRequestOrigin) {
    return true;
  }

  return allowedOrigins.includes(normalizedOrigin);
}

const rateLimitStore = new Map();

export function enforceContactRateLimit({
  key,
  maxRequests = 5,
  now = Date.now(),
  windowMs = 10 * 60 * 1000,
}) {
  const normalizedKey =
    typeof key === 'string' && key.trim() ? key.trim() : 'unknown-contact-client';
  const existingEntry = rateLimitStore.get(normalizedKey);

  if (!existingEntry || now - existingEntry.windowStartedAt >= windowMs) {
    rateLimitStore.set(normalizedKey, {
      count: 1,
      windowStartedAt: now,
    });

    return { ok: true };
  }

  if (existingEntry.count >= maxRequests) {
    return {
      message: 'Too many contact attempts. Please wait a few minutes and try again.',
      ok: false,
      status: 429,
    };
  }

  existingEntry.count += 1;
  rateLimitStore.set(normalizedKey, existingEntry);

  return { ok: true };
}

export async function verifyTurnstileToken({
  remoteIp,
  secretKey,
  token,
}) {
  if (!secretKey) {
    return { ok: true };
  }

  if (typeof token !== 'string' || !token.trim()) {
    return {
      message: 'Please complete the security check.',
      ok: false,
      status: 400,
    };
  }

  const body = new URLSearchParams({
    response: token.trim(),
    secret: secretKey,
  });

  if (typeof remoteIp === 'string' && remoteIp.trim()) {
    body.set('remoteip', remoteIp.trim());
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      }
    );

    if (!response.ok) {
      return {
        message: 'I could not verify the security check. Please try again.',
        ok: false,
        status: 502,
      };
    }

    const result = await response.json();

    if (result?.success) {
      return { ok: true };
    }

    return {
      message: 'Security verification failed. Please try again.',
      ok: false,
      status: 403,
    };
  } catch {
    return {
      message: 'I could not verify the security check. Please try again.',
      ok: false,
      status: 502,
    };
  }
}
