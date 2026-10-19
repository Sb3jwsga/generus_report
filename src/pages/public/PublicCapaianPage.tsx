import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Spinner } from '../../components/ui/Spinner';
import { Combobox } from '../../components/ui/Combobox';
import { Icon } from '../../components/ui/Icon';
import { Modal } from '../../components/ui/Modal';
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

  // Detail Modal State
  const [selectedLaporan, setSelectedLaporan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: d } = await supabase.from('laporan_bulanan').select(`
        *,
        generus!inner(nama_generus, jenis_kelamin, rombel(nama_rombel), kelompok(nama_kelompok, desa(nama_desa))),
        detail_laporan_bulanan(
          jumlah_capaian,
          target_bulanan(nama_target, jumlah_target, satuan_target, bulan_target)
        ),
        catatan(catatan, category_catatan(nama_category))
      `);
      setData(d || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const tahunOptions = [...new Set(data.map((l) => (l.tanggal_laporan || '').slice(0, 4)).filter(Boolean))].sort().reverse().map((t) => ({ value: t, label: t }));
  const rombelOptions = [...new Set(data.map((l) => l.generus?.rombel?.nama_rombel).filter(Boolean))].map((r) => ({ value: r, label: r }));
  const desaOptions = [...new Set(data.map((l) => l.generus?.kelompok?.desa?.nama_desa).filter(Boolean))].map((d) => ({ value: d, label: d }));
  const kelompokOptions = [...new Set(
    data
      .filter((l) => !filterDesa || l.generus?.kelompok?.desa?.nama_desa === filterDesa)
      .map((l) => l.generus?.kelompok?.nama_kelompok)
      .filter(Boolean)
  )].map((k) => ({ value: k, label: k }));

  const filtered = data.filter((l) => {
    const matchSearch = (l.generus?.nama_generus || '').toLowerCase().includes(search.toLowerCase());
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

  const openDetail = (l: any) => {
    setSelectedLaporan(l);
    setIsModalOpen(true);
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
          <Combobox
            options={desaOptions}
            value={filterDesa}
            onChange={(desa) => {
              setFilterDesa(desa);
              setFilterKelompok('');
            }}
            placeholder="Filter Desa"
          />
          <Combobox options={kelompokOptions} value={filterKelompok} onChange={setFilterKelompok} placeholder="Filter Kelompok" />
          <Combobox options={rombelOptions} value={filterRombel} onChange={setFilterRombel} placeholder="Filter Rombel" />
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="overflow-auto max-h-[70vh] lg:overflow-visible lg:max-h-none">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="sticky top-0 lg:top-[7.5rem] z-30 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">Nama Generus</th>
                  <th className="px-4 py-3 text-left">Kelompok</th>
                  <th className="px-4 py-3 text-left">Rombel</th>
                  <th className="px-4 py-3 text-center">Persentase Kehadiran</th>
                  <th className="px-4 py-3 text-center">Persentase Pencapaian</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
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
                    <tr
                      key={l.id_laporan}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group/row"
                      onClick={() => openDetail(l)}
                    >
                      <td className="px-4 py-3.5 text-gray-400 font-bold">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {l.generus?.nama_generus?.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block leading-tight group-hover/row:text-primary transition-colors">{l.generus?.nama_generus}</span>
                            <span className="text-[11px] text-gray-400">{l.generus?.jenis_kelamin}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600">
                        <div>{l.generus?.kelompok?.nama_kelompok || '-'}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{l.generus?.kelompok?.desa?.nama_desa}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {l.generus?.rombel?.nama_rombel || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                          pctHadir >= 80 ? 'bg-green-100 text-green-700' : pctHadir >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {pctHadir}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          pctTarget >= 85 ? 'bg-secondary-container text-gray-900' : pctTarget >= 60 ? 'bg-blue-50 text-primary' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {pctTarget}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => openDetail(l)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors shadow-sm"
                        >
                          <Icon name="visibility" size={16} /> Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detail Capaian Generus"
        subtitle={selectedLaporan?.generus?.nama_generus}
        icon="assessment"
        size="lg"
      >
        {selectedLaporan && (
          <div className="space-y-6">
            {/* Kehadiran */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Icon name="calendar_month" size={16} className="text-primary" />
                Ringkasan Kehadiran
              </h4>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 rounded-lg bg-white shadow-sm border border-gray-100">
                  <p className="text-[10px] text-gray-500 uppercase">Hadir</p>
                  <p className="text-lg font-bold text-green-600">{selectedLaporan.jumlah_hadir || 0}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white shadow-sm border border-gray-100">
                  <p className="text-[10px] text-gray-500 uppercase">Izin</p>
                  <p className="text-lg font-bold text-blue-600">{selectedLaporan.jumlah_izin || 0}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white shadow-sm border border-gray-100">
                  <p className="text-[10px] text-gray-500 uppercase">Sakit</p>
                  <p className="text-lg font-bold text-yellow-600">{selectedLaporan.jumlah_sakit || 0}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white shadow-sm border border-gray-100">
                  <p className="text-[10px] text-gray-500 uppercase">Alfa</p>
                  <p className="text-lg font-bold text-red-600">{selectedLaporan.jumlah_alfa || 0}</p>
                </div>
              </div>
            </div>

            {/* Capaian Target */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Icon name="flag" size={16} className="text-primary" />
                Capaian Target Bulanan
              </h4>
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-bold text-gray-500 uppercase">Target</th>
                      <th className="px-4 py-2 text-center font-bold text-gray-500 uppercase">Capaian</th>
                      <th className="px-4 py-2 text-center font-bold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(selectedLaporan.detail_laporan_bulanan || []).map((d: any, i: number) => {
                      const cap = Number(d.jumlah_capaian || 0);
                      const tar = Number(d.target_bulanan?.jumlah_target || 0);
                      const pct = tar > 0 ? Math.round((cap / tar) * 100) : 0;
                      return (
                        <tr key={i}>
                          <td className="px-4 py-3">
                            <p className="font-bold text-gray-900">{d.target_bulanan?.nama_target}</p>
                            <p className="text-[10px] text-gray-400">Bulan: {d.target_bulanan?.bulan_target}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold text-gray-900">{cap}</span>
                            <span className="text-gray-400"> / {tar} {d.target_bulanan?.satuan_target}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pct >= 100 ? 'bg-green-100 text-green-700' : pct > 0 ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Catatan */}
            <div className="bg-primary-container/5 rounded-xl p-4 border border-primary-container/20">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Icon name="comment" size={16} className="text-primary" />
                Catatan Perkembangan
              </h4>
              {selectedLaporan.catatan ? (
                <div className="space-y-2">
                  {selectedLaporan.catatan.category_catatan && (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-container text-gray-900 uppercase">
                      {selectedLaporan.catatan.category_catatan.nama_category}
                    </span>
                  )}
                  <p className="text-sm text-gray-700 italic leading-relaxed">
                    "{selectedLaporan.catatan.catatan || 'Tidak ada isi catatan.'}"
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Tidak ada catatan.</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PublicLayout>
  );
}
