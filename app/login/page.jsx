'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: fd.get('username'),
        password: fd.get('password'),
      }),
    });
    if (!res.ok) { setError('Username atau password salah'); return; }
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full animation fade-in">
        {/* Brand header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-brand-lg mb-4">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">G.U.A.R.D.S</h1>
          <p className="text-slate-500 text-sm mt-2">Sistem Laporan Fokus &amp; Distraksi</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Masuk ke Dashboard</h2>
            <p className="text-slate-500 text-sm mb-6">Gunakan kredensial admin untuk masuk.</p>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
                <input
                  name="username"
                  required
                  autoComplete="username"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="Masukkan username"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all shadow-brand active:scale-[0.98]"
              >
                <span>Masuk</span>
              </button>
            </form>
          </div>
          <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} G.U.A.R.D.S Report</p>
          </div>
        </div>
      </div>
    </div>
  );
}
