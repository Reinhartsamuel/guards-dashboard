import { getSessionToken, verifyToken } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const token = getSessionToken();
  if (!token) redirect('/login');
  try { verifyToken(token); } catch { redirect('/login'); }

  let reports = [];
  if (supabase) {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('waktu', { ascending: false });
    reports = data || [];
  }

  const total = reports.length;
  const terdistraksi = reports.filter((r) => r.status === 'terdistraksi').length;
  const fokus = reports.filter((r) => r.status === 'fokus').length;
  const distractionRate = total > 0 ? Math.round((terdistraksi / total) * 100) : 0;
  const focusRate = total > 0 ? Math.round((fokus / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-white/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand-lg">
                <span className="text-white text-xs font-extrabold tracking-wider">G</span>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  G.U.A.R.D.S Report
                </h1>
                <p className="text-xs text-slate-500 font-medium leading-tight">
                  Laporan aktivitas &amp; status fokus karyawan
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-white/60 backdrop-blur text-xs font-semibold text-slate-600 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sistem Aktif
              </span>
              <form action="/api/auth/logout" method="POST">
                <button className="px-4 py-2.5 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 transition-all shadow-sm active:scale-[0.97]">
                  Keluar
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10 animation fade-in">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
                Ringkasan Harian
              </h2>
              <p className="text-slate-500 text-sm">
                Pantau status fokus dan distraksi tim secara real-time.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-brand">
                Ekspor Laporan
              </button>
              <button className="px-4 py-2.5 rounded-xl bg-white text-slate-600 font-semibold border border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all">
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 animation slide-up" style={{ animationDelay: '0.1s' }}>
          <StatCard title="Total Laporan" value={total} icon="📊" gradient="from-brand-500 to-brand-600" dot="bg-brand-500" badge={<span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full text-xs font-bold">Semua</span>} />
          <StatCard title="Terdistraksi" value={terdistraksi} icon="⚠️" gradient="from-red-500 to-red-600" dot="bg-red-500" badge={<span className={`bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold ${distractionRate > 50 ? 'animate-pulse' : ''}`}>{distractionRate}%</span>} />
          <StatCard title="Fokus" value={fokus} icon="✅" gradient="from-emerald-500 to-emerald-600" dot="bg-emerald-500" badge={<span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold">Optimal</span>} />
          <StatCard title="Tingkat Fokus" value={focusRate} suffix="%" icon="🎯" gradient="from-indigo-500 to-indigo-600" dot="bg-indigo-500" badge={<span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">Target 80%+</span>} />
        </div>

        <div className="mb-10 animation slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white rounded-3xl shadow-card border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Distribusi Status</h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-brand-500"></span> Total
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Fokus
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Terdistraksi
                </span>
              </div>
            </div>
            <div className="flex items-end gap-2 h-32">
              {[total, fokus, terdistraksi].map((val, i) => {
                const height = total > 0 ? Math.max(20, (val / total) * 100) : 0;
                const colors = ['bg-brand-500', 'bg-emerald-500', 'bg-red-500'];
                return (
                  <div key={i} className={`flex-1 rounded-t-lg transition-all duration-500 hover:opacity-90 ${colors[i]} relative group`} style={{ height: `${height}%` }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{val}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-3 text-xs text-slate-500 font-medium">
              <span>Total Laporan</span>
              <span>{total}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl shadow-card border border-slate-200 bg-white overflow-hidden animation slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">📋</span>
              Riwayat Laporan
            </h3>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{reports.length} entri</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Waktu</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bukti</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 font-medium">{new Date(r.waktu).toLocaleString('id-ID')}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{new Date(r.waktu).toLocaleDateString('id-ID', { weekday: 'short' })}</div>
                    </td>
                    <td className="px-6 py-4">
                      {r.status === 'terdistraksi' ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-100 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          Terdistraksi
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.1)]">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          Fokus
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative group">
                        <img src={r.image_url} alt="screenshot" className="w-20 h-12 object-cover rounded-lg border border-slate-200 cursor-pointer hover:shadow-xl transition-all group-hover:scale-105" onClick={() => window.open(r.image_url, '_blank')} />
                        <div className="absolute bottom-full left-0 mb-2 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Lihat screenshot</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors">Detail</button>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="inline-flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl">📭</div>
                        <p className="text-sm text-slate-500 font-medium">Belum ada laporan.</p>
                        <p className="text-[10px] text-slate-400">Data akan muncul di sini setelah ada aktivitas tercatat.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <p className="text-[10px] text-slate-400">G.U.A.R.D.S Report &middot; Sistem monitoring fokus karyawan</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, gradient, dot, badge, suffix }) {
  return (
    <div className="relative rounded-3xl p-5 bg-white border border-white/60 shadow-card overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tr {gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand-50 group-hover:text-white transition-all">{icon}</div>
          {badge}
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-slate-900 group-hover:text-slate-900 transition-colors">{value}</span>
          {suffix && <span className="text-xs font-medium text-slate-400">{suffix}</span>}
        </div>
      </div>
      <div className="absolute top-0 right-0 p-3">
        <div className={`w-2 h-2 rounded-full ${dot} shadow-[0_0_8px_rgba(0,0,0,0.2)]`}></div>
      </div>
    </div>
  );
}
