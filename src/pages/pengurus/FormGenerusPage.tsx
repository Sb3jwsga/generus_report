import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Rombel } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Combobox } from '../../components/ui/Combobox';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Spinner } from '../../components/ui/Spinner';
import { Icon } from '../../components/ui/Icon';

export default function FormGenerusPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const search = searchParams.get('search') || '';
  const rombel = searchParams.get('rombel') || '';
  const sortKey = searchParams.get('sortKey') as SortKey || 'nama_generus';
  const sortDir = searchParams.get('sortDir') as SortDir || 'asc';
  type SortKey = 'nama_generus' | 'jenis_kelamin' | 'tanggal_lahir' | 'rombel';
  type SortDir = 'asc' | 'desc';
  const isEdit = !!editId;

  const [rombelList, setRombelList] = useState<Rombel[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    nama_generus: '',
    jenis_kelamin: 'Laki-laki',
    tanggal_lahir: '',
    id_rombel: '',
  });

  useEffect(() => {
    supabase.from('rombel').select('*').order('nama_rombel').then(({ data }) => setRombelList(data || []));
  }, []);

  useEffect(() => {
    if (!editId) return;
    supabase.from('generus').select('*').eq('id_generus', editId).single().then(({ data, error }) => {
      if (!error && data) {
        if (user?.id_kelompok && data.id_kelompok !== user.id_kelompok) {
          setFormError('Data ini bukan dari kelompok Anda.');
        } else {
          setForm({
            nama_generus: data.nama_generus,
            jenis_kelamin: data.jenis_kelamin,
            tanggal_lahir: data.tanggal_lahir,
            id_rombel: data.id_rombel || '',
          });
        }
      } else {
        setFormError('Data tidak ditemukan.');
      }
      setLoadingEdit(false);
    });
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_generus || !form.tanggal_lahir) return;
    setSaving(true);
    setFormError('');
    const payload = {
      nama_generus: form.nama_generus.trim(),
      jenis_kelamin: form.jenis_kelamin,
      tanggal_lahir: form.tanggal_lahir,
      id_rombel: form.id_rombel || null,
    };
    let error = null;
    if (isEdit) {
      const res = await supabase.from('generus').update(payload).eq('id_generus', editId);
      error = res.error;
    } else {
      if (!user?.id_kelompok) {
        setFormError('Kelompok Anda tidak terdaftar.');
        setSaving(false);
        return;
      }
      const res = await supabase.from('generus').insert({ ...payload, id_kelompok: user.id_kelompok });
      error = res.error;
    }
    setSaving(false);
    if (error) {
      setFormError(`Gagal menyimpan: ${error.message}`);
      return;
    }
    navigate(`/pengurus/generus?search=${encodeURIComponent(search)}&rombel=${rombel}&sortKey=${sortKey}&sortDir=${sortDir}`);
  };

  const rombelOptions = rombelList.map((r) => ({ value: r.id_rombel, label: r.nama_rombel }));
  const genderOptions = [
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(`/pengurus/generus?search=${encodeURIComponent(search)}&rombel=${rombel}&sortKey=${sortKey}&sortDir=${sortDir}`)}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-semibold mb-4"
        >
          <Icon name="arrow_back" size={16} /> Kembali ke Data Generus
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 pt-6 pb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
              <Icon name={isEdit ? 'edit' : 'person_add'} size={24} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">{isEdit ? 'Edit Generus' : 'Tambah Generus Baru'}</h1>
              <p className="text-sm text-gray-500">{isEdit ? 'Perbarui data generus' : 'Lengkapi data generus untuk alokasi rombel'}</p>
            </div>
          </div>

          {loadingEdit ? (
            <div className="flex justify-center p-12"><Spinner size="lg" /></div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
              <Input
                label="Nama Lengkap"
                value={form.nama_generus}
                onChange={(e) => setForm({ ...form, nama_generus: e.target.value })}
                placeholder="Nama lengkap generus"
                required
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenis Kelamin</label>
                <Combobox options={genderOptions} value={form.jenis_kelamin} onChange={(val) => setForm({ ...form, jenis_kelamin: val })} placeholder="Pilih Jenis Kelamin" />
              </div>
              <Input
                label="Tanggal Lahir"
                type="date"
                value={form.tanggal_lahir}
                onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rombel (Kelas)</label>
                <Combobox options={rombelOptions} value={form.id_rombel} onChange={(val) => setForm({ ...form, id_rombel: val })} placeholder="Pilih Rombel" />
              </div>
              {formError && (
                <div className="flex items-start gap-2 p-3 bg-error-container/50 text-error text-sm rounded-lg font-medium">
                  <Icon name="error" size={18} /> {formError}
                </div>
              )}
              <div className="pt-4 flex gap-2 justify-end">
                <Button variant="outline" type="button" onClick={() => navigate(`/pengurus/generus?search=${encodeURIComponent(search)}&rombel=${rombel}&sortKey=${sortKey}&sortDir=${sortDir}`)}>Batal</Button>
                <Button type="submit" disabled={saving}>
                  <Icon name="save" size={18} /> {saving ? 'Menyimpan...' : isEdit ? 'Update Data' : 'Simpan Data'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
