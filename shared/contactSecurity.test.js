import { vi } from 'vitest';
import {
  enforceContactRateLimit,
  getAllowedOrigins,
  isAllowedFetchMetadata,
  isAllowedRequestOrigin,
  verifyTurnstileToken,
} from './contactSecurity.js';

describe('contact security helpers', () => {
  it('normalizes configured origins', () => {
    expect(
      getAllowedOrigins(' https://example.com, not-a-url, https://sub.example.com/path ')
    ).toEqual(['https://example.com', 'https://sub.example.com']);
  });

  it('allows same-origin requests and falls back to the allowlist', () => {
    expect(
      isAllowedRequestOrigin({
        allowedOrigins: ['https://example.com'],
        origin: 'https://example.com',
        requestOrigin: 'https://portfolio.example.com',
      })
    ).toBe(true);

    expect(
      isAllowedRequestOrigin({
        allowedOrigins: ['https://example.com'],
        origin: 'https://malicious.example',
        requestOrigin: 'https://portfolio.example.com',
      })
    ).toBe(false);

    expect(
      isAllowedRequestOrigin({
        allowedOrigins: ['https://example.com'],
        origin: '',
        requestOrigin: 'https://portfolio.example.com',
      })
    ).toBe(false);
  });

  it('only allows same-origin fetch metadata when present', () => {
    expect(
      isAllowedFetchMetadata({
        secFetchMode: 'cors',
        secFetchSite: 'same-origin',
      })
    ).toBe(true);

    expect(
      isAllowedFetchMetadata({
        secFetchMode: 'navigate',
        secFetchSite: 'same-origin',
      })
    ).toBe(false);

    expect(
      isAllowedFetchMetadata({
        secFetchMode: 'cors',
        secFetchSite: 'cross-site',
      })
    ).toBe(false);

    expect(isAllowedFetchMetadata({})).toBe(true);
  });

  it('rate limits repeated requests for the same key', () => {
    const key = `contact-test-${Date.now()}`;
    const windowMs = 10_000;
    const first = enforceContactRateLimit({ key, maxRequests: 2, now: 1_000, windowMs });
    const second = enforceContactRateLimit({ key, maxRequests: 2, now: 2_000, windowMs });
    const third = enforceContactRateLimit({ key, maxRequests: 2, now: 3_000, windowMs });

    expect(first).toEqual({ ok: true });
    expect(second).toEqual({ ok: true });
    expect(third).toEqual({
      message: 'Too many contact attempts. Please wait a few minutes and try again.',
      ok: false,
      status: 429,
    });
  });

  it('treats a missing turnstile secret as disabled', async () => {
    await expect(
      verifyTurnstileToken({
        remoteIp: '127.0.0.1',
        secretKey: '',
        token: '',
      })
    ).resolves.toEqual({ ok: true });
  });

  it('rejects a turnstile token when verification fails', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: false }),
    });

    try {
      await expect(
        verifyTurnstileToken({
          remoteIp: '127.0.0.1',
          secretKey: 'secret',
          token: 'token',
        })
      ).resolves.toEqual({
        message: 'Security verification failed. Please try again.',
        ok: false,
        status: 403,
      });
    } finally {
      fetchMock.mockRestore();
    }
  });
});
