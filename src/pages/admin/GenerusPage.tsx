import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Combobox } from '../../components/ui/Combobox';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Icon } from '../../components/ui/Icon';

const emptyForm = {
  nama_generus: '',
  jenis_kelamin: 'Laki-laki',
  tanggal_lahir: '',
  id_kelompok: '',
  id_rombel: '',
};

const selectClass =
  'rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';

const formatTanggal = (val: string) =>
  val ? new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

export default function GenerusPage() {
  const [data, setData] = useState<any[]>([]);
  const [desas, setDesas] = useState<any[]>([]);
  const [kelompok, setKelompok] = useState<any[]>([]);
  const [rombel, setRombel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ desa: '', kelompok: '', rombel: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (g: any) => {
    setEditingId(g.id_generus);
    setForm({
      nama_generus: g.nama_generus || '',
      jenis_kelamin: g.jenis_kelamin || 'Laki-laki',
      tanggal_lahir: g.tanggal_lahir || '',
      id_kelompok: g.id_kelompok || '',
      id_rombel: g.id_rombel || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: d } = await supabase
      .from('generus')
      .select('*, kelompok(id_kelompok, id_desa, nama_kelompok, desa(nama_desa)), rombel(nama_rombel)')
      .order('nama_generus');
    setData(d || []);
    setLoading(false);
  };

  const fetchMaster = async () => {
    const [dDesa, dKel, dRom] = await Promise.all([
      supabase.from('desa').select('*').order('nama_desa'),
      supabase.from('kelompok').select('*').order('nama_kelompok'),
      supabase.from('rombel').select('*').order('nama_rombel'),
    ]);
    setDesas(dDesa.data || []);
    setKelompok(dKel.data || []);
    setRombel(dRom.data || []);
  };

  useEffect(() => {
    fetchMaster();
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!form.nama_generus.trim() || !form.tanggal_lahir || !form.id_kelompok) {
      setFormError('Nama, tanggal lahir, dan kelompok wajib diisi.');
      return;
    }
    setSaving(true);
    setFormError('');
    const payload = {
      nama_generus: form.nama_generus.trim(),
      jenis_kelamin: form.jenis_kelamin,
      tanggal_lahir: form.tanggal_lahir,
      id_kelompok: form.id_kelompok,
      id_rombel: form.id_rombel || null,
    };
    let error = null;
    if (editingId) {
      const res = await supabase.from('generus').update(payload).eq('id_generus', editingId);
      error = res.error;
    } else {
      const res = await supabase.from('generus').insert(payload);
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

  const handleDelete = async (g: any) => {
    if (!confirm(`Hapus generus "${g.nama_generus}"? Data laporan terkait ikut terhapus.`)) return;
    await supabase.from('generus').delete().eq('id_generus', g.id_generus);
    fetchData();
  };

  const kelompokFiltered = filter.desa
    ? kelompok.filter((k) => k.id_desa === filter.desa)
    : kelompok;

  const filtered = data.filter((g) => {
    if (filter.desa && g.kelompok?.id_desa !== filter.desa) return false;
    if (filter.kelompok && g.id_kelompok !== filter.kelompok) return false;
    if (filter.rombel && g.id_rombel !== filter.rombel) return false;
    return g.nama_generus.toLowerCase().includes(search.toLowerCase());
  });

  const totalFiltered = filtered.length;
  const maleFiltered = filtered.filter((g) => g.jenis_kelamin === 'Laki-laki').length;
  const femaleFiltered = filtered.filter((g) => g.jenis_kelamin === 'Perempuan').length;

  const statCards = [
    { label: 'Total Generus', value: totalFiltered, icon: 'groups', color: 'bg-primary', textColor: 'text-white' },
    { label: 'Laki-laki', value: maleFiltered, icon: 'male', color: 'bg-[#1e63b2]', textColor: 'text-white' },
    { label: 'Perempuan', value: femaleFiltered, icon: 'female', color: 'bg-[#d63384]', textColor: 'text-white' },
  ];

  const kelompokOptions = kelompok.map((k) => ({ value: k.id_kelompok, label: k.nama_kelompok }));
  const rombelOptions = rombel.map((r) => ({ value: r.id_rombel, label: r.nama_rombel }));
  const genderOptions = [
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        badge="Master Data"
        title="Kelola Generus"
        description={`${data.length} generus terdaftar.`}
        action={
          <Button onClick={openCreate}>
            <Icon name="add" size={18} /> Tambah Generus
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${stat.color} ${stat.textColor} flex items-center justify-center flex-shrink-0 shadow-md`}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                {stat.icon}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl lg:text-3xl font-bold leading-none text-gray-900">
                {loading ? '—' : stat.value}
              </span>
              <span className="text-sm lg:text-base font-medium text-gray-600 mt-1">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>


      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon name="search" size={18} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama generus..."
              className="w-full rounded-lg bg-gray-50 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filter.desa}
              onChange={(e) => setFilter({ desa: e.target.value, kelompok: '', rombel: '' })}
              className={selectClass}
            >
              <option value="">Semua Desa</option>
              {desas.map((d) => (
                <option key={d.id_desa} value={d.id_desa}>{d.nama_desa}</option>
              ))}
            </select>
            <select
              value={filter.kelompok}
              onChange={(e) => setFilter({ ...filter, kelompok: e.target.value })}
              className={selectClass}
            >
              <option value="">Semua Kelompok</option>
              {kelompokFiltered.map((k) => (
                <option key={k.id_kelompok} value={k.id_kelompok}>{k.nama_kelompok}</option>
              ))}
            </select>
            <select
              value={filter.rombel}
              onChange={(e) => setFilter({ ...filter, rombel: e.target.value })}
              className={selectClass}
            >
              <option value="">Semua Rombel</option>
              {rombel.map((r) => (
                <option key={r.id_rombel} value={r.id_rombel}>{r.nama_rombel}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="groups"
              title={data.length === 0 ? 'Belum ada data generus' : 'Tidak ada hasil'}
              description="Tambah generus baru atau ubah kata kunci pencarian."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">L/P</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Lahir</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kelompok</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Desa</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rombel</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((g) => (
                  <tr key={g.id_generus} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {g.nama_generus.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{g.nama_generus}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        g.jenis_kelamin === 'Laki-laki' ? 'bg-primary-container/10 text-primary' : 'bg-tertiary-fixed text-tertiary'
                      }`}>
                        {g.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{formatTanggal(g.tanggal_lahir)}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{g.kelompok?.nama_kelompok || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{g.kelompok?.desa?.nama_desa || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{g.rombel?.nama_rombel || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(g)}
                          className="p-2 rounded-lg text-primary hover:bg-primary-container/10 transition-colors"
                          title="Edit"
                        >
                          <Icon name="edit" size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(g)}
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

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingId ? 'Edit Generus' : 'Tambah Generus'}
        subtitle={editingId ? 'Perbarui data generus' : 'Lengkapi data generus untuk alokasi kelompok dan rombel'}
        icon={editingId ? 'edit' : 'person_add'}
      >
        <div className="space-y-4">
          <Input
            label="Nama Lengkap"
            value={form.nama_generus}
            onChange={(e) => setForm({ ...form, nama_generus: e.target.value })}
            placeholder="Nama lengkap generus"
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenis Kelamin</label>
            <Combobox
              options={genderOptions}
              value={form.jenis_kelamin}
              onChange={(val) => setForm({ ...form, jenis_kelamin: val })}
              placeholder="Pilih Jenis Kelamin"
              clearable={false}
            />
          </div>
          <Input
            label="Tanggal Lahir"
            type="date"
            value={form.tanggal_lahir}
            onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })}
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kelompok</label>
            <Combobox
              options={kelompokOptions}
              value={form.id_kelompok}
              onChange={(val) => setForm({ ...form, id_kelompok: val })}
              placeholder="Pilih Kelompok"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rombel (Kelas)</label>
            <Combobox
              options={rombelOptions}
              value={form.id_rombel}
              onChange={(val) => setForm({ ...form, id_rombel: val })}
              placeholder="Pilih Rombel"
            />
          </div>
        </div>
        {formError && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-error-container/50 text-error text-sm rounded-lg font-medium">
            <Icon name="error" size={18} /> {formError}
          </div>
        )}
        <div className="mt-5 flex gap-2 justify-end">
          <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>Batal</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Icon name="save" size={18} /> {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
