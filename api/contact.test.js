import { vi } from 'vitest';

const handleContactRequest = vi.fn();

vi.mock('../shared/contactRequest.js', () => ({
  handleContactRequest,
}));

function createMockResponse() {
  return {
    json: vi.fn(function json(payload) {
      this.payload = payload;
      return this;
    }),
    payload: null,
    setHeader: vi.fn(),
    status: vi.fn(function status(code) {
      this.statusCode = code;
      return this;
    }),
    statusCode: null,
  };
}

describe('contact api handler', () => {
  beforeEach(() => {
    handleContactRequest.mockReset();
  });

  it('rejects non-POST requests', async () => {
    const { default: handler } = await import('./contact.js');
    const res = createMockResponse();

    await handler({ method: 'GET' }, res);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.payload).toEqual({ message: 'Method not allowed.' });
  });

  it('parses the request body and forwards it to sendContactEmail', async () => {
    handleContactRequest.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Thanks, your message has been sent.' }), {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      })
    );

    const { default: handler } = await import('./contact.js');
    const res = createMockResponse();
    const body = JSON.stringify({
      email: 'arthur@example.com',
      message: 'Need help with a redesign.',
      name: 'Arthur',
    });

    await handler({ body, headers: { host: 'arthurbaduyen.dev' }, method: 'POST' }, res);

    expect(handleContactRequest).toHaveBeenCalledWith({
      env: process.env,
      origin: undefined,
      payload: {
        email: 'arthur@example.com',
        message: 'Need help with a redesign.',
        name: 'Arthur',
      },
      remoteIp: undefined,
      requestOrigin: 'http://arthurbaduyen.dev',
      secFetchMode: undefined,
      secFetchSite: undefined,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.payload).toEqual({ message: 'Thanks, your message has been sent.' });
  });

  it('rejects invalid JSON request bodies', async () => {
    const { default: handler } = await import('./contact.js');
    const res = createMockResponse();

    await handler({ body: '{invalid json', method: 'POST' }, res);

    expect(handleContactRequest).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.payload).toEqual({ message: 'Invalid request body.' });
  });
});
