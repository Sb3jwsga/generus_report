import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import type { Kelompok } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Combobox } from '../../components/ui/Combobox';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Icon } from '../../components/ui/Icon';
import bcrypt from 'bcryptjs';

export default function UserManagementPage() {
  const [data, setData] = useState<any[]>([]);
  const [kelompoks, setKelompoks] = useState<Kelompok[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    nama_user: '',
    username: '',
    password: '',
    role: 'Pengurus',
    id_kelompok: '',
  });

  const resetForm = () => {
    setForm({ nama_user: '', username: '', password: '', role: 'Pengurus', id_kelompok: '' });
    setEditingId(null);
    setFormError('');
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (u: any) => {
    setEditingId(u.id_user);
    setForm({
      nama_user: u.nama_user || '',
      username: u.username,
      password: '',
      role: u.role,
      id_kelompok: u.id_kelompok || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const fetchData = async () => {
    const { data: d } = await supabase.from('user').select('*, kelompok(nama_kelompok)').order('username');
    const { data: k } = await supabase.from('kelompok').select('*').order('nama_kelompok');
    setData(d || []);
    setKelompoks(k || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!form.nama_user || !form.username || (!editingId && !form.password)) {
      setFormError('Nama, username, dan password wajib diisi.');
      return;
    }
    setSaving(true);
    setFormError('');
    const payload: any = {
      nama_user: form.nama_user,
      username: form.username,
      role: form.role,
      id_kelompok: form.role === 'Pengurus' ? (form.id_kelompok || null) : null,
    };
    if (form.password) {
      payload.password = await bcrypt.hash(form.password, 10);
    }
    let error = null;
    if (editingId) {
      const res = await supabase.from('user').update(payload).eq('id_user', editingId);
      error = res.error;
    } else {
      const res = await supabase.from('user').insert(payload);
      error = res.error;
    }
    setSaving(false);
    if (error) {
      setFormError(error.message.includes('duplicate') || error.message.includes('unique') ? 'Username sudah terpakai.' : error.message);
      return;
    }
    resetForm();
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Hapus user "${username}"?`)) return;
    await supabase.from('user').delete().eq('id_user', id);
    fetchData();
  };

  const kelompokOptions = kelompoks.map((k) => ({ value: k.id_kelompok, label: k.nama_kelompok }));
  const roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Pengurus', label: 'Pengurus' },
  ];

  const filtered = data.filter((u) =>
    (u.nama_user || '').toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        badge="Administrasi"
        title="Manajemen User"
        description={`${data.length} akun terdaftar (Admin & Pengurus).`}
        action={
          <Button onClick={openCreate}>
            <Icon name="add" size={18} /> Tambah User
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
              placeholder="Cari nama atau username..."
              className="w-full rounded-lg bg-gray-50 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-4"><EmptyState icon="person" title="Belum ada user" description="Tambah akun baru atau ubah kata kunci." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kelompok</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((u) => (
                  <tr key={u.id_user} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {(u.nama_user || u.username).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{u.nama_user || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">@{u.username}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        u.role === 'Admin' ? 'bg-primary-container text-white' : 'bg-secondary-container text-gray-900'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.kelompok?.nama_kelompok || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-2 rounded-lg text-primary hover:bg-primary-container/10 transition-colors"
                          title="Edit"
                        >
                          <Icon name="edit" size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id_user, u.username)}
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

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? 'Edit User' : 'Tambah User'} subtitle={editingId ? 'Perbarui data akun' : 'Buat akun Admin atau Pengurus baru'} icon="person_add">
        <div className="space-y-4">
          <Input label="Nama Lengkap" value={form.nama_user} onChange={(e) => setForm({ ...form, nama_user: e.target.value })} placeholder="Nama lengkap pengguna" />
          <Input label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username untuk login" />
          <Input label={editingId ? 'Password Baru (kosongkan jika tidak diganti)' : 'Password'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimal 6 karakter" />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
            <Combobox options={roleOptions} value={form.role} onChange={(val) => setForm({ ...form, role: val })} placeholder="Pilih Role Pengguna" />
          </div>
          {form.role === 'Pengurus' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kelompok Binaan</label>
              <Combobox options={kelompokOptions} value={form.id_kelompok} onChange={(val) => setForm({ ...form, id_kelompok: val })} placeholder="Pilih Kelompok Binaan" />
            </div>
          )}
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
