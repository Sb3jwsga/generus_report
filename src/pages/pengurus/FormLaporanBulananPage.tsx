import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Generus, TargetBulanan, CategoryCatatan } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Combobox } from '../../components/ui/Combobox';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Icon } from '../../components/ui/Icon';
import { BULAN_LIST } from '../../utils/constants';

export default function FormLaporanBulananPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialGenerusId = searchParams.get('generusId') || searchParams.get('id') || '';
  const search = searchParams.get('search') || '';
  const rombel = searchParams.get('rombel') || '';

  const [generusList, setGenerusList] = useState<Generus[]>([]);
  const [selectedGenerusId, setSelectedGenerusId] = useState(initialGenerusId);
  const [existingLaporanId, setExistingLaporanId] = useState<string | null>(null);
  const [targets, setTargets] = useState<TargetBulanan[]>([]);
  const [capaianValues, setCapaianValues] = useState<{ [key: string]: number }>({});
  const [kehadiran, setKehadiran] = useState({ jumlah_hadir: '', jumlah_izin: '', jumlah_sakit: '', jumlah_alfa: '' });
  const [categoryList, setCategoryList] = useState<CategoryCatatan[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [catatanText, setCatatanText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentMonth = BULAN_LIST[new Date().getMonth()];

  useEffect(() => {
    if (!user?.id_kelompok) return;
    supabase.from('generus').select('*').eq('id_kelompok', user.id_kelompok).order('nama_generus').then(({ data }) => {
      setGenerusList(data || []);
    });
    supabase.from('category_catatan').select('*').order('nama_category').then(({ data }) => {
      setCategoryList(data || []);
    });
  }, [user]);

  useEffect(() => {
    if (!selectedGenerusId) {
      setTargets([]);
      setExistingLaporanId(null);
      setCapaianValues({});
      return;
    }
    const g = generusList.find((s) => s.id_generus === selectedGenerusId);
    if (g?.id_rombel) {
      // 1. Fetch targets for current month
      supabase.from('target_bulanan').select('*')
        .eq('id_rombel', g.id_rombel)
        .eq('bulan_target', currentMonth)
        .then(async ({ data: targetData }) => {
          setTargets(targetData || []);

          // 2. Check if already reported (any month, not just current)
          const { data: laporanData } = await supabase
            .from('laporan_bulanan')
            .select('id_laporan, tanggal_laporan, jumlah_hadir, jumlah_izin, jumlah_sakit, jumlah_alfa, id_catatan, catatan(id_catatan, id_category, catatan)')
            .eq('id_santri', selectedGenerusId)
            .maybeSingle();

          if (laporanData) {
            setExistingLaporanId(laporanData.id_laporan);
            setKehadiran({
              jumlah_hadir: laporanData.jumlah_hadir?.toString() || '',
              jumlah_izin: laporanData.jumlah_izin?.toString() || '',
              jumlah_sakit: laporanData.jumlah_sakit?.toString() || '',
              jumlah_alfa: laporanData.jumlah_alfa?.toString() || '',
            });
            const existingCatatan: any = (laporanData as any).catatan;
            setSelectedCategory(existingCatatan?.id_category || '');
            setCatatanText(existingCatatan?.catatan || '');

            // Fetch existing details to prepopulate values
            const { data: detailData } = await supabase
              .from('detail_laporan_bulanan')
              .select('id_target, jumlah_capaian')
              .eq('id_laporan', laporanData.id_laporan);

            const initialValues: { [key: string]: number } = {};
            detailData?.forEach((d) => {
              initialValues[d.id_target] = d.jumlah_capaian;
            });
            setCapaianValues(initialValues);
          }           else {
            setExistingLaporanId(null);
            setKehadiran({ jumlah_hadir: '', jumlah_izin: '', jumlah_sakit: '', jumlah_alfa: '' });
            setSelectedCategory('');
            setCatatanText('');
            setCapaianValues({});
          }
        });
    } else {
      setTargets([]);
      setExistingLaporanId(null);
    }
  }, [selectedGenerusId, generusList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGenerusId || targets.length === 0) return;
    setLoading(true);
    setError('');

    const saveCatatan = async (existingCatatanId?: string | null) => {
      if (!selectedCategory && !catatanText.trim()) return existingCatatanId || null;
      if (existingCatatanId) {
        const { error } = await supabase.from('catatan').update({
          id_category: selectedCategory || null,
          catatan: catatanText.trim(),
        }).eq('id_catatan', existingCatatanId);
        if (error) throw error;
        return existingCatatanId;
      }
      const { data, error } = await supabase.from('catatan').insert({
        id_category: selectedCategory || null,
        catatan: catatanText.trim(),
      }).select().single();
      if (error) throw error;
      return data.id_catatan;
    };

    try {
      if (existingLaporanId) {
        const { data: currentLaporan } = await supabase.from('laporan_bulanan').select('id_catatan').eq('id_laporan', existingLaporanId).single();
        const catatanId = await saveCatatan((currentLaporan as any)?.id_catatan || null);

        await supabase.from('detail_laporan_bulanan').delete().eq('id_laporan', existingLaporanId);

        const details = targets.map((t) => ({
          id_laporan: existingLaporanId,
          id_target: t.id_target_bulan,
          jumlah_capaian: capaianValues[t.id_target_bulan] || 0,
        }));

        const { error: errDetail } = await supabase.from('detail_laporan_bulanan').insert(details);
        if (errDetail) throw errDetail;

        const { error: errLaporan } = await supabase.from('laporan_bulanan').update({
          jumlah_hadir: Number(kehadiran.jumlah_hadir) || 0,
          jumlah_izin: Number(kehadiran.jumlah_izin) || 0,
          jumlah_sakit: Number(kehadiran.jumlah_sakit) || 0,
          jumlah_alfa: Number(kehadiran.jumlah_alfa) || 0,
          id_catatan: catatanId,
        }).eq('id_laporan', existingLaporanId);

        if (errLaporan) throw errLaporan;
        navigate(`/pengurus/laporan-bulanan?search=${encodeURIComponent(search)}&rombel=${rombel}`);
      } else {
        const catatanId = await saveCatatan(null);

        const { data: laporan, error: errLaporan } = await supabase.from('laporan_bulanan').insert({
          id_santri: selectedGenerusId,
          tanggal_laporan: new Date().toISOString().split('T')[0],
          jumlah_hadir: Number(kehadiran.jumlah_hadir) || 0,
          jumlah_izin: Number(kehadiran.jumlah_izin) || 0,
          jumlah_sakit: Number(kehadiran.jumlah_sakit) || 0,
          jumlah_alfa: Number(kehadiran.jumlah_alfa) || 0,
          id_catatan: catatanId,
        }).select().single();

        if (errLaporan || !laporan) throw errLaporan || new Error('Gagal menyimpan laporan');

        const details = targets.map((t) => ({
          id_laporan: laporan.id_laporan,
          id_target: t.id_target_bulan,
          jumlah_capaian: capaianValues[t.id_target_bulan] || 0,
        }));
        const { error: errDetail } = await supabase.from('detail_laporan_bulanan').insert(details);
        if (errDetail) throw errDetail;
        navigate(`/pengurus/laporan-bulanan?search=${encodeURIComponent(search)}&rombel=${rombel}`);
      }
    } catch (err: any) {
      setError(`Gagal menyimpan: ${err.message || 'Coba lagi.'}`);
      setLoading(false);
    }
  };

  const generusOptions = generusList.map((s) => ({ value: s.id_generus, label: s.nama_generus }));
  const categoryOptions = categoryList.map((c) => ({ value: c.id_category, label: c.nama_category }));
  const selectedGenerus = generusList.find((s) => s.id_generus === selectedGenerusId);
  const filledCount = targets.filter((t) => (capaianValues[t.id_target_bulan] ?? 0) > 0).length;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/pengurus/laporan-bulanan')}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-semibold mb-4"
        >
          <Icon name="arrow_back" size={16} /> Kembali ke Laporan Bulanan
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
                <Icon name={existingLaporanId ? "edit_note" : "post_add"} size={24} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">
                  {existingLaporanId ? 'Edit Laporan Bulanan' : 'Input Laporan Bulanan'}
                </h1>
                <p className="text-sm text-gray-500">
                  Bulan berjalan: <span className="font-bold text-primary">{currentMonth}</span>
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pilih Generus</label>
              <Combobox options={generusOptions} value={selectedGenerusId} onChange={setSelectedGenerusId} placeholder="Pilih Generus" />
            </div>

            {selectedGenerusId && existingLaporanId && (
              <div className="flex items-start gap-2 p-3.5 bg-primary-container/10 text-primary rounded-xl text-sm font-medium">
                <Icon name="info" size={18} className="shrink-0 mt-0.5" />
                <span>
                  Generus ini sudah dilaporkan untuk bulan <strong>{currentMonth}</strong>. Form otomatis beralih ke mode <strong>Edit Laporan</strong>.
                </span>
              </div>
            )}

            {selectedGenerusId && targets.length === 0 && (
              <div className="flex items-start gap-2 p-4 bg-secondary-container/30 text-gray-800 rounded-xl text-sm">
                <Icon name="info" size={18} className="shrink-0 mt-0.5" />
                <span>
                  Tidak ada target untuk rombel <strong>{selectedGenerus?.id_rombel ? 'generus ini' : '(belum ada rombel)'}</strong> di bulan {currentMonth}.
                  Hubungi admin untuk menambah target.
                </span>
              </div>
            )}

            {selectedGenerusId && targets.length > 0 && (
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <h3 className="font-bold text-gray-900">Data Kehadiran</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Input label="Hadir" type="number" min={0} value={kehadiran.jumlah_hadir} onChange={(e) => setKehadiran({ ...kehadiran, jumlah_hadir: e.target.value })} />
                  <Input label="Izin" type="number" min={0} value={kehadiran.jumlah_izin} onChange={(e) => setKehadiran({ ...kehadiran, jumlah_izin: e.target.value })} />
                  <Input label="Sakit" type="number" min={0} value={kehadiran.jumlah_sakit} onChange={(e) => setKehadiran({ ...kehadiran, jumlah_sakit: e.target.value })} />
                  <Input label="Alfa" type="number" min={0} value={kehadiran.jumlah_alfa} onChange={(e) => setKehadiran({ ...kehadiran, jumlah_alfa: e.target.value })} />
                </div>
              </div>
            )}

            {targets.length > 0 && (
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Isi Capaian Target</h3>
                  <span className="text-xs font-semibold text-primary bg-primary-container/10 px-2.5 py-1 rounded-full">
                    {filledCount}/{targets.length} terisi
                  </span>
                </div>
                {targets.map((t, i) => (
                  <div key={t.id_target_bulan} className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-400">TARGET {i + 1}</p>
                      <p className="font-bold text-gray-900 truncate">{t.nama_target}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Target: {t.jumlah_target} {t.satuan_target}</p>
                    </div>
                    <div className="w-28 shrink-0">
                      <Input
                        type="number"
                        min={0}
                        value={capaianValues[t.id_target_bulan] ?? ''}
                        onChange={(e) => setCapaianValues({ ...capaianValues, [t.id_target_bulan]: Number(e.target.value) })}
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedGenerusId && targets.length > 0 && (
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <h3 className="font-bold text-gray-900">Catatan Perkembangan</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori Catatan</label>
                  <Combobox options={categoryOptions} value={selectedCategory} onChange={setSelectedCategory} placeholder="Pilih Kategori Catatan" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Isi Catatan</label>
                  <textarea
                    value={catatanText}
                    onChange={(e) => setCatatanText(e.target.value)}
                    placeholder="Tulis catatan perkembangan generus..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-error-container/50 text-error text-sm rounded-lg font-medium">
                <Icon name="error" size={18} /> {error}
              </div>
            )}

            <div className="pt-2 flex gap-2 justify-end">
              <Button variant="outline" type="button" onClick={() => navigate('/pengurus/laporan-bulanan')}>
                Batal
              </Button>
              <Button type="submit" disabled={loading || targets.length === 0}>
                <Icon name="save" size={18} /> {loading ? 'Menyimpan...' : existingLaporanId ? 'Simpan Perubahan' : 'Simpan Laporan'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
