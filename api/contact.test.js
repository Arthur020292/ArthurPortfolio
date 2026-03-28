import { vi } from 'vitest';

const sendContactEmail = vi.fn();

vi.mock('./_lib/contact.js', () => ({
  sendContactEmail,
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
    sendContactEmail.mockReset();
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
    sendContactEmail.mockResolvedValue({
      message: 'Thanks, your message has been sent.',
      status: 200,
    });

    const { default: handler } = await import('./contact.js');
    const res = createMockResponse();
    const body = JSON.stringify({
      email: 'arthur@example.com',
      message: 'Need help with a redesign.',
      name: 'Arthur',
      projectType: 'Redesign',
    });

    await handler({ body, method: 'POST' }, res);

    expect(sendContactEmail).toHaveBeenCalledWith({
      email: 'arthur@example.com',
      message: 'Need help with a redesign.',
      name: 'Arthur',
      projectType: 'Redesign',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.payload).toEqual({ message: 'Thanks, your message has been sent.' });
  });

  it('rejects invalid JSON request bodies', async () => {
    const { default: handler } = await import('./contact.js');
    const res = createMockResponse();

    await handler({ body: '{invalid json', method: 'POST' }, res);

    expect(sendContactEmail).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.payload).toEqual({ message: 'Invalid request body.' });
  });
});
