import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import type { Rombel } from '../../types';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Spinner } from '../../components/ui/Spinner';
import { Combobox } from '../../components/ui/Combobox';
import { Icon } from '../../components/ui/Icon';
import { SEMESTER_LIST } from '../../utils/constants';

export default function PublicMateriPage() {
  const [data, setData] = useState<any[]>([]);
  const [rombelList, setRombelList] = useState<Rombel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRombel, setFilterRombel] = useState('');
  const [filterKategori, setFilterKategori] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [m, r] = await Promise.all([
        supabase.from('materi').select('*, rombel(nama_rombel)'),
        supabase.from('rombel').select('*').order('nama_rombel'),
      ]);
      setData(m.data || []);
      setRombelList(r.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const kategoris = [...new Set(data.map((m) => m.kategori_materi))];

  const filtered = data.filter((m) => {
    const matchSearch = m.nama_materi.toLowerCase().includes(search.toLowerCase());
    const matchRombel = !filterRombel || m.id_rombel === filterRombel;
    const matchKat = !filterKategori || m.kategori_materi === filterKategori;
    return matchSearch && matchRombel && matchKat;
  });

  const kategoriOptions = kategoris.map((k) => ({ value: k, label: k }));

  const grouped = rombelList
    .map((rombel) => ({
      rombel,
      semesters: SEMESTER_LIST
        .map((semester) => ({
          semester,
          items: filtered
            .filter((m) => m.id_rombel === rombel.id_rombel && m.semester === semester)
            .sort((a, b) => a.nama_materi.localeCompare(b.nama_materi)),
        }))
        .filter((semester) => semester.items.length > 0),
    }))
    .filter((group) => group.semesters.length > 0);

  const kategoriIcon = (kat: string) => {
    const lower = kat.toLowerCase();
    if (lower.includes('qur')) return 'menu_book';
    if (lower.includes('hadist') || lower.includes('hadits')) return 'auto_stories';
    if (lower.includes('fiqih') || lower.includes('ibadah') || lower.includes('doa')) return 'mosque';
    if (lower.includes('karakter') || lower.includes('akhlak')) return 'psychology';
    return 'library_books';
  };

  if (loading) {
    return <PublicLayout><div className="flex justify-center p-12"><Spinner size="lg" /></div></PublicLayout>;
  }

  return (
    <PublicLayout>
      <div className="relative w-full rounded-2xl bg-gradient-to-br from-[#1e63b2] to-[#15457f] text-white p-6 lg:p-8 mb-6 overflow-hidden shadow-md">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-gray-900 text-[11px] font-bold w-fit shadow-sm mb-3">
              <Icon name="verified" size={14} />
              Akses Terbuka Generus & Wali
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold">Silabus & Materi Kurikulum</h1>
            <p className="text-sm text-white/80 mt-2 leading-relaxed">
              Akses modul ajar, panduan hafalan, dan silabus kurikulum untuk pendampingan generus di rumah.
            </p>
          </div>
          <div className="flex lg:flex-col gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center gap-3 min-w-[170px]">
              <div className="w-10 h-10 rounded-lg bg-secondary-container text-gray-900 flex items-center justify-center">
                <Icon name="library_books" size={22} />
              </div>
              <div>
                <p className="text-xl font-extrabold leading-tight">{data.length}+</p>
                <p className="text-[11px] text-white/70">Modul Digital</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-6">
          <div className="bg-white rounded-xl shadow-md p-1.5 flex flex-col sm:flex-row gap-1.5">
            <div className="flex-1 flex items-center gap-2 px-3 py-2">
              <Icon name="search" size={20} className="text-gray-400" />
              <input
                className="w-full bg-transparent text-gray-900 text-sm focus:outline-none"
                placeholder="Cari judul materi, topik, atau jilid..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
          <Icon name="filter_list" size={16} />
          Jenjang Rombel:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterRombel('')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              !filterRombel ? 'bg-secondary-container text-gray-900 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
            }`}
          >
            Semua Jenjang
          </button>
          {rombelList.map((r) => (
            <button
              key={r.id_rombel}
              onClick={() => setFilterRombel(filterRombel === r.id_rombel ? '' : r.id_rombel)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filterRombel === r.id_rombel
                  ? 'bg-secondary-container text-gray-900 shadow-sm font-bold'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {r.nama_rombel}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Combobox options={kategoriOptions} value={filterKategori} onChange={setFilterKategori} placeholder="Filter Kategori" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
            <Icon name="menu_book" size={32} />
          </div>
          <p className="font-semibold text-gray-900">
            {data.length === 0 ? 'Belum ada materi' : 'Tidak ada hasil'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Coba ubah filter atau kata kunci pencarian</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ rombel, semesters }) => (
            <section key={rombel.id_rombel} aria-labelledby={`rombel-${rombel.id_rombel}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                  <Icon name="school" size={22} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Rombel</p>
                  <h2 id={`rombel-${rombel.id_rombel}`} className="text-xl font-extrabold text-gray-900">
                    {rombel.nama_rombel}
                  </h2>
                </div>
                <span className="ml-auto rounded-full bg-primary-container/10 px-3 py-1 text-xs font-bold text-primary">
                  {semesters.reduce((total, semester) => total + semester.items.length, 0)} materi
                </span>
              </div>

              <div className="space-y-5 pl-0 lg:pl-[52px]">
                {semesters.map(({ semester, items }) => (
                  <div key={semester} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 lg:p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Icon name="calendar_month" size={20} className="text-primary" />
                      <h3 className="font-bold text-gray-900">Semester {semester}</h3>
                      <span className="text-xs text-gray-500">({items.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {items.map((m) => (
                        <article key={m.id_materi} className="flex gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                          <div className="w-10 h-10 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
                            <Icon name={kategoriIcon(m.kategori_materi)} size={21} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                              {m.kategori_materi}
                            </p>
                            <h4 className="font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors">
                              {m.nama_materi}
                            </h4>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PublicLayout>
  );
}
