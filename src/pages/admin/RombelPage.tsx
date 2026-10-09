import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import type { Rombel } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Icon } from '../../components/ui/Icon';

export default function RombelPage() {
  const [data, setData] = useState<Rombel[]>([]);
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

  const openEdit = (r: any) => {
    setEditingId(r.id_rombel);
    setFormNama(r.nama_rombel);
    setFormError('');
    setShowModal(true);
  };

  const fetchData = async () => {
    const { data: d } = await supabase.from('rombel').select('*').order('nama_rombel');
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
      const res = await supabase.from('rombel').update({ nama_rombel: formNama.trim() }).eq('id_rombel', editingId);
      error = res.error;
    } else {
      const res = await supabase.from('rombel').insert({ nama_rombel: formNama.trim() });
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
    if (!confirm('Hapus rombel ini?')) return;
    await supabase.from('rombel').delete().eq('id_rombel', id);
    fetchData();
  };

  const filtered = data.filter((r) => r.nama_rombel.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <PageHeader
        badge="Master Data"
        title="Data Rombel"
        description={`${data.length} rombongan belajar terdaftar.`}
        action={
          <Button onClick={openCreate}>
            <Icon name="add" size={18} /> Tambah Rombel
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
              placeholder="Cari nama rombel..."
              className="w-full rounded-lg bg-gray-50 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-4"><EmptyState icon="school" title="Belum ada data rombel" description="Tambah rombel baru atau ubah kata kunci." /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filtered.map((r) => (
              <div key={r.id_rombel} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between gap-3 hover:shadow-sm transition-shadow border border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                    <Icon name="school" size={20} />
                  </div>
                  <span className="font-bold text-gray-900 truncate">{r.nama_rombel}</span>
                </div>
                <div className="inline-flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(r)}
                    className="p-2 rounded-lg text-primary hover:bg-primary-container/10 transition-colors"
                    title="Edit"
                  >
                    <Icon name="edit" size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id_rombel)}
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

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? 'Edit Rombel' : 'Tambah Rombel'} subtitle={editingId ? 'Perbarui nama rombel' : 'Daftarkan jenjang kelas baru'} icon="school">
        <Input label="Nama Rombel" value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Misal: Cabe Rawit, Pra-Remaja" />
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
