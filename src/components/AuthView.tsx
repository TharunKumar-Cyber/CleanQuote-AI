import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ArrowLeft, LoaderCircle, LogOut, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type AuthMode = 'sign_in' | 'sign_up' | 'forgot_password' | 'reset_password';

interface AuthViewProps { onBack: () => void; onAuthenticated: (session: Session) => void; }

export const AuthView: React.FC<AuthViewProps> = ({ onBack, onAuthenticated }) => {
  const [mode, setMode] = useState<AuthMode>(() =>
    new URLSearchParams(window.location.search).get('auth') === 'reset' ? 'reset_password' : 'sign_in'
  );
  const [session, setSession] = useState<Session | null>(null);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryReady(true);
        setMode('reset_password');
        setError('');
        setMessage('');
      } else if (event === 'SIGNED_OUT') {
        setRecoveryReady(false);
      }
    });
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => listener.subscription.unsubscribe();
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setError(''); setMessage('');
    try {
      if (mode === 'sign_up') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim() },
          },
        });
        if (authError) throw authError;
        if (data.session) { setSession(data.session); onAuthenticated(data.session); }
        else setMessage('Account created. Check your email to confirm your address before signing in.');
      } else if (mode === 'sign_in') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
        setSession(data.session);
        onAuthenticated(data.session);
        setMessage('You are signed in.');
      } else if (mode === 'forgot_password') {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/?auth=reset`,
        });
        if (authError) throw authError;
        setMessage('If the address is registered, a password recovery email will arrive shortly.');
      } else {
        if (!recoveryReady) {
          throw new Error('Open the password recovery link from your email in this browser before choosing a new password.');
        }
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        window.history.replaceState({}, document.title, window.location.pathname);
        setMode('sign_in'); setPassword(''); setRecoveryReady(false);
        setMessage('Password updated. Please sign in with your new password.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally { setBusy(false); }
  };

  const signOut = async () => {
    if (!supabase) return;
    setBusy(true); setError('');
    const { error: authError } = await supabase.auth.signOut();
    if (authError) setError(authError.message);
    else { setSession(null); setMessage('You have signed out.'); }
    setBusy(false);
  };

  const heading = mode === 'sign_up' ? 'Create your account'
    : mode === 'forgot_password' ? 'Reset your password'
    : mode === 'reset_password' ? 'Choose a new password' : 'Welcome back';

  return (
    <section className="max-w-xl mx-auto px-4 py-12 sm:py-16">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to CleanQuote AI
      </button>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><ShieldCheck className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-bold text-slate-900">{heading}</h1><p className="text-sm text-slate-500">Secure account access powered by Supabase</p></div>
        </div>

        {!isSupabaseConfigured && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Authentication is not configured yet. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> to your local <code>.env</code> after checking the project settings. Never use a service-role or secret key in the browser.
          </div>
        )}

        {session ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-700">Signed in as <strong>{session.user.email}</strong>.</p>
            <p className="text-xs text-slate-500">Your account is signed in. You can now open your quotation workspace and account settings.</p>
            <button type="button" disabled={busy} onClick={() => void signOut()} className="w-full rounded-lg bg-slate-900 text-white py-3 font-semibold disabled:opacity-50">
              {busy ? 'Signing out…' : <><LogOut className="inline w-4 h-4 mr-2" />Sign out</>}
            </button>
          </div>
        ) : mode === 'reset_password' && !recoveryReady ? (
          <div className="space-y-4">
            <p role="alert" className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
              A password recovery session has not been established. Open the newest recovery link from your email in this same browser. Do not use this page by navigating to it directly.
            </p>
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="space-y-4">
            {mode === 'sign_up' && (
              <label className="block text-sm font-medium text-slate-700">Full name
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} autoComplete="name" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
              </label>
            )}
            {mode !== 'reset_password' && (
              <label className="block text-sm font-medium text-slate-700">Email address
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
              </label>
            )}
            {mode !== 'forgot_password' && (
              <label className="block text-sm font-medium text-slate-700">{mode === 'reset_password' ? 'New password' : 'Password'}
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={mode === 'sign_up' ? 'new-password' : mode === 'reset_password' ? 'new-password' : 'current-password'} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
                <span className="mt-1 block text-xs text-slate-500">At least 8 characters. Supabase project password rules may require more.</span>
              </label>
            )}
            {error && <p role="alert" className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</p>}
            {message && <p role="status" className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">{message}</p>}
            <button type="submit" disabled={!isSupabaseConfigured || busy} className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white py-3 font-semibold disabled:opacity-50">
              {busy ? <><LoaderCircle className="inline w-4 h-4 mr-2 animate-spin" />Please wait…</>
                : mode === 'sign_up' ? 'Create account' : mode === 'forgot_password' ? 'Send recovery email' : mode === 'reset_password' ? 'Update password' : 'Sign in'}
            </button>
          </form>
        )}

        {!session && isSupabaseConfigured && (
          <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm">
            {mode === 'sign_in' && <>
              <button type="button" onClick={() => { setMode('forgot_password'); setMessage(''); setError(''); }} className="text-emerald-700 hover:underline">Forgot password?</button>
              <button type="button" onClick={() => { setMode('sign_up'); setMessage(''); setError(''); }} className="text-emerald-700 hover:underline">Create account</button>
            </>}
            {mode !== 'sign_in' && <button type="button" onClick={() => { setMode('sign_in'); setMessage(''); setError(''); }} className="text-emerald-700 hover:underline">Back to sign in</button>}
          </div>
        )}
      </div>
    </section>
  );
};
