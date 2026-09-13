'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useApp } from '@/lib/store';

const DEMO_ACCOUNTS = [
  { label: 'Commuter demo', email: 'commuter@ayab.com' },
  { label: 'Driver demo', email: 'driver@ayab.com' },
  { label: 'Admin demo', email: 'admin@ayab.com' },
];

export default function LoginPage() {
  const { mounted, currentUser, login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!mounted || !currentUser) return;
    router.replace(currentUser.role === 'admin' ? '/admin/dashboard' : `/${currentUser.role}/home`);
  }, [mounted, currentUser, router]);

  function attemptLogin(loginEmail: string, loginPassword: string) {
    setError('');
    setSubmitting(true);
    const user = login(loginEmail, loginPassword);
    setSubmitting(false);
    if (!user) {
      const exists = loginEmail.trim().length > 0;
      setError(
        exists
          ? 'That email and password combination did not match an account, or the account is suspended.'
          : 'Enter your email and password to sign in.',
      );
      return;
    }
    router.replace(user.role === 'admin' ? '/admin/dashboard' : `/${user.role}/home`);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    attemptLogin(email, password);
  }

  function useDemoAccount(demoEmail: string) {
    setEmail(demoEmail);
    setPassword('123456');
    attemptLogin(demoEmail, '123456');
  }

  return (
    <div className="shell">
      <div className="page-body">
        <div className="ticket px-5 py-6">
          <div className="ticket-notch">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>
          <p className="font-display text-[13px] font-extrabold uppercase tracking-[0.18em] text-gold">
            AYAB
          </p>
          <h1 className="mt-1 font-display text-[30px] font-extrabold leading-tight">
            Your Ride. Your way.
          </h1>
          <div className="tear-line" />
          <p className="text-[14px] text-white/85">TODA na &apos;to!</p>
          <p className="text-[13px] text-white/60">Tuguegarao City, Philippines</p>
        </div>

        <form onSubmit={handleSubmit} className="panel mt-4">
          <h2 className="mb-3 font-display text-[17px] font-bold">Sign in</h2>

          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input mb-3"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-[13px] text-danger">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary mt-4" disabled={submitting}>
            Log in
          </button>
        </form>

        <p className="section-label">Choose a demo account</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.slice(0, 2).map((acc) => (
            <button
              key={acc.email}
              onClick={() => useDemoAccount(acc.email)}
              className="btn-outline btn-sm"
              type="button"
            >
              {acc.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => useDemoAccount(DEMO_ACCOUNTS[2].email)}
          className="btn-outline btn-sm mt-2"
          type="button"
        >
          {DEMO_ACCOUNTS[2].label}
        </button>
      </div>
    </div>
  );
}
