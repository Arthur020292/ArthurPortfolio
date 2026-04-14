function normalizeField(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function getRequiredEmailConfig(config) {
  const from = normalizeField(config?.RESEND_FROM_EMAIL);
  const to = normalizeField(config?.CONTACT_TO_EMAIL);

  if (!from || !to) {
    return {
      message: 'Email service is not configured yet.',
      ok: false,
      status: 500,
    };
  }

  return {
    from,
    ok: true,
    to,
  };
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

  if (company) {
    return {
      company,
      email: '',
      message: '',
      name: '',
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

  return { email, message, name, spam: false };
}

export function createEmailContent({ email, message, name }) {
  const escapedName = escapeHtml(name);
  const escapedEmail = escapeHtml(email);
  const escapedMessage = escapeHtml(message).replaceAll('\n', '<br />');

  return {
    html: `
      <div style="margin: 0; background: #f4f4f5; padding: 32px 16px; font-family: Arial, sans-serif; color: #101828;">
        <div style="margin: 0 auto; max-width: 680px; overflow: hidden; border: 1px solid #e4e7ec; border-radius: 24px; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 32px 32px 28px; color: #ffffff;">
            <p style="margin: 0 0 10px; color: #f2f4f7; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;">
              Arthur Baduyen Portfolio
            </p>
            <h1 style="margin: 0; font-size: 30px; line-height: 1.1; font-weight: 700;">
              New contact form inquiry
            </h1>
            <p style="margin: 14px 0 0; color: #d0d5dd; font-size: 15px; line-height: 1.6;">
              Someone filled out your portfolio contact form. Reply directly to continue the conversation.
            </p>
          </div>

          <div style="padding: 32px;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 0 0 12px; color: #667085; font-size: 13px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; width: 160px;">
                  Name
                </td>
                <td style="padding: 0 0 12px; color: #101828; font-size: 16px; font-weight: 500;">
                  ${escapedName}
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 12px; color: #667085; font-size: 13px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;">
                  Email
                </td>
                <td style="padding: 0 0 12px; color: #101828; font-size: 16px; font-weight: 500;">
                  <a href="mailto:${escapedEmail}" style="color: #1d4ed8; text-decoration: none;">${escapedEmail}</a>
                </td>
              </tr>
            </table>

            <div style="margin-top: 28px;">
              <p style="margin: 0 0 12px; color: #667085; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
                Message
              </p>
              <div style="border: 1px solid #e4e7ec; border-radius: 18px; background: #fcfcfd; padding: 22px; color: #101828; font-size: 16px; line-height: 1.75;">
                ${escapedMessage}
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    text: `Arthur Baduyen Portfolio

New contact form inquiry

Reply to: ${email}

Name: ${name}
Email: ${email}

Message:
${message}`,
  };
}
