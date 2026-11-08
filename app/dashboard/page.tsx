import { getSessionToken, verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const token = getSessionToken();
  if (!token) redirect('/login');
  try { verifyToken(token); } catch { redirect('/login'); }

  const { data: reports = [] } = await supabase
    .from('reports')
    .select('*')
    .order('waktu', { ascending: false });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Laporan Distraksi GUARDS</h1>
        <form action="/api/auth/logout" method="POST">
          <button className="bg-red-600 text-white px-4 py-2 rounded">Keluar</button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">Waktu</th>
              <th className="border p-3 text-left">Status</th>
              <th className="border p-3 text-left">Screenshot</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="border p-3">
                  {new Date(r.waktu).toLocaleString('id-ID')}
                </td>
                <td className="border p-3">
                  {r.status === 'terdistraksi' ? (
                    <span className="text-red-600 font-medium">Terdistraksi</span>
                  ) : (
                    <span className="text-green-600 font-medium">Fokus</span>
                  )}
                </td>
                <td className="border p-3">
                  <img
                    src={r.image_url}
                    alt="screenshot"
                    className="w-24 h-16 object-cover rounded border cursor-pointer"
                    onClick={() => window.open(r.image_url, '_blank')}
                  />
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan="3" className="border p-3 text-center text-gray-500">
                  Belum ada laporan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
