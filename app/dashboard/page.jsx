'use client';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getClientSessionToken } from '../../lib/auth';

export default function Dashboard() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getClientSessionToken();
      if (!token) { router.replace('/login'); return; }
      const { data } = await supabase
        .from('reports')
        .select('*')
        .order('time', { ascending: false });
      if (!cancelled) {
        setReports(data ?? []);
        setLoading(false);
        drawChart(data ?? []);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function handleLogout(e) {
    e.preventDefault();
    fetch('/api/auth/logout', { method: 'POST' }).then(() => router.push('/login'));
  }

  const total = reports.length;
  const distracted = reports.filter((r) => r.status === 'distracted').length;
  const focus = total - distracted;
  const rate = total ? Math.round((distracted / total) * 100) : 0;

  function drawChart(data) {
    if (!chartRef.current) return;
    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const days = 7;
    const labels = [];
    const distractedByDay = {};
    const focusByDay = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      labels.push(key);
      distractedByDay[key] = 0;
      focusByDay[key] = 0;
    }
    data.forEach((r) => {
      const key = new Date(r.time).toISOString().slice(0, 10);
      if (distractedByDay[key] !== undefined) {
        if (r.status === 'distracted') distractedByDay[key]++;
        else focusByDay[key]++;
      }
    });

    const maxVal = Math.max(
      ...labels.map((k) => distractedByDay[k] + focusByDay[k]),
      1
    );
    const pad = 40;
    const areaW = w - pad * 2;
    const areaH = h - pad * 2;

    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    labels.forEach((label, i) => {
      const x = pad + (areaW * i) / (labels.length - 1);
      const short = label.slice(5);
      ctx.textAlign = 'center';
      ctx.fillText(short, x, h - 24);
    });

    function bar(key, color, baseOffset) {
      labels.forEach((label, i) => {
        const val = (key === 'distracted' ? distractedByDay : focusByDay)[label];
        const x = pad + (areaW * i) / (labels.length - 1) - 14;
        const barH = (val / maxVal) * areaH;
        const y = h - pad - barH + baseOffset;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 28, barH);
      });
    }

    bar('focus', '#22c55e', 14);
    bar('distracted', '#ef4444', -14);

    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('Focus', pad, 20);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Distracted', pad + 40, 20);
  }

  return (
    <div className="min-h-screen dark-bg">
      <nav className="sticky top-0 z-40 glass-panel border-b border-dark-border/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-brand-600 flex items-center justify-center shadow-brand">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="font-bold text-dark-text tracking-tight">GUARDS<span className="text-brand-400">Reports</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const isDark = document.documentElement.classList.toggle('dark');
                localStorage.setItem('guards-theme', isDark ? 'dark' : 'light');
              }}
              className="p-2 rounded-xl bg-dark-card border border-dark-border text-dark-muted hover:text-brand-400 hover:border-brand-500/40 transition-colors"
              title="Toggle theme"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            <form action="/api/auth/logout" method="POST" onSubmit={handleLogout} className="flex items-center">
              <button className="btn-ghost px-4 py-2 text-sm">Logout</button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
          <div className="flex-1 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-dark-text text-balance">Distraction Reports</h1>
                <p className="text-dark-muted mt-1">Monitor guard focus in real time.</p>
              </div>
              <div className="flex gap-3">
                <button className="btn-ghost px-4 py-2 text-sm hidden md:flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Export
                </button>
                <button className="btn-brand px-5 py-2 text-sm hidden md:flex items-center gap-2">
                  Refresh <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="stat-label">Total reports</span>
            <span className="stat-value text-brand-400">{total}</span>
          </div>
          <div className="stat-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <span className="stat-label">Focused</span>
            <span className="stat-value text-success-400">{focus}</span>
          </div>
          <div className="stat-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <span className="stat-label">Distracted</span>
            <span className="stat-value text-danger-400">{distracted}</span>
          </div>
          <div className="stat-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between">
              <div>
                <span className="stat-label">Distraction rate</span>
                <span className="stat-value">{rate}%</span>
              </div>
              <div className="text-right">
                <span className="block text-xs text-dark-muted">of {total} events</span>
                <div className="w-full bg-dark-border rounded-full h-2 mt-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-danger-500 transition-all duration-1000" style={{ width: `${rate}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <div className="chart-wrap animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-dark-text">Activity (7 days)</h2>
              <span className="text-xs text-dark-muted">Focus vs Distracted</span>
            </div>
            <div className="relative h-48 w-full flex items-end">
              <canvas ref={chartRef} className="w-full h-full" />
            </div>
          </div>
          <div className="chart-wrap animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-dark-text">Status breakdown</h2>
              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success-500" />
                  <span className="text-xs text-dark-text font-medium">Focused: {focus}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-danger-500" />
                  <span className="text-xs text-dark-text font-medium">Distracted: {distracted}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-24 bg-dark-border rounded h-2 flex">
                  <div className="h-full bg-success-500 rounded h-2" style={{ width: total ? `${(focus / total) * 100}%` : '0%' }} />
                </div>
                <span className="text-sm text-dark-text">{focus}</span>
                <span className="ml-auto text-sm text-dark-muted">{total ? `${Math.round((focus / total) * 100)}%` : '0%'}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 bg-dark-border rounded h-2 flex">
                  <div className="h-full bg-danger-500 rounded h-2" style={{ width: total ? `${(distracted / total) * 100}%` : '0%' }} />
                </div>
                <span className="text-sm text-dark-text">{distracted}</span>
                <span className="ml-auto text-sm text-dark-muted">{total ? `${Math.round((distracted / total) * 100)}%` : '0%'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="table-wrap animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="p-6 border-b border-dark-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-dark-text">Recent reports</h2>
            <span className="text-sm text-dark-muted">{reports.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th className="w-32">Status</th>
                  <th className="w-40">Screenshot</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="group">
                    <td>
                      <div className="text-sm text-dark-text">{new Date(r.time).toLocaleString('en-US')}</div>
                      <div className="text-xs text-dark-muted">{new Date(r.time).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    </td>
                    <td>
                      {r.status === 'distracted' ? (
                        <span className="badge badge-distracted">Distracted</span>
                      ) : (
                        <span className="badge badge-focus">Focus</span>
                      )}
                    </td>
                    <td>
                      <div className="relative">
                        <img
                          src={r.image_url}
                          alt="screenshot"
                          className="w-20 h-12 object-cover rounded-lg border border-dark-border/40 cursor-pointer opacity-80 group-hover:opacity-100 transition-opacity"
                          onClick={() => window.open(r.image_url, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <button className="text-xs text-brand-400 hover:underline underline-offset-4">Open</button>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-dark-muted">
                      <div className="w-12 h-12 rounded-full bg-dark-border flex items-center justify-center mx-auto mb-3 opacity-50">
                        <svg className="w-6 h-6 text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-dark-text font-medium">No reports yet</p>
                      <p className="text-sm text-dark-muted">Reports will appear here as guards submit activity.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
