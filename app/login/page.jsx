'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: fd.get('username'),
        password: fd.get('password'),
      }),
    });
    setLoading(false);
    if (!res.ok) { setError('Invalid username or password'); return; }
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen dark-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '-2s' }} />
      </div>
      <div className="glass-panel w-full max-w-md p-8 md:p-10 animate-slide-up">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-brand">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-dark-text tracking-tight">GUARDS</h1>
        </div>
        <p className="text-dark-muted text-sm mb-8">Sign in to access the distraction monitoring dashboard.</p>
        {error && (
          <div className="mb-6 p-3 rounded-lg border border-danger-500/30 bg-danger-500/10 text-danger-400 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-text mb-1.5">Username</label>
            <input
              name="username"
              required
              autoComplete="username"
              className="glass-input"
              placeholder="e.g. admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="glass-input"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-brand w-full"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-8 text-xs text-dark-muted/70 text-center">
          GUARDS Dashboard &bull; Secure access
        </p>
      </div>
    </div>
  );
}
