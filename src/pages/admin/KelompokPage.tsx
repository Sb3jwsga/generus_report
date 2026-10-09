import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import type { Desa } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Combobox } from '../../components/ui/Combobox';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Icon } from '../../components/ui/Icon';

export default function KelompokPage() {
  const [data, setData] = useState<any[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNama, setFormNama] = useState('');
  const [selectedDesa, setSelectedDesa] = useState('');
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setFormNama('');
    setSelectedDesa('');
    setEditingId(null);
    setFormError('');
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (k: any) => {
    setEditingId(k.id_kelompok);
    setFormNama(k.nama_kelompok);
    setSelectedDesa(k.id_desa || '');
    setFormError('');
    setShowModal(true);
  };

  const fetchData = async () => {
    const { data: d } = await supabase.from('kelompok').select('*, desa(nama_desa)').order('nama_kelompok');
    const { data: desa } = await supabase.from('desa').select('*').order('nama_desa');
    setData(d || []);
    setDesaList(desa || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!formNama.trim() || !selectedDesa) return;
    setSaving(true);
    setFormError('');
    let error = null;
    if (editingId) {
      const res = await supabase.from('kelompok').update({ nama_kelompok: formNama.trim(), id_desa: selectedDesa }).eq('id_kelompok', editingId);
      error = res.error;
    } else {
      const res = await supabase.from('kelompok').insert({ nama_kelompok: formNama.trim(), id_desa: selectedDesa });
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
    if (!confirm('Hapus kelompok ini? Data generus di dalamnya ikut terhapus.')) return;
    await supabase.from('kelompok').delete().eq('id_kelompok', id);
    fetchData();
  };

  const desaOptions = desaList.map((d) => ({ value: d.id_desa, label: d.nama_desa }));
  const filtered = data.filter((k) =>
    k.nama_kelompok.toLowerCase().includes(search.toLowerCase()) ||
    (k.desa?.nama_desa || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        badge="Master Data"
        title="Data Kelompok"
        description={`${data.length} kelompok halaqah terdaftar.`}
        action={
          <Button onClick={openCreate}>
            <Icon name="add" size={18} /> Tambah Kelompok
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
              placeholder="Cari kelompok atau desa..."
              className="w-full rounded-lg bg-gray-50 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-4"><EmptyState icon="groups" title="Belum ada data kelompok" description="Tambah kelompok baru atau ubah kata kunci." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Kelompok</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Desa</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((k, i) => (
                  <tr key={k.id_kelompok} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-6">{i + 1}</span>
                        <div className="w-9 h-9 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
                          <Icon name="groups" size={20} />
                        </div>
                        <span className="font-semibold text-gray-900">{k.nama_kelompok}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <Icon name="location_on" size={14} className="text-primary" />
                        {k.desa?.nama_desa || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => openEdit(k)} className="p-2 rounded-lg text-primary hover:bg-primary-container/10 transition-colors" title="Edit">
                          <Icon name="edit" size={18} />
                        </button>
                        <button onClick={() => handleDelete(k.id_kelompok)} className="p-2 rounded-lg text-gray-400 hover:text-error hover:bg-error-container/50 transition-colors" title="Hapus">
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

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? 'Edit Kelompok' : 'Tambah Kelompok'} subtitle={editingId ? 'Perbarui data kelompok' : 'Daftarkan kelompok halaqah baru'} icon="groups">
        <div className="space-y-4">
          <Input label="Nama Kelompok" value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Contoh: Sukamaju 1" />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Desa</label>
            <Combobox options={desaOptions} value={selectedDesa} onChange={setSelectedDesa} placeholder="Pilih Desa" />
          </div>
        </div>
        {formError && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-error-container/50 text-error text-sm rounded-lg font-medium">
            <Icon name="error" size={18} /> {formError}
          </div>
        )}
        <div className="mt-5 flex gap-2 justify-end">
          <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>Batal</Button>
          <Button onClick={handleCreate} disabled={saving || !formNama.trim() || !selectedDesa}>
            <Icon name="save" size={18} /> {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
