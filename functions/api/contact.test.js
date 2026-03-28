import { vi } from 'vitest';

const createEmailContent = vi.fn();
const getRequiredEmailConfig = vi.fn();
const parseContactPayload = vi.fn();
const enforceContactRateLimit = vi.fn();
const getAllowedOrigins = vi.fn();
const isAllowedFetchMetadata = vi.fn();
const isAllowedRequestOrigin = vi.fn();
const verifyTurnstileToken = vi.fn();

vi.mock('../../shared/contact.js', () => ({
  createEmailContent,
  getRequiredEmailConfig,
  parseContactPayload,
}));

vi.mock('../../shared/contactSecurity.js', () => ({
  enforceContactRateLimit,
  getAllowedOrigins,
  isAllowedFetchMetadata,
  isAllowedRequestOrigin,
  verifyTurnstileToken,
}));

describe('cloudflare contact function', () => {
  beforeEach(() => {
    createEmailContent.mockReset();
    getRequiredEmailConfig.mockReset();
    parseContactPayload.mockReset();
    enforceContactRateLimit.mockReset();
    getAllowedOrigins.mockReset();
    isAllowedFetchMetadata.mockReset();
    isAllowedRequestOrigin.mockReset();
    verifyTurnstileToken.mockReset();
  });

  it('rejects disallowed origins before processing the request', async () => {
    getAllowedOrigins.mockReturnValue(['https://arthurbaduyen.dev']);
    isAllowedRequestOrigin.mockReturnValue(false);
    isAllowedFetchMetadata.mockReturnValue(true);

    const { onRequestPost } = await import('./contact.js');
    const response = await onRequestPost({
      env: {
        CONTACT_ALLOWED_ORIGINS: 'https://arthurbaduyen.dev',
        RESEND_API_KEY: 'resend-key',
        RESEND_FROM_EMAIL: 'portfolio@example.com',
        CONTACT_TO_EMAIL: 'hello@example.com',
      },
      request: {
        headers: new Headers({ Origin: 'https://evil.example' }),
        json: vi.fn(),
        url: 'https://arthurbaduyen.dev/api/contact',
      },
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ message: 'Origin not allowed.' });
  });

  it('sends the contact email when the request is valid', async () => {
    getAllowedOrigins.mockReturnValue(['https://arthurbaduyen.dev']);
    isAllowedRequestOrigin.mockReturnValue(true);
    isAllowedFetchMetadata.mockReturnValue(true);
    getRequiredEmailConfig.mockReturnValue({
      from: 'portfolio@example.com',
      ok: true,
      to: 'hello@example.com',
    });
    enforceContactRateLimit.mockReturnValue({ ok: true });
    verifyTurnstileToken.mockResolvedValue({ ok: true });
    parseContactPayload.mockReturnValue({
      email: 'arthur@example.com',
      message: 'Need help with a redesign.',
      name: 'Arthur',
      projectType: 'Redesign',
      spam: false,
    });
    createEmailContent.mockReturnValue({
      html: '<p>hello</p>',
      text: 'hello',
    });

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({}),
      ok: true,
      status: 200,
    });

    try {
      const { onRequestPost, onRequestOptions } = await import('./contact.js');
      const response = await onRequestPost({
        env: {
          CONTACT_ALLOWED_ORIGINS: 'https://arthurbaduyen.dev',
          CONTACT_RATE_LIMIT_MAX: '5',
          CONTACT_RATE_LIMIT_WINDOW_MS: '600000',
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

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ message: 'Thanks, your message has been sent.' });
      expect(createEmailContent).toHaveBeenCalledWith({
        email: 'arthur@example.com',
        message: 'Need help with a redesign.',
        name: 'Arthur',
        projectType: 'Redesign',
        spam: false,
      });
      expect(isAllowedFetchMetadata).toHaveBeenCalledWith({
        secFetchMode: 'cors',
        secFetchSite: 'same-origin',
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const optionsResponse = onRequestOptions();
      expect(optionsResponse.status).toBe(204);
      expect(optionsResponse.headers.get('Allow')).toBe('POST, OPTIONS');
    } finally {
      fetchMock.mockRestore();
    }
  });

  it('rejects cross-site fetch metadata before processing the request', async () => {
    getAllowedOrigins.mockReturnValue(['https://arthurbaduyen.dev']);
    isAllowedRequestOrigin.mockReturnValue(true);
    isAllowedFetchMetadata.mockReturnValue(false);

    const { onRequestPost } = await import('./contact.js');
    const response = await onRequestPost({
      env: {
        CONTACT_ALLOWED_ORIGINS: 'https://arthurbaduyen.dev',
        RESEND_API_KEY: 'resend-key',
        RESEND_FROM_EMAIL: 'portfolio@example.com',
        CONTACT_TO_EMAIL: 'hello@example.com',
      },
      request: {
        headers: new Headers({
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
          Origin: 'https://arthurbaduyen.dev',
        }),
        json: vi.fn(),
        url: 'https://arthurbaduyen.dev/api/contact',
      },
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ message: 'Origin not allowed.' });
  });
});
