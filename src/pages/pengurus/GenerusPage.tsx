import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Generus } from '../../types';
import { Button } from '../../components/ui/Button';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Icon } from '../../components/ui/Icon';

export default function GenerusPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.id_kelompok) return;
    const fetch = async () => {
      const { data: d } = await supabase
        .from('generus')
        .select('*, rombel(nama_rombel)')
        .eq('id_kelompok', user.id_kelompok)
        .order('nama_generus');
      setData(d || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus generus "${nama}"?`)) return;
    await supabase.from('generus').delete().eq('id_generus', id);
    setData(data.filter((d) => d.id_generus !== id));
  };

  const filtered = data.filter((g: Generus) =>
    g.nama_generus.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        badge="Data Kelompok"
        title="Data Generus"
        description={`${data.length} generus di kelompok Anda.`}
        action={
          <Link to="/pengurus/generus/tambah">
            <Button>
              <Icon name="add" size={18} /> Tambah Generus
            </Button>
          </Link>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon name="search" size={18} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama generus..."
              className="w-full rounded-lg bg-gray-50 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="groups"
              title={data.length === 0 ? 'Belum ada generus' : 'Tidak ada hasil'}
              description="Tambah generus baru atau ubah kata kunci pencarian."
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">L/P</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Lahir</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rombel</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((g) => (
                    <tr key={g.id_generus} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {g.nama_generus.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-900">{g.nama_generus}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          g.jenis_kelamin === 'Laki-laki' ? 'bg-primary-container/10 text-primary' : 'bg-tertiary-fixed text-tertiary'
                        }`}>
                          {g.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(g.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{g.rombel?.nama_rombel || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            to={`/pengurus/generus/${g.id_generus}`}
                            className="p-2 rounded-lg text-primary hover:bg-primary-container/10 transition-colors"
                            title="Detail"
                          >
                            <Icon name="visibility" size={18} />
                          </Link>
                          <Link
                            to={`/pengurus/generus/tambah?id=${g.id_generus}`}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Icon name="edit" size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(g.id_generus, g.nama_generus)}
                            className="p-2 rounded-lg text-gray-400 hover:text-error hover:bg-error-container/50 transition-colors"
                            title="Hapus"
                          >
                            <Icon name="delete" size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((g) => (
                <div key={g.id_generus} className="p-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
                    {g.nama_generus.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{g.nama_generus}</p>
                    <p className="text-xs text-gray-500">{g.rombel?.nama_rombel || '-'} • {g.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</p>
                  </div>
                  <div className="inline-flex items-center shrink-0">
                    <Link to={`/pengurus/generus/tambah?id=${g.id_generus}`} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100" title="Edit">
                      <Icon name="edit" size={18} />
                    </Link>
                    <Link to={`/pengurus/generus/${g.id_generus}`} className="p-2 rounded-lg text-primary hover:bg-primary-container/10" title="Detail">
                      <Icon name="chevron_right" size={20} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
