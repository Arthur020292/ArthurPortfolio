import {
  createEmailContent,
  DEFAULT_FROM_EMAIL,
  DEFAULT_TO_EMAIL,
  parseContactPayload,
} from '../../shared/contact.js';

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

  if (!resendApiKey) {
    return jsonResponse(
      { message: 'Email service is not configured yet.' },
      { status: 500 }
    );
  }

  let payload;

  try {
    payload = await context.request.json();
  } catch {
    return jsonResponse({ message: 'Invalid request body.' }, { status: 400 });
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

  const from = context.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  const to = context.env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL;
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
