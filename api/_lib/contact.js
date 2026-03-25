import { Resend } from 'resend';

const DEFAULT_TO_EMAIL = 'arthur.baduyen@gmail.com';
const DEFAULT_FROM_EMAIL = 'Arthur Portfolio <onboarding@resend.dev>';

function normalizeField(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function parseContactPayload(payload) {
  const company = normalizeField(payload?.company);
  const name = normalizeField(payload?.name);
  const email = normalizeField(payload?.email);
  const message = normalizeField(payload?.message);
  const projectType = normalizeField(payload?.projectType);

  if (company) {
    return {
      company,
      email: '',
      message: '',
      name: '',
      projectType: '',
      spam: true,
    };
  }

  if (!name) {
    throw new Error('Please add your name.');
  }

  if (!email) {
    throw new Error('Please add your email address.');
  }

  if (!isValidEmail(email)) {
    throw new Error('Please enter a valid email address.');
  }

  if (!message) {
    throw new Error('Please add a short message.');
  }

  if (name.length > 120) {
    throw new Error('Name is too long.');
  }

  if (email.length > 320) {
    throw new Error('Email is too long.');
  }

  if (message.length > 5000) {
    throw new Error('Message is too long.');
  }

  if (projectType.length > 120) {
    throw new Error('Project type is too long.');
  }

  return { email, message, name, projectType, spam: false };
}

function createEmailContent({ email, message, name, projectType }) {
  const escapedName = escapeHtml(name);
  const escapedEmail = escapeHtml(email);
  const escapedMessage = escapeHtml(message).replaceAll('\n', '<br />');
  const escapedProjectType = projectType ? escapeHtml(projectType) : '';

  return {
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h1 style="margin: 0 0 16px; font-size: 24px;">New portfolio inquiry</h1>
        <p style="margin: 0 0 8px;"><strong>Name:</strong> ${escapedName}</p>
        <p style="margin: 0 0 8px;"><strong>Email:</strong> ${escapedEmail}</p>
        ${
          escapedProjectType
            ? `<p style="margin: 0 0 8px;"><strong>Project type:</strong> ${escapedProjectType}</p>`
            : ''
        }
        <p style="margin: 20px 0 8px;"><strong>Message:</strong></p>
        <p style="margin: 0;">${escapedMessage}</p>
      </div>
    `,
    text: `New portfolio inquiry

Name: ${name}
Email: ${email}
${projectType ? `Project type: ${projectType}\n` : ''}

Message:
${message}`,
  };
}

export async function sendContactEmail(payload) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return {
      message: 'Email service is not configured yet.',
      ok: false,
      status: 500,
    };
  }

  let parsedPayload;

  try {
    parsedPayload = parseContactPayload(payload);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Invalid form submission.',
      ok: false,
      status: 400,
    };
  }

  if (parsedPayload.spam) {
    return {
      message: 'Thanks, your message has been sent.',
      ok: true,
      status: 200,
    };
  }

  const resend = new Resend(resendApiKey);
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL;
  const subject = `Portfolio inquiry from ${parsedPayload.name}`;
  const { html, text } = createEmailContent(parsedPayload);

  try {
    const { error } = await resend.emails.send({
      from,
      html,
      replyTo: parsedPayload.email,
      subject,
      text,
      to: [to],
    });

    if (error) {
      console.error('Resend email error:', error);

      if (
        error.statusCode === 403 &&
        typeof error.message === 'string' &&
        error.message.includes('verify a domain')
      ) {
        return {
          message:
            'Resend is still in test mode. It can only send to your Resend account email until you verify a domain and use a sender on that domain.',
          ok: false,
          status: 403,
        };
      }

      return {
        message: 'I could not send your message right now. Please try again or email me directly.',
        ok: false,
        status: 502,
      };
    }

    return {
      message: 'Thanks, your message has been sent.',
      ok: true,
      status: 200,
    };
  } catch (error) {
    console.error('Contact email request failed:', error);

    return {
      message: 'I could not send your message right now. Please try again or email me directly.',
      ok: false,
      status: 502,
    };
  }
}
