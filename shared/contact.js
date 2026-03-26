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

export function createEmailContent({ email, message, name, projectType }) {
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
