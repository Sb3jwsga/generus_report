import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Generus, TargetRaport, SemesterConfig } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Combobox } from '../../components/ui/Combobox';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Icon } from '../../components/ui/Icon';
import { SEMESTER_LIST } from '../../utils/constants';

export default function FormLaporanRaportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialGenerusId = searchParams.get('generusId') || searchParams.get('id') || '';

  const [generusList, setGenerusList] = useState<Generus[]>([]);
  const [selectedGenerusId, setSelectedGenerusId] = useState(initialGenerusId);
  const [selectedSemester, setSelectedSemester] = useState(SEMESTER_LIST[0]);
  const [selectedTahun, setSelectedTahun] = useState(new Date().getFullYear().toString());
  const [semesterConfigList, setSemesterConfigList] = useState<SemesterConfig[]>([]);
  const [existingLaporanId, setExistingLaporanId] = useState<string | null>(null);
  const [targets, setTargets] = useState<TargetRaport[]>([]);
  const [nilaiValues, setNilaiValues] = useState<{ [key: string]: number }>({});
  const [catatanText, setCatatanText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id_kelompok) return;
    supabase.from('generus').select('*').eq('id_kelompok', user.id_kelompok).order('nama_generus').then(({ data }) => {
      setGenerusList(data || []);
    });
  }, [user]);

  useEffect(() => {
    supabase.from('semester_config').select('*').order('tahun_ajaran', { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) {
        setSemesterConfigList(data);
        setSelectedTahun(data[0].tahun_ajaran);

        const currentBulan = new Date().getMonth() + 1;
        const sem = (currentBulan >= data[0].ganjil_bulan_awal && currentBulan <= data[0].ganjil_bulan_akhir)
          ? 'Ganjil' : 'Genap';
        setSelectedSemester(sem);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedGenerusId || !selectedSemester || !selectedTahun) {
      setTargets([]);
      setExistingLaporanId(null);
      setNilaiValues({});
      setCatatanText('');
      return;
    }
    const g = generusList.find((s) => s.id_generus === selectedGenerusId);
    if (g?.id_rombel) {
      const fetchTargetsAndCheckExisting = async () => {
        const { data: targetData } = await supabase.from('target_raport').select('*')
          .eq('id_rombel', g.id_rombel)
          .eq('semester', selectedSemester);
        setTargets(targetData || []);

        if (!targetData || targetData.length === 0) {
          setExistingLaporanId(null);
          setNilaiValues({});
          return;
        }

        // Cek duplikat di laporan_raport pakai semester+tahun_ajaran+id_santri
        const { data: existing } = await supabase
          .from('laporan_raport')
          .select('id_laporan_raport, id_catatan_raport, catatan_raport(id_catatan_raport, catatan_raport)')
          .eq('id_santri', selectedGenerusId)
          .eq('semester', selectedSemester)
          .eq('tahun_ajaran', selectedTahun)
          .maybeSingle();

        if (existing) {
          setExistingLaporanId(existing.id_laporan_raport);
          const existingCatatan: any = (existing as any).catatan_raport;
          setCatatanText(existingCatatan?.catatan_raport || '');

          const { data: detailData } = await supabase
            .from('detail_raport')
            .select('id_target, nilai_raport')
            .eq('id_laporan_raport', existing.id_laporan_raport);

          const initialValues: { [key: string]: number } = {};
          detailData?.forEach((d) => {
            initialValues[d.id_target] = d.nilai_raport;
          });
          setNilaiValues(initialValues);
        } else {
          setExistingLaporanId(null);
          setNilaiValues({});
          setCatatanText('');
        }
      };

      fetchTargetsAndCheckExisting();
    } else {
      setTargets([]);
      setExistingLaporanId(null);
    }
  }, [selectedGenerusId, selectedSemester, selectedTahun, generusList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGenerusId || targets.length === 0) return;
    setLoading(true);
    setError('');

    const saveCatatanRaport = async (existingCatatanId?: string | null) => {
      if (!catatanText.trim()) return existingCatatanId || null;
      if (existingCatatanId) {
        const { error } = await supabase.from('catatan_raport').update({
          catatan_raport: catatanText.trim(),
        }).eq('id_catatan_raport', existingCatatanId);
        if (error) throw error;
        return existingCatatanId;
      }
      const { data, error } = await supabase.from('catatan_raport').insert({
        catatan_raport: catatanText.trim(),
      }).select().single();
      if (error) throw error;
      return data.id_catatan_raport;
    };

    try {
      if (existingLaporanId) {
        const { data: currentLaporan } = await supabase.from('laporan_raport').select('id_catatan_raport').eq('id_laporan_raport', existingLaporanId).single();
        const catatanId = await saveCatatanRaport((currentLaporan as any)?.id_catatan_raport || null);

        await supabase.from('detail_raport').delete().eq('id_laporan_raport', existingLaporanId);

        const details = targets.map((t) => ({
          id_laporan_raport: existingLaporanId,
          id_target: t.id_target_raport,
          nilai_raport: nilaiValues[t.id_target_raport] || 0,
        }));
        const { error: errDetail } = await supabase.from('detail_raport').insert(details);
        if (errDetail) throw errDetail;

        const { error: errLaporan } = await supabase.from('laporan_raport').update({
          id_catatan_raport: catatanId,
        }).eq('id_laporan_raport', existingLaporanId);
        if (errLaporan) throw errLaporan;

        navigate('/pengurus/laporan-raport');
      } else {
        const catatanId = await saveCatatanRaport(null);

        const { data: laporan, error: errLaporan } = await supabase.from('laporan_raport').insert({
          id_santri: selectedGenerusId,
          semester: selectedSemester,
          tahun_ajaran: selectedTahun,
          id_catatan_raport: catatanId,
        }).select().single();

        if (errLaporan || !laporan) {
          if ((errLaporan as any)?.code === '23505') {
            throw new Error(`Raport ${selectedSemester} ${selectedTahun} untuk generus ini sudah ada.`);
          }
          throw errLaporan || new Error('Gagal menyimpan raport. Coba lagi.');
        }

        const details = targets.map((t) => ({
          id_laporan_raport: laporan.id_laporan_raport,
          id_target: t.id_target_raport,
          nilai_raport: nilaiValues[t.id_target_raport] || 0,
        }));
        const { error: errDetail } = await supabase.from('detail_raport').insert(details);
        if (errDetail) throw errDetail;
        navigate('/pengurus/laporan-raport');
      }
    } catch (err: any) {
      setError(`Gagal menyimpan: ${err.message || 'Coba lagi.'}`);
      setLoading(false);
    }
  };

  const generusOptions = generusList.map((s) => ({ value: s.id_generus, label: s.nama_generus }));
  const semesterOptions = SEMESTER_LIST.map((s) => ({ value: s, label: `Semester ${s}` }));
  const tahunOptions = semesterConfigList.map((c) => ({ value: c.tahun_ajaran, label: c.tahun_ajaran }));
  const activeConfig = semesterConfigList.find((c) => c.tahun_ajaran === selectedTahun) || semesterConfigList[0];
  const filledCount = targets.filter((t) => (nilaiValues[t.id_target_raport] ?? 0) > 0).length;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/pengurus/laporan-raport')}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-semibold mb-4"
        >
          <Icon name="arrow_back" size={16} /> Kembali ke Laporan Raport
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-secondary-container text-gray-900 flex items-center justify-center shrink-0">
                <Icon name={existingLaporanId ? 'edit_note' : 'school'} size={24} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">
                  {existingLaporanId ? 'Edit Laporan Raport' : 'Input Laporan Raport'}
                </h1>
                <p className="text-sm text-gray-500">Nilai capaian semester per target rombel</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pilih Generus</label>
              <Combobox options={generusOptions} value={selectedGenerusId} onChange={setSelectedGenerusId} placeholder="Pilih Generus" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Semester</label>
                <Combobox options={semesterOptions} value={selectedSemester} onChange={setSelectedSemester} placeholder="Pilih Semester" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tahun Ajaran</label>
                <Combobox options={tahunOptions} value={selectedTahun} onChange={setSelectedTahun} placeholder="Pilih Tahun Ajaran" />
                {activeConfig && (
                  <p className="text-xs text-gray-500 mt-1">
                    Ganjil: {activeConfig.ganjil_bulan_awal}-{activeConfig.ganjil_bulan_akhir} • Genap: {activeConfig.genap_bulan_awal}-{activeConfig.genap_bulan_akhir}
                  </p>
                )}
              </div>
            </div>

            {selectedGenerusId && existingLaporanId && (
              <div className="flex items-start gap-2 p-3.5 bg-primary-container/10 text-primary rounded-xl text-sm font-medium">
                <Icon name="info" size={18} className="shrink-0 mt-0.5" />
                <span>
                  Generus ini sudah dilaporkan untuk <strong>{selectedSemester} {selectedTahun}</strong>. Form otomatis beralih ke mode <strong>Edit Raport</strong>.
                </span>
              </div>
            )}

            {selectedGenerusId && selectedSemester && targets.length === 0 && (
              <div className="flex items-start gap-2 p-4 bg-secondary-container/30 text-gray-800 rounded-xl text-sm">
                <Icon name="info" size={18} className="shrink-0 mt-0.5" />
                <span>
                  Tidak ada target raport untuk rombel generus ini di semester <strong>{selectedSemester}</strong>.
                  Hubungi admin untuk menambah target.
                </span>
              </div>
            )}

            {targets.length > 0 && (
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Isi Nilai Raport</h3>
                  <span className="text-xs font-semibold text-primary bg-primary-container/10 px-2.5 py-1 rounded-full">
                    {filledCount}/{targets.length} terisi
                  </span>
                </div>
                {targets.map((t, i) => (
                  <div key={t.id_target_raport} className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-400">TARGET {i + 1}</p>
                      <p className="font-bold text-gray-900 truncate">{t.nama_target}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Maks: {t.jumlah_target} {t.satuan_target}</p>
                    </div>
                    <div className="w-28 shrink-0">
                      <Input
                        type="number"
                        min={0}
                        max={Number(t.jumlah_target)}
                        value={nilaiValues[t.id_target_raport] ?? ''}
                        onChange={(e) => setNilaiValues({ ...nilaiValues, [t.id_target_raport]: Number(e.target.value) })}
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
                <h3 className="font-bold text-gray-900">Catatan Raport</h3>
                <div>
                  <textarea
                    value={catatanText}
                    onChange={(e) => setCatatanText(e.target.value)}
                    placeholder="Tulis catatan raport untuk generus ini (opsional)..."
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
              <Button variant="outline" type="button" onClick={() => navigate('/pengurus/laporan-raport')}>
                Batal
              </Button>
              <Button type="submit" disabled={loading || targets.length === 0}>
                <Icon name="save" size={18} /> {loading ? 'Menyimpan...' : existingLaporanId ? 'Simpan Perubahan' : 'Simpan Raport'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
