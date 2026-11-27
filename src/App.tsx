/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { AppView, BusinessSettings, CreditState } from './types/quote';
import {
  loadBusinessSettings, loadCreditState, resetFreeDemoCredits,
  saveBusinessSettings, saveCreditState,
} from './utils/storage';
import { requiresAuthenticatedUser, resolveAccessibleView } from './utils/access';
import { supabase } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { QuoteWorkspace } from './components/QuoteWorkspace';
import { BusinessSettingsView } from './components/BusinessSettingsView';
import { PlansCreditsView } from './components/PlansCreditsView';
import { AuthView } from './components/AuthView';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

const LAST_PROTECTED_VIEW_KEY = 'cleanquote:last-protected-view';

function getInitialView(): AppView {
  if (new URLSearchParams(window.location.search).get('auth') === 'reset') return 'auth';

  const savedView = window.sessionStorage.getItem(LAST_PROTECTED_VIEW_KEY);
  if (savedView === 'workspace' || savedView === 'settings' || savedView === 'plans') {
    return savedView;
  }

  return 'landing';
}

export function App() {
  const [currentView, setCurrentView] = useState<AppView>(getInitialView);
  const [pendingView, setPendingView] = useState<AppView | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(() => loadBusinessSettings());
  const [credits, setCredits] = useState<CreditState>(() => loadCreditState());

  // Remember the last protected destination for this browser tab so refresh
  // restores it only after the existing Supabase session is verified.
  useEffect(() => {
    if (requiresAuthenticatedUser(currentView)) {
      window.sessionStorage.setItem(LAST_PROTECTED_VIEW_KEY, currentView);
    }
  }, [currentView]);

  // Subscribe first so initial-session, sign-in, refresh, recovery, and sign-out
  // events all update the same application-level identity state.
  useEffect(() => {
    if (!supabase) {
      setAuthStatus('unauthenticated');
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthStatus((currentStatus) => nextSession
        ? currentStatus === 'authenticated' ? 'authenticated' : 'checking'
        : 'unauthenticated');
    });

    return () => subscription.unsubscribe();
  }, []);

  // Verify the stored access token before granting access to protected views.
  // The server independently verifies tokens on protected API endpoints.
  useEffect(() => {
    if (!supabase || !session) {
      setAuthStatus('unauthenticated');
      return;
    }

    let active = true;
    setAuthStatus('checking');

    void supabase.auth.getClaims(session.access_token).then(({ data, error }) => {
      if (!active) return;
      const subject = data?.claims?.sub;
      const verified = !error && typeof subject === 'string' && subject === session.user.id;
      setAuthStatus(verified ? 'authenticated' : 'unauthenticated');
    }).catch(() => {
      if (active) setAuthStatus('unauthenticated');
    });

    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    if (authStatus === 'authenticated' && pendingView) {
      setCurrentView(pendingView);
      setPendingView(null);
    } else if (authStatus === 'unauthenticated' && requiresAuthenticatedUser(currentView)) {
      setCurrentView('auth');
    }
  }, [authStatus, currentView, pendingView]);

  const navigateTo = (view: AppView) => {
    const accessibleView = resolveAccessibleView(view, authStatus === 'authenticated');
    if (accessibleView !== view) {
      setPendingView(view);
      setCurrentView('auth');
      return;
    }
    setPendingView(null);
    setCurrentView(accessibleView);
  };

  const handleAuthenticated = (nextSession: Session) => {
    setSession(nextSession);
    setAuthStatus('checking');
    setPendingView((current) => current ?? 'workspace');
    setCurrentView('auth');
  };

  const handleSaveSettings = (next: BusinessSettings) => {
    setBusinessSettings(next);
    saveBusinessSettings(next);
  };

  const handleConsumeCredit = () => {
    setCredits((prev) => {
      const next: CreditState = {
        ...prev,
        remainingCredits: Math.max(0, prev.remainingCredits - 1),
        totalUsed: prev.totalUsed + 1,
      };
      saveCreditState(next);
      return next;
    });
  };

  const handleResetDemoCredits = () => setCredits(resetFreeDemoCredits());

  // Never render a protected screen while the session is being checked or absent.
  const visibleView = resolveAccessibleView(currentView, authStatus === 'authenticated');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Navbar currentView={visibleView} onNavigate={navigateTo} />
      <main className="flex-1">
        {visibleView === 'landing' && (
          <LandingPage onStartQuote={() => navigateTo('workspace')} onViewPlans={() => navigateTo('plans')} />
        )}
        {visibleView === 'workspace' && (
          <QuoteWorkspace businessSettings={businessSettings} credits={credits}
            onConsumeCredit={handleConsumeCredit} onGoToPlans={() => navigateTo('plans')}
            onGoToSettings={() => navigateTo('settings')} />
        )}
        {visibleView === 'settings' && <BusinessSettingsView settings={businessSettings} onSave={handleSaveSettings} />}
        {visibleView === 'plans' && <PlansCreditsView credits={credits} onResetFreeDemo={handleResetDemoCredits} />}
        {visibleView === 'auth' && <AuthView onBack={() => navigateTo('landing')} onAuthenticated={handleAuthenticated} />}
      </main>
    </div>
  );
}

export default App;
