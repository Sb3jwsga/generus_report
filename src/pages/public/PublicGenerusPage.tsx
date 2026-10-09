import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import type { Generus, Rombel, Kelompok } from '../../types';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Spinner } from '../../components/ui/Spinner';
import { Combobox } from '../../components/ui/Combobox';
import { Icon } from '../../components/ui/Icon';

export default function PublicGenerusPage() {
  const [data, setData] = useState<any[]>([]);
  const [rombelList, setRombelList] = useState<Rombel[]>([]);
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRombel, setFilterRombel] = useState('');
  const [filterKelompok, setFilterKelompok] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [g, r, k] = await Promise.all([
          supabase.from('generus').select('*, rombel(nama_rombel), kelompok(nama_kelompok)').order('nama_generus'),
          supabase.from('rombel').select('*'),
          supabase.from('kelompok').select('*'),
        ]);
        setData(g.data || []);
        setRombelList(r.data || []);
        setKelompokList(k.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = data.filter((g) => {
    const matchSearch = g.nama_generus.toLowerCase().includes(search.toLowerCase());
    const matchRombel = !filterRombel || g.id_rombel === filterRombel;
    const matchKelompok = !filterKelompok || g.id_kelompok === filterKelompok;
    return matchSearch && matchRombel && matchKelompok;
  });

  const rombelOptions = rombelList.map((r) => ({ value: r.id_rombel, label: r.nama_rombel }));
  const kelompokOptions = kelompokList.map((k) => ({ value: k.id_kelompok, label: k.nama_kelompok }));

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Icon name="tune" size={22} className="text-primary" />
          <h1 className="text-base font-bold text-gray-900">Penyaringan Direktori</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 lg:max-w-3xl">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon name="search" size={18} />
            </span>
            <input
              type="text"
              placeholder="Cari nama generus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-gray-50 border-0 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Combobox options={rombelOptions} value={filterRombel} onChange={setFilterRombel} placeholder="Filter Rombel" />
          <Combobox options={kelompokOptions} value={filterKelompok} onChange={setFilterKelompok} placeholder="Filter Kelompok" />
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Menampilkan <span className="font-bold text-gray-900">{filtered.length}</span> dari {data.length} generus
      </p>

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
            <Icon name="person_search" size={32} />
          </div>
          <p className="text-gray-900 font-semibold">Tidak ada generus ditemukan</p>
          <p className="text-sm text-gray-500 mt-1">Coba ubah kata kunci atau filter pencarian</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((generus: Generus & any) => (
            <div key={generus.id_generus} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full bg-primary-container text-white text-[11px] font-semibold">
                  {generus.rombel?.nama_rombel || 'Tanpa Rombel'}
                </span>
                <span className="text-[11px] text-gray-400 font-medium">
                  {generus.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0">
                  {generus.nama_generus.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{generus.nama_generus}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Icon name="location_on" size={14} className="text-primary" />
                    {generus.kelompok?.nama_kelompok || '-'}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg mb-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Tanggal Lahir</span>
                  <span className="font-semibold text-gray-900 text-xs">
                    {new Date(generus.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PublicLayout>
  );
}
