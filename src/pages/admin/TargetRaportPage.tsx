import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import type { Rombel } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Combobox } from '../../components/ui/Combobox';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Icon } from '../../components/ui/Icon';
import { SEMESTER_LIST } from '../../utils/constants';

export default function TargetRaportPage() {
  const [data, setData] = useState<any[]>([]);
  const [rombelList, setRombelList] = useState<Rombel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nama_target: '',
    jumlah_target: '',
    satuan_target: '',
    semester: 'Ganjil',
    id_rombel: '',
  });

  const resetForm = () => {
    setForm({ nama_target: '', jumlah_target: '', satuan_target: '', semester: 'Ganjil', id_rombel: '' });
    setEditingId(null);
    setFormError('');
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (t: any) => {
    setEditingId(t.id_target_raport);
    setForm({
      nama_target: t.nama_target,
      jumlah_target: String(t.jumlah_target),
      satuan_target: t.satuan_target || '',
      semester: t.semester,
      id_rombel: t.id_rombel || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const fetchData = async () => {
    const { data: d } = await supabase.from('target_raport').select('*, rombel(nama_rombel)').order('semester');
    const { data: r } = await supabase.from('rombel').select('*').order('nama_rombel');
    setData(d || []);
    setRombelList(r || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!form.nama_target || !form.jumlah_target || !form.id_rombel) return;
    setSaving(true);
    setFormError('');
    const payload = {
      nama_target: form.nama_target,
      jumlah_target: Number(form.jumlah_target),
      satuan_target: form.satuan_target || 'kali',
      semester: form.semester,
      id_rombel: form.id_rombel,
    };
    let error = null;
    if (editingId) {
      const res = await supabase.from('target_raport').update(payload).eq('id_target_raport', editingId);
      error = res.error;
    } else {
      const res = await supabase.from('target_raport').insert(payload);
      error = res.error;
    }
    setSaving(false);
    if (error) {
      setFormError(`Gagal menyimpan: ${error.message}`);
      return;
    }
    resetForm();
    setShowModal(false);
    fetchData();
  };

  const rombelOptions = rombelList.map((r) => ({ value: r.id_rombel, label: r.nama_rombel }));
  const semesterOptions = SEMESTER_LIST.map((s) => ({ value: s, label: `Semester ${s}` }));

  const filtered = data.filter((t) => {
    const matchSearch = t.nama_target.toLowerCase().includes(search.toLowerCase());
    const matchSem = !filterSemester || t.semester === filterSemester;
    return matchSearch && matchSem;
  });

  return (
    <DashboardLayout>
      <PageHeader
        badge="Target"
        title="Target Raport"
        description={`${data.length} target raport per rombel per semester.`}
        action={
          <Button onClick={openCreate}>
            <Icon name="add" size={18} /> Tambah Target
          </Button>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon name="search" size={18} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari target..."
              className="w-full rounded-lg bg-gray-50 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Combobox options={semesterOptions} value={filterSemester} onChange={setFilterSemester} placeholder="Filter Semester" />
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-4"><EmptyState icon="grade" title="Belum ada target" description="Tambah target baru atau ubah filter." /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {filtered.map((t) => (
              <div key={t.id_target_raport} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{t.nama_target}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold">
                        {t.jumlah_target} {t.satuan_target}
                      </span>
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-secondary-container text-gray-900 text-[11px] font-bold">
                        {t.semester}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                        <Icon name="school" size={13} /> {t.rombel?.nama_rombel || '-'}
                      </span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(t)}
                      className="p-2 rounded-lg text-primary hover:bg-primary-container/10 transition-colors"
                      title="Edit"
                    >
                      <Icon name="edit" size={18} />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Hapus target "${t.nama_target}"?`)) {
                          await supabase.from('target_raport').delete().eq('id_target_raport', t.id_target_raport);
                          fetchData();
                        }
                      }}
                      className="p-2 rounded-lg text-gray-400 hover:text-error hover:bg-error-container/50 transition-colors"
                      title="Hapus"
                    >
                      <Icon name="delete" size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? 'Edit Target Raport' : 'Tambah Target Raport'} subtitle={editingId ? 'Perbarui target penilaian' : 'Target penilaian per semester'} icon="grade">
        <div className="space-y-4">
          <Input label="Nama Target" value={form.nama_target} onChange={(e) => setForm({ ...form, nama_target: e.target.value })} placeholder="Misal: Hafalan Juz 30" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Jumlah Target" type="number" value={form.jumlah_target} onChange={(e) => setForm({ ...form, jumlah_target: e.target.value })} placeholder="0" />
            <Input label="Satuan" value={form.satuan_target} onChange={(e) => setForm({ ...form, satuan_target: e.target.value })} placeholder="nilai, juz" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Semester</label>
            <Combobox options={semesterOptions} value={form.semester} onChange={(val) => setForm({ ...form, semester: val })} placeholder="Pilih Semester" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rombel</label>
            <Combobox options={rombelOptions} value={form.id_rombel} onChange={(val) => setForm({ ...form, id_rombel: val })} placeholder="Pilih Rombel" />
          </div>
          {formError && (
            <div className="flex items-start gap-2 p-3 bg-error-container/50 text-error text-sm rounded-lg font-medium">
              <Icon name="error" size={18} /> {formError}
            </div>
          )}
        </div>
        <div className="mt-5 flex gap-2 justify-end">
          <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>Batal</Button>
          <Button onClick={handleCreate} disabled={saving}>
            <Icon name="save" size={18} /> {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
