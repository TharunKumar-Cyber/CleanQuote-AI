import type { AppView } from '../types/quote';

const AUTHENTICATED_VIEWS: ReadonlySet<AppView> = new Set([
  'workspace',
  'settings',
  'plans',
]);

export function requiresAuthenticatedUser(view: AppView): boolean {
  return AUTHENTICATED_VIEWS.has(view);
}

export function resolveAccessibleView(view: AppView, isAuthenticated: boolean): AppView {
  return requiresAuthenticatedUser(view) && !isAuthenticated ? 'auth' : view;
}
