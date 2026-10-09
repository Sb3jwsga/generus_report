import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [generusList, setGenerusList] = useState<any[]>([]);
  const [laporanList, setLaporanList] = useState<any[]>([]);
  const [rombelList, setRombelList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedRombel, setSelectedRombel] = useState(searchParams.get('rombel') || '');
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
    if (!confirm('Hapus laporan ini beserta detail capaian dan catatannya?')) return;
    const target = laporanList.find((item) => item.id_laporan === id);
    const catatanId = target?.id_catatan || null;

    const { error: errDetail } = await supabase.from('detail_laporan_bulanan').delete().eq('id_laporan', id);
    if (errDetail) {
      alert(`Gagal menghapus detail laporan: ${errDetail.message}`);
      return;
    }

    const { error: errLaporan } = await supabase.from('laporan_bulanan').delete().eq('id_laporan', id);
    if (errLaporan) {
      alert(`Gagal menghapus laporan: ${errLaporan.message}`);
      return;
    }

    if (catatanId) {
      await supabase.from('catatan').delete().eq('id_catatan', catatanId);
    }

    setLaporanList(laporanList.filter((item) => item.id_laporan !== id));
  };

  const applyFilters = (s: string, r: string) => {
    setSearch(s);
    setSelectedRombel(r);
    setSearchParams({ search: s, rombel: r });
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

  const commonParams = `search=${encodeURIComponent(search)}&rombel=${selectedRombel}`;

  return (
    <DashboardLayout>
      <PageHeader
        badge="Pelaporan"
        title="Laporan Bulanan"
        description="Klik nama generus pada tabel untuk menginput laporan capaian bulanan."
        action={
          <Link to={`/pengurus/laporan-bulanan/tambah?${commonParams}`}>
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
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon name="search" size={18} />
              </span>
              <input
                value={search}
                onChange={(e) => applyFilters(e.target.value, selectedRombel)}
                placeholder="Cari nama generus..."
                className="w-full rounded-lg bg-gray-50 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <select
              value={selectedRombel}
              onChange={(e) => applyFilters(search, e.target.value)}
              className="rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Semua Rombel</option>
              {rombelList.map((r) => (
                <option key={r.id_rombel} value={r.nama_rombel}>
                  {r.nama_rombel}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {activeTab === 'generus' ? 'DAFTAR GENERUS' : 'RIWAYAT LAPORAN'}
            </p>
            <span className="text-xs text-gray-300 ml-auto">
              {activeTab === 'generus' ? filteredGenerus.length : filteredLaporan.length} data ditemukan
            </span>
          </div>
          <div className="flex flex-col gap-1.5 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <Icon name="info" size={16} className="text-primary" />
              <p className="text-xs font-bold uppercase tracking-wide">Panduan Cepat</p>
            </div>
            {activeTab === 'generus' ? (
              <p className="text-[11px] leading-relaxed text-gray-500">
                Klik nama generus atau tombol "Laporkan" untuk mengisi laporan. Status <span className="font-bold">Sudah Dilaporkan</span> menunjukkan laporan bulan ini telah terisi.
              </p>
            ) : (
              <p className="text-[11px] leading-relaxed text-gray-500">
                Gunakan fitur pencarian untuk menemukan laporan spesifik. Klik ikon edit untuk mengubah atau ikon sampah untuk menghapus laporan.
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
                              to={`/pengurus/laporan-bulanan/tambah?generusId=${g.id_generus}${existing ? '&edit=true' : ''}&${commonParams}`}
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
                                to={`/pengurus/laporan-bulanan/tambah?generusId=${g.id_generus}&edit=true&${commonParams}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary-container text-gray-900 text-xs font-bold hover:bg-secondary-fixed transition-colors"
                              >
                                <Icon name="edit" size={16} /> Edit Laporan
                              </Link>
                            ) : (
                              <Link
                                to={`/pengurus/laporan-bulanan/tambah?generusId=${g.id_generus}&${commonParams}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors"
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

              {/* Mobile List */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredGenerus.map((g) => {
                  const existing = getLaporanBulanIni(g.id_generus);
                  return (
                    <div key={g.id_generus} className="p-4 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
                        {g.nama_generus.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{g.nama_generus}</p>
                        <p className="text-xs text-gray-500">{g.rombel?.nama_rombel || '-'} • {g.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}</p>
                        <div className="mt-1">
                          {existing ? (
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase">Sudah Lapor</span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded uppercase">Belum Lapor</span>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/pengurus/laporan-bulanan/tambah?generusId=${g.id_generus}${existing ? '&edit=true' : ''}&${commonParams}`}
                        className={`p-2.5 rounded-xl ${existing ? 'text-gray-400 bg-gray-50' : 'text-primary bg-primary-container/10'}`}
                      >
                        <Icon name={existing ? 'edit' : 'post_add'} size={20} />
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
                icon="history"
                title="Belum ada riwayat"
                description="Belum ada laporan yang diinput oleh pengurus kelompok Anda."
              />
            </div>
          ) : (
            <>
              {/* Desktop Riwayat */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Generus</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rombel</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">H/I/S/A</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLaporan.map((l) => (
                      <tr key={l.id_laporan} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {new Date(l.tanggal_laporan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{l.generus?.nama_generus}</td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-500">{l.generus?.rombel?.nama_rombel || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-6 h-6 rounded bg-green-50 text-green-600 flex items-center justify-center text-[10px] font-bold" title="Hadir">{l.jumlah_hadir}</span>
                            <span className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold" title="Izin">{l.jumlah_izin}</span>
                            <span className="w-6 h-6 rounded bg-yellow-50 text-yellow-600 flex items-center justify-center text-[10px] font-bold" title="Sakit">{l.jumlah_sakit}</span>
                            <span className="w-6 h-6 rounded bg-red-50 text-red-600 flex items-center justify-center text-[10px] font-bold" title="Alfa">{l.jumlah_alfa}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Link
                              to={`/pengurus/laporan-bulanan/tambah?id=${l.id_laporan}&edit=true&${commonParams}`}
                              className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary-container/10 transition-colors"
                              title="Edit"
                            >
                              <Icon name="edit" size={18} />
                            </Link>
                            <button
                              onClick={() => handleDeleteLaporan(l.id_laporan)}
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

              {/* Mobile Riwayat */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredLaporan.map((l) => (
                  <div key={l.id_laporan} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                          {new Date(l.tanggal_laporan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="font-bold text-gray-900">{l.generus?.nama_generus}</p>
                        <p className="text-[10px] font-medium text-gray-500 uppercase">{l.generus?.rombel?.nama_rombel || '-'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link to={`/pengurus/laporan-bulanan/tambah?id=${l.id_laporan}&edit=true&${commonParams}`} className="p-2 text-gray-400 hover:text-primary"><Icon name="edit" size={18} /></Link>
                        <button onClick={() => handleDeleteLaporan(l.id_laporan)} className="p-2 text-gray-400 hover:text-error"><Icon name="delete" size={18} /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-1 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                        <div className="flex-1 text-center"><p className="text-[8px] font-bold text-gray-400 uppercase">H</p><p className="text-xs font-bold text-green-600">{l.jumlah_hadir}</p></div>
                        <div className="w-px h-4 bg-gray-200" />
                        <div className="flex-1 text-center"><p className="text-[8px] font-bold text-gray-400 uppercase">I</p><p className="text-xs font-bold text-blue-600">{l.jumlah_izin}</p></div>
                        <div className="w-px h-4 bg-gray-200" />
                        <div className="flex-1 text-center"><p className="text-[8px] font-bold text-gray-400 uppercase">S</p><p className="text-xs font-bold text-yellow-600">{l.jumlah_sakit}</p></div>
                        <div className="w-px h-4 bg-gray-200" />
                        <div className="flex-1 text-center"><p className="text-[8px] font-bold text-gray-400 uppercase">A</p><p className="text-xs font-bold text-red-600">{l.jumlah_alfa}</p></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
