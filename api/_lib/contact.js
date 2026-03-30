import { Resend } from 'resend';
import {
  createEmailContent,
  getRequiredEmailConfig,
  parseContactPayload,
} from '../../shared/contact.js';

export async function sendContactEmail(payload, config = process.env) {
  const resendApiKey = config.RESEND_API_KEY;

  if (!resendApiKey) {
    return {
      message: 'Email service is not configured yet.',
      ok: false,
      status: 500,
    };
  }

  const emailConfig = getRequiredEmailConfig(config);

  if (!emailConfig.ok) {
    return emailConfig;
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
  const { from, to } = emailConfig;
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
