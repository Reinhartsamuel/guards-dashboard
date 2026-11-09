'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: fd.get('username'),
          password: fd.get('password'),
        }),
      });
      if (!res.ok) { setError('Username atau password salah'); setIsLoading(false); return; }
      router.push('/dashboard');
    } catch {
      setError('Terjadi kesalahan koneksi');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] left-[60%] w-64 h-64 bg-red-500/10 rounded-full blur-[80px]"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
      </div>

      <div className="relative z-10 max-w-md w-full animation fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-brand-lg mb-4 animate-float">
            <span className="text-white text-2xl font-extrabold tracking-tight">G</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">G.U.A.R.D.S</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Sistem Laporan Fokus &amp; Distraksi</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Masuk ke Dashboard</h2>
            <p className="text-slate-500 text-sm mb-6">Gunakan kredensial admin Anda untuk masuk.</p>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium shadow-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
                <input name="username" required autoComplete="username" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm" placeholder="admin" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <input name="password" type="password" required autoComplete="current-password" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={isLoading} className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-white font-semibold shadow-brand transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] ${isLoading ? 'bg-slate-400' : 'bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'}`}>
                {isLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>
          </div>
          <div className="bg-slate-50/50 px-8 py-6 border-t border-white/50 text-center">
            <p className="text-xs text-slate-400 font-medium">© {new Date().getFullYear()} G.U.A.R.D.S Report</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
