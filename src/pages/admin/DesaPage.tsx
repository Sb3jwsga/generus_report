import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import type { Desa } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Icon } from '../../components/ui/Icon';

export default function DesaPage() {
  const [data, setData] = useState<Desa[]>([]);
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

  const openEdit = (d: Desa) => {
    setEditingId(d.id_desa);
    setFormNama(d.nama_desa);
    setFormError('');
    setShowModal(true);
  };

  const fetchData = async () => {
    const { data: d, error } = await supabase.from('desa').select('*').order('nama_desa');
    if (!error) setData(d || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!formNama.trim()) return;
    setSaving(true);
    setFormError('');
    let error = null;
    if (editingId) {
      const res = await supabase.from('desa').update({ nama_desa: formNama.trim() }).eq('id_desa', editingId);
      error = res.error;
    } else {
      const res = await supabase.from('desa').insert({ nama_desa: formNama.trim() });
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
    if (!confirm('Hapus desa ini? Data kelompok di dalamnya ikut terhapus.')) return;
    await supabase.from('desa').delete().eq('id_desa', id);
    fetchData();
  };

  const filtered = data.filter((d) => d.nama_desa.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <PageHeader
        badge="Master Data"
        title="Data Desa"
        description={`${data.length} desa binaan terdaftar.`}
        action={
          <Button onClick={openCreate}>
            <Icon name="add" size={18} /> Tambah Desa
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
              placeholder="Cari nama desa..."
              className="w-full rounded-lg bg-gray-50 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-4"><EmptyState icon="holiday_village" title={data.length === 0 ? 'Belum ada data desa' : 'Tidak ada hasil'} description="Tambah desa baru atau ubah kata kunci pencarian." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Desa</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((d, i) => (
                  <tr key={d.id_desa} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-6">{i + 1}</span>
                        <div className="w-9 h-9 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
                          <Icon name="holiday_village" size={20} />
                        </div>
                        <span className="font-semibold text-gray-900">{d.nama_desa}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(d)}
                          className="p-2 rounded-lg text-primary hover:bg-primary-container/10 transition-colors"
                          title="Edit"
                        >
                          <Icon name="edit" size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id_desa)}
                          className="p-2 rounded-lg text-gray-400 hover:text-error hover:bg-error-container/50 transition-colors"
                          title="Hapus"
                        >
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? 'Edit Desa' : 'Tambah Desa'} subtitle={editingId ? 'Perbarui nama desa' : 'Daftarkan desa binaan baru'} icon="holiday_village">
        <Input label="Nama Desa" value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Contoh: Sukamaju" />
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
