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

export default function MateriPage() {
  const [data, setData] = useState<any[]>([]);
  const [rombelList, setRombelList] = useState<Rombel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ nama_materi: '', kategori_materi: '', id_rombel: '' });

  const resetForm = () => {
    setForm({ nama_materi: '', kategori_materi: '', id_rombel: '' });
    setEditingId(null);
    setFormError('');
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (m: any) => {
    setEditingId(m.id_materi);
    setForm({ nama_materi: m.nama_materi, kategori_materi: m.kategori_materi, id_rombel: m.id_rombel || '' });
    setFormError('');
    setShowModal(true);
  };

  const fetchData = async () => {
    const { data: d } = await supabase.from('materi').select('*, rombel(nama_rombel)').order('nama_materi');
    const { data: r } = await supabase.from('rombel').select('*').order('nama_rombel');
    setData(d || []);
    setRombelList(r || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!form.nama_materi || !form.kategori_materi || !form.id_rombel) return;
    setSaving(true);
    setFormError('');
    let error = null;
    if (editingId) {
      const res = await supabase.from('materi').update(form).eq('id_materi', editingId);
      error = res.error;
    } else {
      const res = await supabase.from('materi').insert(form);
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

  const filtered = data.filter((m) =>
    m.nama_materi.toLowerCase().includes(search.toLowerCase()) ||
    m.kategori_materi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        badge="Kurikulum"
        title="Materi Pembelajaran"
        description={`${data.length} modul pembelajaran tersedia.`}
        action={
          <Button onClick={openCreate}>
            <Icon name="add" size={18} /> Tambah Materi
          </Button>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon name="search" size={18} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari materi atau kategori..."
              className="w-full rounded-lg bg-gray-50 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-4"><EmptyState icon="menu_book" title="Belum ada materi" description="Tambah materi baru atau ubah kata kunci." /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filtered.map((m) => (
              <div key={m.id_materi} className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:shadow-sm transition-shadow relative overflow-hidden">
                <div className="w-1.5 h-full bg-primary absolute left-0 top-0 bottom-0" />
                <div className="pl-2">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="inline-flex px-2.5 py-1 rounded-full bg-white text-gray-700 text-[11px] font-bold border border-gray-200">
                      {m.rombel?.nama_rombel || 'Umum'}
                    </span>
                    <div className="inline-flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(m)}
                        className="p-1.5 rounded-lg text-primary hover:bg-primary-container/10 transition-colors"
                        title="Edit"
                      >
                        <Icon name="edit" size={16} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Hapus materi "${m.nama_materi}"?`)) {
                            await supabase.from('materi').delete().eq('id_materi', m.id_materi);
                            fetchData();
                          }
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-error hover:bg-error-container/50 transition-colors"
                        title="Hapus"
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
                      <Icon name="menu_book" size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-primary font-bold uppercase">{m.kategori_materi}</p>
                      <h3 className="font-bold text-gray-900 leading-snug">{m.nama_materi}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? 'Edit Materi' : 'Tambah Materi'} subtitle={editingId ? 'Perbarui modul pembelajaran' : 'Modul pembelajaran baru'} icon="menu_book">
        <div className="space-y-4">
          <Input label="Nama Materi" value={form.nama_materi} onChange={(e) => setForm({ ...form, nama_materi: e.target.value })} placeholder="Judul modul" />
          <Input label="Kategori" value={form.kategori_materi} onChange={(e) => setForm({ ...form, kategori_materi: e.target.value })} placeholder="Misal: Al-Qur'an, Hadist" />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rombel</label>
            <Combobox options={rombelOptions} value={form.id_rombel} onChange={(val) => setForm({ ...form, id_rombel: val })} placeholder="Pilih Rombel" />
          </div>
        </div>
{formError && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-error-container/50 text-error text-sm rounded-lg font-medium">
            <Icon name="error" size={18} /> {formError}
          </div>
        )}
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
