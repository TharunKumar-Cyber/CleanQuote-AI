import { createClient, type User } from '@supabase/supabase-js';
import type { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request { authUser?: Pick<User, 'id' | 'email'>; }
  }
}

const url = process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const authClient = url && publishableKey
  ? createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  : null;

/** Verifies the bearer token against Supabase Auth. Never trusts a decoded JWT or client-supplied user ID. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!authClient) {
    res.status(503).json({ code: 'AUTH_NOT_CONFIGURED', error: 'Authentication is not configured on the server.' });
    return;
  }
  const header = req.header('authorization');
  const match = header?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    res.status(401).json({ code: 'AUTH_REQUIRED', error: 'A valid bearer access token is required.' });
    return;
  }
  try {
    const { data, error } = await authClient.auth.getUser(match[1]);
    if (error || !data.user) {
      res.status(401).json({ code: 'INVALID_SESSION', error: 'Your session is invalid or expired. Please sign in again.' });
      return;
    }
    req.authUser = { id: data.user.id, email: data.user.email };
    next();
  } catch {
    res.status(503).json({ code: 'AUTH_PROVIDER_UNAVAILABLE', error: 'Could not verify your session right now.' });
  }
}
