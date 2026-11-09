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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 animation slide-up">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-2xl bg-brand-600 flex items-center justify-center shadow-brand">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                G.U.A.R.D.S Report
              </h1>
            </div>
            <p className="text-slate-500 text-sm">
              Laporan aktivitas dan status fokus karyawan
            </p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-sm">
              Keluar
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animation slide-up" style={{ animationDelay: '0.1s' }}>
          <StatCard title="Total Laporan" value={total} icon="📊" color="brand" />
          <StatCard title="Terdistraksi" value={terdistraksi} icon="⚠️" color="red" />
          <StatCard title="Fokus" value={fokus} icon="✅" color="green" />
        </div>

        <div className="rounded-3xl shadow-card border border-slate-200 bg-white overflow-hidden animation slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Waktu</th>
                  <th className="px-6 py-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Screenshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {new Date(r.waktu).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      {r.status === 'terdistraksi' ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-100">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          Terdistraksi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Fokus
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <img
                        src={r.image_url}
                        alt="screenshot"
                        className="w-24 h-14 object-cover rounded-lg border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => window.open(r.image_url, '_blank')}
                      />
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <div className="inline-flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-2xl">
                          📭
                        </div>
                        <p className="text-sm text-slate-500">Belum ada laporan.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          G.U.A.R.D.S Report &middot; Laporan aktual dari sistem
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const dotMap = {
    brand: 'bg-brand-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
  };
  const iconBgMap = {
    brand: 'bg-brand-100',
    red: 'bg-red-100',
    green: 'bg-green-100',
  };
  const cardBgMap = {
    brand: 'bg-brand-50',
    red: 'bg-red-50',
    green: 'bg-green-50',
  };
  const cardBorderMap = {
    brand: 'border-brand-100',
    red: 'border-red-100',
    green: 'border-green-100',
  };

  return (
    <div className={`rounded-2xl p-6 ${cardBgMap[color]} ${cardBorderMap[color]} shadow-sm`}>
      <div className="flex justify-between items-start mb-3">
        <span className={`w-8 h-8 rounded-xl ${iconBgMap[color]} flex items-center justify-center text-xs`}>
          {icon}
        </span>
        <div className={`w-2 h-2 rounded-full ${dotMap[color]}`}></div>
      </div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
