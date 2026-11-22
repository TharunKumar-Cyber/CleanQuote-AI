import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

const { createClientMock, getUserMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  getUserMock: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock,
}));

function createRequest(token?: string) {
  return {
    header: vi.fn().mockReturnValue(
      token ? `Bearer ${token}` : undefined,
    ),
  } as unknown as Request;
}

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
}

describe('requireAuth middleware', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'test-publishable-key');

    getUserMock.mockReset();
    createClientMock.mockReset();

    createClientMock.mockReturnValue({
      auth: { getUser: getUserMock },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects requests without a bearer token', async () => {
    const { requireAuth } = await import('./auth');
    const req = createRequest();
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(getUserMock).not.toHaveBeenCalled();
  });

  it('rejects invalid or expired sessions', async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' },
    });

    const { requireAuth } = await import('./auth');
    const req = createRequest('invalid-token');
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts a verified session and attaches the user', async () => {
    const verifiedUser = {
      id: '11111111-1111-4111-8111-111111111111',
      email: 'customer@example.com',
    };

    getUserMock.mockResolvedValue({
      data: { user: verifiedUser },
      error: null,
    });

    const { requireAuth } = await import('./auth');
    const req = createRequest('valid-test-token');
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    await requireAuth(req, res, next);

    expect(getUserMock).toHaveBeenCalledWith('valid-test-token');
    expect(req.authUser).toEqual(verifiedUser);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('handles Supabase provider failures', async () => {
    getUserMock.mockRejectedValue(new Error('Provider unavailable'));

    const { requireAuth } = await import('./auth');
    const req = createRequest('test-token');
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects requests when authentication is not configured', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '');
    vi.resetModules();

    const { requireAuth } = await import('./auth');
    const req = createRequest('test-token');
    const res = createResponse();
    const next = vi.fn() as NextFunction;

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(next).not.toHaveBeenCalled();
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
