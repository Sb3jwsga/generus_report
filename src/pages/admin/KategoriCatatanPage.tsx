import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import type { CategoryCatatan } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Icon } from '../../components/ui/Icon';

export default function KategoriCatatanPage() {
  const [data, setData] = useState<CategoryCatatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNama, setFormNama] = useState('');
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setFormNama('');
    setEditingId(null);
    setFormError('');
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (c: CategoryCatatan) => {
    setEditingId(c.id_category);
    setFormNama(c.nama_category);
    setFormError('');
    setShowModal(true);
  };

  const fetchData = async () => {
    const { data: d } = await supabase.from('category_catatan').select('*').order('nama_category');
    setData(d || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!formNama.trim()) return;
    setSaving(true);
    setFormError('');
    let error = null;
    if (editingId) {
      const res = await supabase.from('category_catatan').update({ nama_category: formNama.trim() }).eq('id_category', editingId);
      error = res.error;
    } else {
      const res = await supabase.from('category_catatan').insert({ nama_category: formNama.trim() });
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

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kategori ini?')) return;
    await supabase.from('category_catatan').delete().eq('id_category', id);
    fetchData();
  };

  const filtered = data.filter((c) => c.nama_category.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <PageHeader
        badge="Master Data"
        title="Kategori Catatan"
        description={`${data.length} kategori catatan perkembangan.`}
        action={
          <Button onClick={openCreate}>
            <Icon name="add" size={18} /> Tambah Kategori
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
              placeholder="Cari kategori..."
              className="w-full rounded-lg bg-gray-50 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-4"><EmptyState icon="label" title="Belum ada kategori" description="Tambah kategori baru atau ubah kata kunci." /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filtered.map((c) => (
              <div key={c.id_category} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between gap-3 border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container text-gray-900 flex items-center justify-center shrink-0">
                    <Icon name="label" size={20} />
                  </div>
                  <span className="font-bold text-gray-900 truncate">{c.nama_category}</span>
                </div>
                <div className="inline-flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-2 rounded-lg text-primary hover:bg-primary-container/10 transition-colors"
                    title="Edit"
                  >
                    <Icon name="edit" size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id_category)}
                    className="p-2 rounded-lg text-gray-400 hover:text-error hover:bg-error-container/50 transition-colors"
                    title="Hapus"
                  >
                    <Icon name="delete" size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? 'Edit Kategori' : 'Tambah Kategori'} subtitle={editingId ? 'Perbarui nama kategori' : 'Kategori baru untuk catatan perkembangan'} icon="label">
        <Input label="Nama Kategori" value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Contoh: Hafalan, Akhlak" />
        {formError && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-error-container/50 text-error text-sm rounded-lg font-medium">
            <Icon name="error" size={18} /> {formError}
          </div>
        )}
        <div className="mt-5 flex gap-2 justify-end">
          <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>Batal</Button>
          <Button onClick={handleCreate} disabled={saving || !formNama.trim()}>
            <Icon name="save" size={18} /> {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
