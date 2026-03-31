import { vi } from 'vitest';

const handleContactRequest = vi.fn();

vi.mock('../../shared/contactRequest.js', () => ({
  handleContactRequest,
}));

describe('cloudflare contact function', () => {
  beforeEach(() => {
    handleContactRequest.mockReset();
  });

  it('rejects invalid JSON request bodies', async () => {
    const { onRequestPost } = await import('./contact.js');

    const response = await onRequestPost({
      env: {},
      request: {
        headers: new Headers(),
        json: vi.fn().mockRejectedValue(new Error('invalid json')),
        url: 'https://arthurbaduyen.dev/api/contact',
      },
    });

    expect(handleContactRequest).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: 'Invalid request body.' });
  });

  it('forwards parsed contact payloads to the shared request handler', async () => {
    const responseBody = { message: 'Thanks, your message has been sent.' };

    handleContactRequest.mockResolvedValue(
      new Response(JSON.stringify(responseBody), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      })
    );

    const { onRequestPost, onRequestOptions } = await import('./contact.js');
    const response = await onRequestPost({
      env: {
        CONTACT_ALLOWED_ORIGINS: 'https://arthurbaduyen.dev',
        CONTACT_RATE_LIMIT_MAX: '5',
        CONTACT_RATE_LIMIT_WINDOW_MS: '600000',
        CONTACT_RATE_LIMIT_KV: {
          get: vi.fn(),
          put: vi.fn(),
        },
        CONTACT_TO_EMAIL: 'hello@example.com',
        RESEND_API_KEY: 'resend-key',
        RESEND_FROM_EMAIL: 'portfolio@example.com',
        TURNSTILE_SECRET_KEY: 'turnstile-secret',
      },
      request: {
        headers: new Headers({
          'CF-Connecting-IP': '127.0.0.1',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          Origin: 'https://arthurbaduyen.dev',
        }),
        json: vi.fn().mockResolvedValue({
          email: 'arthur@example.com',
          message: 'Need help with a redesign.',
          name: 'Arthur',
          projectType: 'Redesign',
          turnstileToken: 'token',
        }),
        url: 'https://arthurbaduyen.dev/api/contact',
      },
    });

    expect(handleContactRequest).toHaveBeenCalledWith({
      env: {
        CONTACT_ALLOWED_ORIGINS: 'https://arthurbaduyen.dev',
        CONTACT_RATE_LIMIT_MAX: '5',
        CONTACT_RATE_LIMIT_WINDOW_MS: '600000',
        CONTACT_RATE_LIMIT_KV: {
          get: expect.any(Function),
          put: expect.any(Function),
        },
        CONTACT_TO_EMAIL: 'hello@example.com',
        RESEND_API_KEY: 'resend-key',
        RESEND_FROM_EMAIL: 'portfolio@example.com',
        TURNSTILE_SECRET_KEY: 'turnstile-secret',
      },
      origin: 'https://arthurbaduyen.dev',
      payload: {
        email: 'arthur@example.com',
        message: 'Need help with a redesign.',
        name: 'Arthur',
        projectType: 'Redesign',
        turnstileToken: 'token',
      },
      rateLimitStore: {
        get: expect.any(Function),
        put: expect.any(Function),
      },
      remoteIp: '127.0.0.1',
      requestOrigin: 'https://arthurbaduyen.dev',
      secFetchMode: 'cors',
      secFetchSite: 'same-origin',
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(responseBody);

    const optionsResponse = onRequestOptions();
    expect(optionsResponse.status).toBe(204);
    expect(optionsResponse.headers.get('Allow')).toBe('POST, OPTIONS');
  });

  it('returns a response when cross-site fetch metadata is blocked by the shared handler', async () => {
    handleContactRequest.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Origin not allowed.' }), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 403,
      })
    );

    const { onRequestPost } = await import('./contact.js');
    const response = await onRequestPost({
      env: {},
      request: {
        headers: new Headers({
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
          Origin: 'https://arthurbaduyen.dev',
        }),
        json: vi.fn().mockResolvedValue({
          email: 'arthur@example.com',
          message: 'Need help with a redesign.',
          name: 'Arthur',
        }),
        url: 'https://arthurbaduyen.dev/api/contact',
      },
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ message: 'Origin not allowed.' });
  });
});
