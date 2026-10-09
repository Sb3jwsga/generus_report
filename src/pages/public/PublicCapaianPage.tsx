import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Spinner } from '../../components/ui/Spinner';
import { Combobox } from '../../components/ui/Combobox';
import { Icon } from '../../components/ui/Icon';
import { BULAN_LIST } from '../../utils/constants';

export default function PublicCapaianPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBulan, setFilterBulan] = useState(BULAN_LIST[new Date().getMonth()]);
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear().toString());
  const [filterRombel, setFilterRombel] = useState('');
  const [filterKelompok, setFilterKelompok] = useState('');
  const [filterDesa, setFilterDesa] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: d } = await supabase.from('laporan_bulanan').select(`
        *,
        generus!inner(nama_generus, jenis_kelamin, rombel(nama_rombel), kelompok(nama_kelompok, desa(nama_desa))),
        detail_laporan_bulanan(
          jumlah_capaian,
          target_bulanan(nama_target, jumlah_target, satuan_target, bulan_target)
        ),
        catatan(category_catatan(nama_category))
      `);
      setData(d || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const tahunOptions = [...new Set(data.map((l) => (l.tanggal_laporan || '').slice(0, 4)).filter(Boolean))].sort().reverse().map((t) => ({ value: t, label: t }));
  const rombelOptions = [...new Set(data.map((l) => l.generus?.rombel?.nama_rombel).filter(Boolean))].map((r) => ({ value: r, label: r }));
  const kelompokOptions = [...new Set(data.map((l) => l.generus?.kelompok?.nama_kelompok).filter(Boolean))].map((k) => ({ value: k, label: k }));
  const desaOptions = [...new Set(data.map((l) => l.generus?.kelompok?.desa?.nama_desa).filter(Boolean))].map((d) => ({ value: d, label: d }));

  const filtered = data.filter((l) => {
    const matchSearch = l.generus?.nama_generus.toLowerCase().includes(search.toLowerCase());
    const matchBulan = !filterBulan || l.detail_laporan_bulanan?.some((d: any) =>
      d.target_bulanan?.bulan_target === filterBulan
    );
    const matchTahun = !filterTahun || (l.tanggal_laporan || '').startsWith(filterTahun);
    const matchRombel = !filterRombel || l.generus?.rombel?.nama_rombel === filterRombel;
    const matchKelompok = !filterKelompok || l.generus?.kelompok?.nama_kelompok === filterKelompok;
    const matchDesa = !filterDesa || l.generus?.kelompok?.desa?.nama_desa === filterDesa;
    return matchSearch && matchBulan && matchTahun && matchRombel && matchKelompok && matchDesa;
  });

  // Calculate stats
  const totalGenerus = filtered.length;
  const avgKehadiran = totalGenerus > 0 
    ? Math.round(filtered.reduce((sum, l) => {
        const h = Number(l.jumlah_hadir || 0);
        const i = Number(l.jumlah_izin || 0);
        const s = Number(l.jumlah_sakit || 0);
        const a = Number(l.jumlah_alfa || 0);
        const total = h + i + s + a;
        return sum + (total > 0 ? (h / total) * 100 : 0);
      }, 0) / totalGenerus) 
    : 0;

  const avgCapaian = totalGenerus > 0 
    ? Math.round(filtered.reduce((sum, l) => {
        const d = l.detail_laporan_bulanan || [];
        const cap = d.reduce((s: number, det: any) => s + Number(det.jumlah_capaian || 0), 0);
        const tar = d.reduce((s: number, det: any) => s + Number(det.target_bulanan?.jumlah_target || 0), 0);
        return sum + (tar > 0 ? (cap / tar) * 100 : 0);
      }, 0) / totalGenerus)
    : 0;

  const catCount: Record<string, number> = {};
  filtered.forEach(l => {
    const cat = l.catatan?.category_catatan?.nama_category;
    if (cat) catCount[cat] = (catCount[cat] || 0) + 1;
  });
  const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const bulanOptions = BULAN_LIST.map((b) => ({ value: b, label: b }));

  const targetColumns: { nama: string; target: number; satuan: string }[] = [];
  const seenTargets = new Set<string>();
  filtered.forEach((l) => {
    (l.detail_laporan_bulanan || []).forEach((d: any) => {
      const nama = d.target_bulanan?.nama_target || 'Tanpa Nama';
      if (!seenTargets.has(nama)) {
        seenTargets.add(nama);
        targetColumns.push({
          nama,
          target: Number(d.target_bulanan?.jumlah_target || 0),
          satuan: d.target_bulanan?.satuan_target || '',
        });
      }
    });
  });

  const renderTargetCell = (l: any, targetName: string) => {
    const detail = (l.detail_laporan_bulanan || []).find((d: any) => d.target_bulanan?.nama_target === targetName);
    if (!detail) return <span className="text-gray-300">-</span>;
    return (
      <span>
        <span className="font-bold text-gray-900">{detail.jumlah_capaian}</span>
        <span className="text-gray-400"> / {detail.target_bulanan?.jumlah_target} {detail.target_bulanan?.satuan_target}</span>
      </span>
    );
  };

  if (loading) {
    return <PublicLayout><div className="flex justify-center p-12"><Spinner size="lg" /></div></PublicLayout>;
  }

  return (
    <PublicLayout>
      <div className="relative bg-gradient-to-r from-[#1e63b2] to-[#15457f] rounded-2xl p-6 lg:p-8 text-white shadow-md overflow-hidden mb-6">
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wide w-fit">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" />
            Kompilasi Data Terverifikasi
          </span>
          <h1 className="text-2xl lg:text-3xl font-extrabold">Capaian Bulanan Generus</h1>
          <p className="text-sm text-white/80 max-w-2xl">
            Transparansi pembinaan karakter, hafalan, dan kemandirian ibadah generus seluruh rombongan belajar.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Icon name="how_to_reg" size={16} /> Generus Tampil
              </div>
              <p className="text-xl font-bold">{totalGenerus}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Icon name="verified" size={16} /> Rata-rata Capaian
              </div>
              <p className="text-xl font-bold">{avgCapaian}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Icon name="calendar_month" size={16} /> Rata-rata Kehadiran
              </div>
              <p className="text-xl font-bold">{avgKehadiran}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Icon name="label" size={16} /> Kategori Catatan Terbanyak
              </div>
              <p className="text-xl font-bold truncate">{topCat}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative lg:col-span-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon name="search" size={18} />
            </span>
            <input
              className="w-full bg-gray-50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Cari nama generus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Combobox options={bulanOptions} value={filterBulan} onChange={setFilterBulan} placeholder="Filter Bulan" />
          <Combobox options={tahunOptions} value={filterTahun} onChange={setFilterTahun} placeholder="Filter Tahun" />
          <Combobox options={rombelOptions} value={filterRombel} onChange={setFilterRombel} placeholder="Filter Rombel" />
          <Combobox options={kelompokOptions} value={filterKelompok} onChange={setFilterKelompok} placeholder="Filter Kelompok" />
          <Combobox options={desaOptions} value={filterDesa} onChange={setFilterDesa} placeholder="Filter Desa" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
            <Icon name="assessment" size={32} />
          </div>
          <p className="font-semibold text-gray-900">
            {data.length === 0 ? 'Belum ada data pencapaian' : 'Tidak ada hasil'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Coba ubah filter bulan atau kata kunci</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm border-separate border-spacing-0">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-20">
                <tr>
                  <th className="px-4 py-3 text-left sticky left-0 bg-gray-50 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">No</th>
                  <th className="px-4 py-3 text-left sticky left-[52px] bg-gray-50 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Nama Generus</th>
                  <th className="px-4 py-3 text-left">Rombel</th>
                  <th className="px-4 py-3 text-left">Kelompok</th>
                  <th className="px-4 py-3 text-left">Desa</th>
                  <th className="px-4 py-3 text-center">Kehadiran (H/I/S/A)</th>
                  <th className="px-4 py-3 text-center">% Kehadiran</th>
                  {targetColumns.map((t) => (
                    <th key={t.nama} className="px-4 py-3 text-center min-w-[130px]">
                      <span className="block">{t.nama}</span>
                      <span className="normal-case font-medium text-[10px]">(Target {t.target} {t.satuan})</span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center">% Capaian</th>
                  <th className="px-4 py-3 text-center">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((l, idx) => {
                  const hadir = Number(l.jumlah_hadir || 0);
                  const izin = Number(l.jumlah_izin || 0);
                  const sakit = Number(l.jumlah_sakit || 0);
                  const alfa = Number(l.jumlah_alfa || 0);
                  const totalAbsensi = hadir + izin + sakit + alfa;
                  const pctHadir = totalAbsensi > 0 ? Math.round((hadir / totalAbsensi) * 100) : 0;

                  const details = l.detail_laporan_bulanan || [];
                  const totalCapaian = details.reduce((sum: number, d: any) => sum + Number(d.jumlah_capaian || 0), 0);
                  const totalTarget = details.reduce((sum: number, d: any) => sum + Number(d.target_bulanan?.jumlah_target || 0), 0);
                  const pctTarget = totalTarget > 0 ? Math.round((totalCapaian / totalTarget) * 100) : 0;

                  return (
                    <tr key={l.id_laporan} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 text-gray-400 font-bold sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{idx + 1}</td>
                      <td className="px-4 py-3.5 sticky left-[52px] bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {l.generus?.nama_generus?.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block leading-tight">{l.generus?.nama_generus}</span>
                            <span className="text-[11px] text-gray-400">{l.generus?.jenis_kelamin}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {l.generus?.rombel?.nama_rombel || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600">{l.generus?.kelompok?.nama_kelompok || '-'}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-600">{l.generus?.kelompok?.desa?.nama_desa || '-'}</td>
                      <td className="px-4 py-3.5 text-center text-xs text-gray-600">
                        <span className="font-semibold text-primary">{hadir}</span> / <span>{izin}</span> / <span>{sakit}</span> / <span className="text-error">{alfa}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                          pctHadir >= 80 ? 'bg-green-100 text-green-700' : pctHadir >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {pctHadir}%
                        </span>
                      </td>
                      {targetColumns.map((t) => (
                        <td key={t.nama} className="px-4 py-3.5 text-center text-xs">
                          {renderTargetCell(l, t.nama)}
                        </td>
                      ))}
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          pctTarget >= 85 ? 'bg-secondary-container text-gray-900' : pctTarget >= 60 ? 'bg-blue-50 text-primary' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {pctTarget}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600 max-w-[200px]">
                        {(l.catatan?.category_catatan?.nama_category) ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            {l.catatan.category_catatan.nama_category}
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
