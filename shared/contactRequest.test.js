import { vi } from 'vitest';

const sendContactEmail = vi.fn();

vi.mock('../api/_lib/contact.js', () => ({
  sendContactEmail,
}));

describe('contact request handler', () => {
  beforeEach(() => {
    sendContactEmail.mockReset();
  });

  it('rejects disallowed origins before attempting to send email', async () => {
    const { handleContactRequest } = await import('./contactRequest.js');

    const response = await handleContactRequest({
      env: {
        CONTACT_ALLOWED_ORIGINS: 'https://arthurbaduyen.dev',
        CONTACT_TO_EMAIL: 'hello@example.com',
        RESEND_API_KEY: 'resend-key',
        RESEND_FROM_EMAIL: 'portfolio@example.com',
      },
      origin: 'https://evil.example',
      payload: {
        email: 'arthur@example.com',
        message: 'Need help with a redesign.',
        name: 'Arthur',
        turnstileToken: 'token',
      },
      requestOrigin: 'https://arthurbaduyen.dev',
      secFetchMode: 'cors',
      secFetchSite: 'same-origin',
    });

    expect(sendContactEmail).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ message: 'Origin not allowed.' });
  });

  it('sends the email when the request passes origin, fetch metadata, and verification checks', async () => {
    sendContactEmail.mockResolvedValue({
      message: 'Thanks, your message has been sent.',
      ok: true,
      status: 200,
    });

    const { handleContactRequest } = await import('./contactRequest.js');
    const response = await handleContactRequest({
      env: {
        CONTACT_ALLOWED_ORIGINS: 'https://arthurbaduyen.dev',
        CONTACT_RATE_LIMIT_KV: {
          get: vi.fn().mockResolvedValue(null),
          put: vi.fn().mockResolvedValue(undefined),
        },
        CONTACT_TO_EMAIL: 'hello@example.com',
        CONTACT_RATE_LIMIT_MAX: '5',
        CONTACT_RATE_LIMIT_WINDOW_MS: '600000',
        RESEND_API_KEY: 'resend-key',
        RESEND_FROM_EMAIL: 'portfolio@example.com',
      },
      origin: 'https://arthurbaduyen.dev',
      payload: {
        email: 'arthur@example.com',
        message: 'Need help with a redesign.',
        name: 'Arthur',
        turnstileToken: 'token',
      },
      rateLimitStore: {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined),
      },
      remoteIp: '127.0.0.1',
      requestOrigin: 'https://arthurbaduyen.dev',
      secFetchMode: 'cors',
      secFetchSite: 'same-origin',
    });

    expect(sendContactEmail).toHaveBeenCalledWith(
      {
        email: 'arthur@example.com',
        message: 'Need help with a redesign.',
        name: 'Arthur',
        turnstileToken: 'token',
      },
      expect.objectContaining({
        CONTACT_ALLOWED_ORIGINS: 'https://arthurbaduyen.dev',
        CONTACT_TO_EMAIL: 'hello@example.com',
        RESEND_API_KEY: 'resend-key',
        RESEND_FROM_EMAIL: 'portfolio@example.com',
      })
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: 'Thanks, your message has been sent.' });
  });

  it('blocks cross-site fetch metadata before rate limiting or sending email', async () => {
    const rateLimitStore = {
      get: vi.fn(),
      put: vi.fn(),
    };

    const { handleContactRequest } = await import('./contactRequest.js');
    const response = await handleContactRequest({
      env: {
        CONTACT_ALLOWED_ORIGINS: 'https://arthurbaduyen.dev',
        CONTACT_RATE_LIMIT_MAX: '5',
        CONTACT_RATE_LIMIT_WINDOW_MS: '600000',
        CONTACT_RATE_LIMIT_KV: rateLimitStore,
        CONTACT_TO_EMAIL: 'hello@example.com',
        RESEND_API_KEY: 'resend-key',
        RESEND_FROM_EMAIL: 'portfolio@example.com',
      },
      origin: 'https://arthurbaduyen.dev',
      payload: {
        email: 'arthur@example.com',
        message: 'Need help with a redesign.',
        name: 'Arthur',
        turnstileToken: 'token',
      },
      rateLimitStore,
      remoteIp: '127.0.0.1',
      requestOrigin: 'https://arthurbaduyen.dev',
      secFetchMode: 'cors',
      secFetchSite: 'cross-site',
    });

    expect(rateLimitStore.get).not.toHaveBeenCalled();
    expect(rateLimitStore.put).not.toHaveBeenCalled();
    expect(sendContactEmail).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ message: 'Origin not allowed.' });
  });
});
