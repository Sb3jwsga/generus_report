import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Icon } from '../../components/ui/Icon';

export default function LaporanBulananPage() {
  const { user } = useAuth();
  const [generusList, setGenerusList] = useState<any[]>([]);
  const [laporanList, setLaporanList] = useState<any[]>([]);
  const [rombelList, setRombelList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRombel, setSelectedRombel] = useState('');
  const [activeTab, setActiveTab] = useState<'generus' | 'riwayat'>('generus');

  useEffect(() => {
    if (!user?.id_kelompok) return;
    const fetchData = async () => {
      setLoading(true);
      const [resGenerus, resLaporan, resRombel] = await Promise.all([
        supabase
          .from('generus')
          .select('*, rombel(nama_rombel)')
          .eq('id_kelompok', user.id_kelompok)
          .order('nama_generus'),
        supabase
          .from('laporan_bulanan')
          .select('*, generus!inner(nama_generus, id_kelompok, rombel(nama_rombel))')
          .eq('generus.id_kelompok', user.id_kelompok)
          .order('tanggal_laporan', { ascending: false }),
        supabase.from('rombel').select('*').order('nama_rombel'),
      ]);

      setGenerusList(resGenerus.data || []);
      setLaporanList(resLaporan.data || []);
      setRombelList(resRombel.data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleDeleteLaporan = async (id: string) => {
    if (!confirm('Hapus laporan ini beserta detail capaiannya?')) return;
    await supabase.from('laporan_bulanan').delete().eq('id_laporan', id);
    setLaporanList(laporanList.filter((item) => item.id_laporan !== id));
  };

  const filteredGenerus = generusList.filter((g) => {
    const matchSearch = g.nama_generus.toLowerCase().includes(search.toLowerCase());
    const matchRombel = !selectedRombel || g.rombel?.nama_rombel === selectedRombel;
    return matchSearch && matchRombel;
  });

  const filteredLaporan = laporanList.filter((l) => {
    const matchSearch = (l.generus?.nama_generus || '').toLowerCase().includes(search.toLowerCase());
    const matchRombel = !selectedRombel || l.generus?.rombel?.nama_rombel === selectedRombel;
    return matchSearch && matchRombel;
  });

  const currentYearMonth = new Date().toISOString().slice(0, 7);

  const getLaporanBulanIni = (id_generus: string) => {
    return laporanList.find((l) => l.id_santri === id_generus && (l.tanggal_laporan || '').startsWith(currentYearMonth));
  };

  return (
    <DashboardLayout>
      <PageHeader
        badge="Pelaporan"
        title="Laporan Bulanan"
        description="Klik nama generus pada tabel untuk menginput laporan capaian bulanan."
        action={
          <Link to="/pengurus/laporan-bulanan/tambah">
            <Button>
              <Icon name="add" size={18} /> Input Laporan
            </Button>
          </Link>
        }
      />

      <div className="flex border-b border-gray-200 mb-4 gap-4">
        <button
          onClick={() => setActiveTab('generus')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'generus'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Data Generus ({generusList.length})
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'riwayat'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Riwayat Laporan ({laporanList.length})
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRombel('')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                selectedRombel === ''
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua Rombel
            </button>
            {rombelList.map((r) => (
              <button
                key={r.id_rombel}
                onClick={() => setSelectedRombel(r.nama_rombel)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  selectedRombel === r.nama_rombel
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r.nama_rombel}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="relative max-w-sm w-full">
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
            {activeTab === 'generus' && (
              <p className="text-xs text-gray-500 italic">
                Klik nama generus atau tombol "Laporkan" untuk mengisi laporan.
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        ) : activeTab === 'generus' ? (
          filteredGenerus.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon="groups"
                title={generusList.length === 0 ? 'Belum ada data generus' : 'Tidak ada hasil'}
                description="Tidak ada data generus di kelompok ini."
              />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Generus</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">L/P</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rombel</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status Bulan Ini</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredGenerus.map((g) => {
                      const existing = getLaporanBulanIni(g.id_generus);
                      return (
                        <tr key={g.id_generus} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <Link
                              to={`/pengurus/laporan-bulanan/tambah?generusId=${g.id_generus}${existing ? '&edit=true' : ''}`}
                              className="flex items-center gap-3 group"
                              title={existing ? 'Klik untuk mengedit' : 'Klik untuk melaporkan'}
                            >
                              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                                {g.nama_generus.charAt(0)}
                              </div>
                              <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors underline-offset-2 group-hover:underline">
                                {g.nama_generus}
                              </span>
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              g.jenis_kelamin === 'Laki-laki' ? 'bg-primary-container/10 text-primary' : 'bg-tertiary-fixed text-tertiary'
                            }`}>
                              {g.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">{g.rombel?.nama_rombel || '-'}</td>
                          <td className="px-6 py-4">
                            {existing ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                <Icon name="check_circle" size={14} />
                                Sudah Dilaporkan
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                                <Icon name="pending" size={14} className="text-gray-500" />
                                Belum Dilaporkan
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {existing ? (
                              <Link
                                to={`/pengurus/laporan-bulanan/tambah?generusId=${g.id_generus}&edit=true`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary-container text-gray-900 text-xs font-bold hover:bg-secondary-fixed transition-colors"
                              >
                                <Icon name="edit" size={16} /> Edit Laporan
                              </Link>
                            ) : (
                              <Link
                                to={`/pengurus/laporan-bulanan/tambah?generusId=${g.id_generus}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors"
                              >
                                <Icon name="post_add" size={16} /> Laporkan
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredGenerus.map((g) => {
                  const existing = getLaporanBulanIni(g.id_generus);
                  return (
                    <div key={g.id_generus} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <Link
                        to={existing ? `/pengurus/laporan-bulanan/tambah?generusId=${g.id_generus}&edit=true` : `/pengurus/laporan-bulanan/tambah?generusId=${g.id_generus}`}
                        className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0"
                      >
                        {g.nama_generus.charAt(0)}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={existing ? `/pengurus/laporan-bulanan/tambah?generusId=${g.id_generus}&edit=true` : `/pengurus/laporan-bulanan/tambah?generusId=${g.id_generus}`}
                          className="font-bold text-gray-900 truncate block hover:text-primary"
                        >
                          {g.nama_generus}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {g.rombel?.nama_rombel || '-'} • {g.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'} • {existing ? 'Sudah Dilaporkan' : 'Belum Dilaporkan'}
                        </p>
                      </div>
                      <Link
                        to={existing ? `/pengurus/laporan-bulanan/tambah?generusId=${g.id_generus}&edit=true` : `/pengurus/laporan-bulanan/tambah?generusId=${g.id_generus}`}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 ${
                          existing ? 'bg-secondary-container text-gray-900' : 'bg-primary text-white'
                        }`}
                      >
                        <Icon name={existing ? 'edit' : 'post_add'} size={16} /> {existing ? 'Edit' : 'Laporkan'}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </>
          )
        ) : (
          filteredLaporan.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon="assessment"
                title={laporanList.length === 0 ? 'Belum ada laporan' : 'Tidak ada hasil'}
                description="Input laporan capaian bulanan baru atau ubah kata kunci."
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredLaporan.map((l) => (
                <div key={l.id_laporan} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center font-bold shrink-0">
                    {(l.generus?.nama_generus || '?').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{l.generus?.nama_generus}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Icon name="calendar_month" size={13} />
                      {new Date(l.tanggal_laporan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {l.generus?.rombel?.nama_rombel && ` • ${l.generus.rombel.nama_rombel}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteLaporan(l.id_laporan)}
                    className="p-2 rounded-lg text-gray-400 hover:text-error hover:bg-error-container/50 transition-colors shrink-0"
                    title="Hapus laporan"
                  >
                    <Icon name="delete" size={18} />
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
