import { describe, expect, it } from 'vitest';
import type { AppView } from '../types/quote';
import { requiresAuthenticatedUser, resolveAccessibleView } from './access';

describe('authenticated view access', () => {
  it.each<AppView>(['workspace', 'settings', 'plans'])(
    'redirects unauthenticated access to %s to sign-in',
    (view) => {
      expect(resolveAccessibleView(view, false)).toBe('auth');
      expect(requiresAuthenticatedUser(view)).toBe(true);
    },
  );

  it('allows authenticated users to open protected views', () => {
    expect(resolveAccessibleView('workspace', true)).toBe('workspace');
    expect(resolveAccessibleView('settings', true)).toBe('settings');
    expect(resolveAccessibleView('plans', true)).toBe('plans');
  });

  it('keeps the landing page and account screen public', () => {
    expect(resolveAccessibleView('landing', false)).toBe('landing');
    expect(resolveAccessibleView('auth', false)).toBe('auth');
    expect(requiresAuthenticatedUser('landing')).toBe(false);
    expect(requiresAuthenticatedUser('auth')).toBe(false);
  });
});
