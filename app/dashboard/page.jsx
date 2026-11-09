import { getSessionToken, verifyToken } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const token = getSessionToken();
  if (!token) redirect('/login');
  try { verifyToken(token); } catch { redirect('/login'); }

  const { data: reports = [] } = await supabase
    .from('reports')
    .select('*')
    .order('waktu', { ascending: false });

  const total = reports.length;
  const terdistraksi = reports.filter((r) => r.status === 'terdistraksi').length;
  const fokus = reports.filter((r) => r.status === 'fokus').length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              G.U.A.R.D.S Report
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Laporan aktivitas dan status fokus karyawan
            </p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
              Keluar
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Laporan</div>
            <div className="text-3xl font-bold text-slate-900">{total}</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">Terdistraksi</div>
            <div className="text-3xl font-bold text-red-600">{terdistraksi}</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-1">Fokus</div>
            <div className="text-3xl font-bold text-green-600">{fokus}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Waktu</th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Screenshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {new Date(r.waktu).toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-4">
                      {r.status === 'terdistraksi' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-100">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                          Terdistraksi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Fokus
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <img
                        src={r.image_url}
                        alt="screenshot"
                        className="w-20 h-12 object-cover rounded border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => window.open(r.image_url, '_blank')}
                      />
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center text-slate-400">
                      Belum ada laporan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
