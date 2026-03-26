import {
  createEmailContent,
  getRequiredEmailConfig,
  parseContactPayload,
} from '../../shared/contact.js';
import {
  enforceContactRateLimit,
  getAllowedOrigins,
  isAllowedRequestOrigin,
  verifyTurnstileToken,
} from '../../shared/contactSecurity.js';

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });
}

export async function onRequestPost(context) {
  const resendApiKey = context.env.RESEND_API_KEY;
  const allowedOrigins = getAllowedOrigins(context.env.CONTACT_ALLOWED_ORIGINS);
  const requestOrigin = new URL(context.request.url).origin;
  const origin = context.request.headers.get('Origin');
  const remoteIp = context.request.headers.get('CF-Connecting-IP');

  if (!isAllowedRequestOrigin({ allowedOrigins, origin, requestOrigin })) {
    return jsonResponse({ message: 'Origin not allowed.' }, { status: 403 });
  }

  if (!resendApiKey) {
    return jsonResponse(
      { message: 'Email service is not configured yet.' },
      { status: 500 }
    );
  }

  const emailConfig = getRequiredEmailConfig(context.env);

  if (!emailConfig.ok) {
    return jsonResponse({ message: emailConfig.message }, { status: emailConfig.status });
  }

  const rateLimitResult = enforceContactRateLimit({
    key: remoteIp,
    maxRequests: Number(context.env.CONTACT_RATE_LIMIT_MAX || 5),
    windowMs: Number(context.env.CONTACT_RATE_LIMIT_WINDOW_MS || 600000),
  });

  if (!rateLimitResult.ok) {
    return jsonResponse(
      { message: rateLimitResult.message },
      { status: rateLimitResult.status }
    );
  }

  let payload;

  try {
    payload = await context.request.json();
  } catch {
    return jsonResponse({ message: 'Invalid request body.' }, { status: 400 });
  }

  const turnstileResult = await verifyTurnstileToken({
    remoteIp,
    secretKey: context.env.TURNSTILE_SECRET_KEY,
    token: payload?.turnstileToken,
  });

  if (!turnstileResult.ok) {
    return jsonResponse(
      { message: turnstileResult.message },
      { status: turnstileResult.status }
    );
  }

  let parsedPayload;

  try {
    parsedPayload = parseContactPayload(payload);
  } catch (error) {
    return jsonResponse(
      {
        message: error instanceof Error ? error.message : 'Invalid form submission.',
      },
      { status: 400 }
    );
  }

  if (parsedPayload.spam) {
    return jsonResponse({ message: 'Thanks, your message has been sent.' }, { status: 200 });
  }

  const { from, to } = emailConfig;
  const subject = `Portfolio inquiry from ${parsedPayload.name}`;
  const { html, text } = createEmailContent(parsedPayload);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      body: JSON.stringify({
        from,
        html,
        replyTo: parsedPayload.email,
        subject,
        text,
        to: [to],
      }),
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (response.ok) {
      return jsonResponse({ message: 'Thanks, your message has been sent.' }, { status: 200 });
    }

    let errorPayload = null;

    try {
      errorPayload = await response.json();
    } catch {
      errorPayload = null;
    }

    const errorMessage =
      typeof errorPayload?.message === 'string' ? errorPayload.message : '';

    console.error('Resend email error:', {
      message: errorMessage,
      status: response.status,
    });

    if (response.status === 403 && errorMessage.includes('verify a domain')) {
      return jsonResponse(
        {
          message:
            'Resend is still in test mode. It can only send to your Resend account email until you verify a domain and use a sender on that domain.',
        },
        { status: 403 }
      );
    }

    return jsonResponse(
      {
        message: 'I could not send your message right now. Please try again or email me directly.',
      },
      { status: 502 }
    );
  } catch (error) {
    console.error('Contact email request failed:', error);

    return jsonResponse(
      {
        message: 'I could not send your message right now. Please try again or email me directly.',
      },
      { status: 502 }
    );
  }
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      Allow: 'POST, OPTIONS',
    },
    status: 204,
  });
}
