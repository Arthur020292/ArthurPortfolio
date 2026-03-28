import {
  createEmailContent,
  getRequiredEmailConfig,
  parseContactPayload,
} from './contact.js';

describe('contact helpers', () => {
  it('requires both sender and recipient email settings', () => {
    expect(getRequiredEmailConfig({})).toEqual({
      message: 'Email service is not configured yet.',
      ok: false,
      status: 500,
    });

    expect(
      getRequiredEmailConfig({
        CONTACT_TO_EMAIL: 'hello@example.com',
        RESEND_FROM_EMAIL: 'portfolio@example.com',
      })
    ).toEqual({
      from: 'portfolio@example.com',
      ok: true,
      to: 'hello@example.com',
    });
  });

  it('normalizes and validates contact payloads', () => {
    expect(
      parseContactPayload({
        email: '  arthur@example.com ',
        message: '  Need help with a redesign. ',
        name: ' Arthur ',
        projectType: ' Redesign ',
      })
    ).toEqual({
      email: 'arthur@example.com',
      message: 'Need help with a redesign.',
      name: 'Arthur',
      projectType: 'Redesign',
      spam: false,
    });
  });

  it('treats the honeypot field as spam', () => {
    expect(
      parseContactPayload({
        company: 'Sneaky bot',
        email: 'bot@example.com',
        message: 'Hidden submission',
        name: 'Bot',
      })
    ).toEqual({
      company: 'Sneaky bot',
      email: '',
      message: '',
      name: '',
      projectType: '',
      spam: true,
    });
  });

  it('escapes HTML in outbound email content', () => {
    const { html, text } = createEmailContent({
      email: 'arthur@example.com',
      message: 'Line 1\n<script>alert("x")</script>',
      name: '<Arthur>',
      projectType: 'Redesign & Strategy',
    });

    expect(html).toContain('&lt;Arthur&gt;');
    expect(html).toContain('Redesign &amp; Strategy');
    expect(html).toContain('Line 1<br />&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(text).toContain('Project type: Redesign & Strategy');
  });
});
