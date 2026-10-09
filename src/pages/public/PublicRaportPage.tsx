import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Spinner } from '../../components/ui/Spinner';
import { Combobox } from '../../components/ui/Combobox';
import { Icon } from '../../components/ui/Icon';
import { SEMESTER_LIST } from '../../utils/constants';

export default function PublicRaportPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: d } = await supabase.from('laporan_raport').select(`
        *,
        generus!inner(nama_generus, jenis_kelamin, rombel(nama_rombel)),
        detail_raport(
          nilai_raport,
          target_raport(nama_target, jumlah_target, satuan_target, semester)
        )
      `);
      setData(d || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = data.filter((l) => {
    const matchSearch = l.generus?.nama_generus.toLowerCase().includes(search.toLowerCase());
    const matchSem = !filterSemester || l.detail_raport?.some((d: any) =>
      d.target_raport?.semester === filterSemester
    );
    return matchSearch && matchSem;
  });

  const semesterOptions = SEMESTER_LIST.map((s) => ({ value: s, label: `Semester ${s}` }));

  const getPredikat = (rata: number) => {
    if (rata >= 93) return { label: 'Luar Biasa (A+)', cls: 'bg-secondary-container text-gray-900' };
    if (rata >= 85) return { label: 'Sangat Baik (A)', cls: 'bg-primary-fixed text-primary' };
    if (rata >= 75) return { label: 'Baik (B)', cls: 'bg-gray-100 text-gray-700' };
    return { label: 'Cukup (C)', cls: 'bg-error-container text-error' };
  };

  if (loading) {
    return <PublicLayout><div className="flex justify-center p-12"><Spinner size="lg" /></div></PublicLayout>;
  }

  return (
    <PublicLayout>
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <span className="inline-flex px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary text-[11px] font-semibold uppercase tracking-wider">
              Portal Wali & Publik
            </span>
            <h1 className="text-xl lg:text-2xl font-extrabold text-gray-900 mt-2">Ringkasan E-Raport Semester</h1>
            <p className="text-sm text-gray-500 mt-1">Evaluasi holistik capaian kurikulum & 6 Karakter Luhur.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon name="search" size={18} />
            </span>
            <input
              className="w-full bg-gray-50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ketik Nama generus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Combobox options={semesterOptions} value={filterSemester} onChange={setFilterSemester} placeholder="Filter Semester" />
        </div>
      </div>

      {data.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Raport Terbit', value: data.length, icon: 'assignment_turned_in', bg: 'bg-primary-fixed text-primary' },
            { label: 'Terverifikasi', value: '100%', icon: 'verified', bg: 'bg-secondary-container text-gray-900' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                <Icon name={s.icon} size={20} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
            <Icon name="school" size={32} />
          </div>
          <p className="font-semibold text-gray-900">
            {data.length === 0 ? 'Belum ada data raport' : 'Tidak ada hasil'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Raport semester akan tampil di sini setelah diterbitkan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((l) => {
            const details = l.detail_raport || [];
            const totalNilai = details.reduce((sum: number, d: any) => sum + Number(d.nilai_raport || 0), 0);
            const totalMaks = details.reduce((sum: number, d: any) => sum + Number(d.target_raport?.jumlah_target || 0), 0);
            const rata = totalMaks > 0 ? Math.round((totalNilai / totalMaks) * 100) : 0;
            const predikat = getPredikat(rata);

            return (
              <div key={l.id_laporan_raport} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col border border-gray-100">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {l.generus?.nama_generus?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{l.generus?.nama_generus}</h3>
                      <p className="text-[11px] text-gray-500">{l.generus?.rombel?.nama_rombel || '-'}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 shrink-0 ${predikat.cls}`}>
                    {predikat.label}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 space-y-2 mb-4">
                  {details.slice(0, 3).map((d: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700 font-medium truncate">{d.target_raport?.nama_target}</span>
                        <span className="text-primary font-bold shrink-0 ml-2">{d.nilai_raport}/{d.target_raport?.jumlah_target}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${d.target_raport?.jumlah_target ? Math.min((d.nilai_raport / d.target_raport.jumlah_target) * 100, 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {details.length === 0 && <p className="text-xs text-gray-400">Tidak ada detail nilai</p>}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                  <span className="text-xs text-gray-500">Rata-rata</span>
                  <span className="text-lg font-extrabold text-primary">{rata}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PublicLayout>
  );
}
