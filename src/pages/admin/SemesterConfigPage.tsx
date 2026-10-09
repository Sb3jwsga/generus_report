import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import type { SemesterConfig } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Combobox } from '../../components/ui/Combobox';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Icon } from '../../components/ui/Icon';
import { BULAN_LIST } from '../../utils/constants';

export default function SemesterConfigPage() {
  const [data, setData] = useState<SemesterConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    tahun_ajaran: String(new Date().getFullYear()),
    ganjil_bulan_awal: '1',
    ganjil_bulan_akhir: '6',
    genap_bulan_awal: '7',
    genap_bulan_akhir: '12',
  });

  const resetForm = () => {
    setForm({
      tahun_ajaran: String(new Date().getFullYear()),
      ganjil_bulan_awal: '1',
      ganjil_bulan_akhir: '6',
      genap_bulan_awal: '7',
      genap_bulan_akhir: '12',
    });
    setEditingId(null);
    setFormError('');
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (c: SemesterConfig) => {
    setEditingId(c.id_config);
    setForm({
      tahun_ajaran: c.tahun_ajaran,
      ganjil_bulan_awal: String(c.ganjil_bulan_awal),
      ganjil_bulan_akhir: String(c.ganjil_bulan_akhir),
      genap_bulan_awal: String(c.genap_bulan_awal),
      genap_bulan_akhir: String(c.genap_bulan_akhir),
    });
    setFormError('');
    setShowModal(true);
  };

  const fetchData = async () => {
    const { data: d } = await supabase.from('semester_config').select('*').order('tahun_ajaran', { ascending: false });
    setData(d || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    setFormError('');
    const payload = {
      tahun_ajaran: form.tahun_ajaran,
      ganjil_bulan_awal: Number(form.ganjil_bulan_awal),
      ganjil_bulan_akhir: Number(form.ganjil_bulan_akhir),
      genap_bulan_awal: Number(form.genap_bulan_awal),
      genap_bulan_akhir: Number(form.genap_bulan_akhir),
    };

    let error = null;
    if (editingId) {
      const res = await supabase.from('semester_config').update(payload).eq('id_config', editingId);
      error = res.error;
    } else {
      const res = await supabase.from('semester_config').insert(payload);
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
    if (!confirm('Hapus konfigurasi semester ini?')) return;
    await supabase.from('semester_config').delete().eq('id_config', id);
    fetchData();
  };

  const bulanOptions = BULAN_LIST.map((b, i) => ({ value: String(i + 1), label: b }));

  return (
    <DashboardLayout>
      <PageHeader
        badge="Pengaturan"
        title="Pengaturan Semester"
        description="Atur rentang bulan untuk Semester Ganjil dan Genap per tahun ajaran."
        action={
          <Button onClick={openCreate}>
            <Icon name="add" size={18} /> Tambah Pengaturan
          </Button>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        ) : data.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="calendar_month"
              title="Belum ada pengaturan semester"
              description="Tambah rentang bulan untuk semester ganjil dan genap."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {data.map((c) => (
              <div key={c.id_config} className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="inline-flex px-2.5 py-1 rounded-full bg-primary text-white text-xs font-bold">
                      Tahun {c.tahun_ajaran}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-1.5 rounded-lg text-primary hover:bg-primary-container/10 transition-colors"
                      title="Edit"
                    >
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id_config)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-error hover:bg-error-container/50 transition-colors"
                      title="Hapus"
                    >
                      <Icon name="delete" size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase">Semester Ganjil</p>
                    <p className="font-semibold text-gray-900">
                      {BULAN_LIST[c.ganjil_bulan_awal - 1]} - {BULAN_LIST[c.ganjil_bulan_akhir - 1]}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase">Semester Genap</p>
                    <p className="font-semibold text-gray-900">
                      {BULAN_LIST[c.genap_bulan_awal - 1]} - {BULAN_LIST[c.genap_bulan_akhir - 1]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingId ? 'Edit Pengaturan Semester' : 'Tambah Pengaturan Semester'}
        subtitle={editingId ? 'Perbarui rentang bulan semester' : 'Atur rentang bulan untuk semester baru'}
        icon="calendar_month"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tahun Ajaran</label>
            <input
              value={form.tahun_ajaran}
              onChange={(e) => setForm({ ...form, tahun_ajaran: e.target.value })}
              placeholder="Contoh: 2026"
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="border-t border-gray-100 pt-3">
            <h4 className="font-bold text-sm text-gray-900 mb-2">Semester Ganjil</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bulan Mulai</label>
                <Combobox options={bulanOptions} value={form.ganjil_bulan_awal} onChange={(val) => setForm({ ...form, ganjil_bulan_awal: val })} placeholder="Pilih Bulan Mulai Ganjil" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bulan Selesai</label>
                <Combobox options={bulanOptions} value={form.ganjil_bulan_akhir} onChange={(val) => setForm({ ...form, ganjil_bulan_akhir: val })} placeholder="Pilih Bulan Selesai Ganjil" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <h4 className="font-bold text-sm text-gray-900 mb-2">Semester Genap</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bulan Mulai</label>
                <Combobox options={bulanOptions} value={form.genap_bulan_awal} onChange={(val) => setForm({ ...form, genap_bulan_awal: val })} placeholder="Pilih Bulan Mulai Genap" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bulan Selesai</label>
                <Combobox options={bulanOptions} value={form.genap_bulan_akhir} onChange={(val) => setForm({ ...form, genap_bulan_akhir: val })} placeholder="Pilih Bulan Selesai Genap" />
              </div>
            </div>
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
