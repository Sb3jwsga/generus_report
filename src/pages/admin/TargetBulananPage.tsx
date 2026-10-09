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
import * as XLSX from 'xlsx';
import { BULAN_LIST } from '../../utils/constants';

export default function TargetBulananPage() {
  const [data, setData] = useState<any[]>([]);
  const [rombelList, setRombelList] = useState<Rombel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  const [filterRombel, setFilterRombel] = useState('');
  const [sortKey, setSortKey] = useState<'nama_target' | 'jumlah_target' | 'bulan_target' | 'rombel'>('nama_target');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadRombelId, setUploadRombelId] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nama_target: '',
    jumlah_target: '',
    satuan_target: '',
    bulan_target: '',
    id_rombel: '',
  });

  const resetForm = () => {
    setForm({ nama_target: '', jumlah_target: '', satuan_target: '', bulan_target: '', id_rombel: '' });
    setEditingId(null);
    setFormError('');
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (t: any) => {
    setEditingId(t.id_target_bulan);
    setForm({
      nama_target: t.nama_target,
      jumlah_target: String(t.jumlah_target),
      satuan_target: t.satuan_target || '',
      bulan_target: t.bulan_target,
      id_rombel: t.id_rombel || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const fetchData = async () => {
    const { data: d } = await supabase.from('target_bulanan').select('*, rombel(nama_rombel)').order('bulan_target');
    const { data: r } = await supabase.from('rombel').select('*').order('nama_rombel');
    setData(d || []);
    setRombelList(r || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!form.nama_target || !form.jumlah_target || !form.bulan_target || !form.id_rombel) return;
    setSaving(true);
    setFormError('');
    const payload = {
      nama_target: form.nama_target,
      jumlah_target: Number(form.jumlah_target),
      satuan_target: form.satuan_target || 'kali',
      bulan_target: form.bulan_target,
      id_rombel: form.id_rombel,
    };
    let error = null;
    if (editingId) {
      const res = await supabase.from('target_bulanan').update(payload).eq('id_target_bulan', editingId);
      error = res.error;
    } else {
      const res = await supabase.from('target_bulanan').insert(payload);
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

  const downloadTemplate = () => {
    const templateData = [
      {
        'Bulan': 'Januari',
        'Nama Target': 'Kehadiran',
        'Jumlah Target': 20,
        'Satuan': 'kali'
      },
      {
        'Bulan': 'Januari',
        'Nama Target': 'Hafalan Surat',
        'Jumlah Target': 5,
        'Satuan': 'surat'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template_target_bulanan.xlsx');
  };

  const handleUploadExcel = async () => {
    if (!uploadRombelId || !uploadFile) {
      setUploadError('Pilih Rombel dan File Excel terlebih dahulu.');
      return;
    }

    setSaving(true);
    setUploadError('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const bstr = e.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
          setUploadError('File Excel kosong.');
          setSaving(false);
          return;
        }

        const validatedData: any[] = [];
        const errors: string[] = [];

        rawData.forEach((row, index) => {
          const rowNum = index + 2;
          const bulan = row['Bulan'];
          const nama = row['Nama Target'];
          const jumlah = row['Jumlah Target'];
          const satuan = row['Satuan'];

          if (!bulan || !nama || jumlah === undefined) {
            errors.push(`Baris ${rowNum}: Data tidak lengkap (Bulan, Nama Target, atau Jumlah Target kosong).`);
            return;
          }

          if (!BULAN_LIST.includes(bulan)) {
            errors.push(`Baris ${rowNum}: Bulan "${bulan}" tidak valid.`);
            return;
          }

          validatedData.push({
            nama_target: nama,
            jumlah_target: Number(jumlah),
            satuan_target: satuan || 'kali',
            bulan_target: bulan,
            id_rombel: uploadRombelId,
          });
        });

        if (errors.length > 0) {
          setUploadError(errors.slice(0, 5).join('\n') + (errors.length > 5 ? `\n...dan ${errors.length - 5} error lainnya.` : ''));
          setSaving(false);
          return;
        }

        const { error } = await supabase.from('target_bulanan').insert(validatedData);
        
        if (error) {
          setUploadError(`Gagal simpan ke database: ${error.message}`);
        } else {
          setShowUploadModal(false);
          setUploadFile(null);
          setUploadRombelId('');
          fetchData();
        }
        setSaving(false);
      };
      reader.readAsBinaryString(uploadFile);
    } catch (err: any) {
      setUploadError(`Gagal membaca file: ${err.message}`);
      setSaving(false);
    }
  };

  const rombelOptions = rombelList.map((r) => ({ value: r.id_rombel, label: r.nama_rombel }));
  const bulanOptions = BULAN_LIST.map((b) => ({ value: b, label: b }));

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = data
    .filter((t) => {
      const matchSearch = t.nama_target.toLowerCase().includes(search.toLowerCase());
      const matchBulan = !filterBulan || t.bulan_target === filterBulan;
      const matchRombel = !filterRombel || t.id_rombel === filterRombel;
      return matchSearch && matchBulan && matchRombel;
    })
    .sort((a, b) => {
      let valA: any;
      let valB: any;
      if (sortKey === 'rombel') {
        valA = (a.rombel?.nama_rombel || '').toLowerCase();
        valB = (b.rombel?.nama_rombel || '').toLowerCase();
      } else if (sortKey === 'jumlah_target') {
        valA = Number(a.jumlah_target) || 0;
        valB = Number(b.jumlah_target) || 0;
      } else if (sortKey === 'bulan_target') {
        valA = BULAN_LIST.indexOf(a.bulan_target);
        valB = BULAN_LIST.indexOf(b.bulan_target);
      } else {
        valA = (a.nama_target || '').toLowerCase();
        valB = (b.nama_target || '').toLowerCase();
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const renderSortIcon = (column: typeof sortKey) => (
    <span className={`inline-flex flex-col leading-none ml-1 ${sortKey === column ? 'text-primary' : 'text-gray-300'}`}>
      <span className={`text-[10px] ${sortKey === column && sortDir === 'asc' ? 'text-primary' : ''}`}>▲</span>
      <span className={`text-[10px] -mt-0.5 ${sortKey === column && sortDir === 'desc' ? 'text-primary' : ''}`}>▼</span>
    </span>
  );

  return (
    <DashboardLayout>
      <PageHeader
        badge="Target"
        title="Target Bulanan"
        description={`${data.length} target bulanan per rombel.`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowUploadModal(true)}>
              <Icon name="upload" size={18} /> Upload Excel
            </Button>
            <Button onClick={openCreate}>
              <Icon name="add" size={18} /> Tambah Target
            </Button>
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <Combobox options={bulanOptions} value={filterBulan} onChange={setFilterBulan} placeholder="Filter Bulan" />
          <Combobox options={rombelOptions} value={filterRombel} onChange={setFilterRombel} placeholder="Filter Rombel" />
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-4"><EmptyState icon="assessment" title="Belum ada target" description="Tambah target baru atau ubah filter." /></div>
        ) : (
          <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSort('nama_target')} className="inline-flex items-center hover:text-primary transition-colors">
                      Nama Target {renderSortIcon('nama_target')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSort('jumlah_target')} className="inline-flex items-center hover:text-primary transition-colors">
                      Jumlah {renderSortIcon('jumlah_target')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSort('bulan_target')} className="inline-flex items-center hover:text-primary transition-colors">
                      Bulan {renderSortIcon('bulan_target')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSort('rombel')} className="inline-flex items-center hover:text-primary transition-colors">
                      Rombel {renderSortIcon('rombel')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((t, i) => (
                  <tr key={t.id_target_bulan} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-6">{i + 1}</span>
                        <span className="font-semibold text-gray-900">{t.nama_target}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold">
                        {t.jumlah_target} {t.satuan_target}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{t.bulan_target}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{t.rombel?.nama_rombel || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
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
                              await supabase.from('target_bulanan').delete().eq('id_target_bulan', t.id_target_bulan);
                              fetchData();
                            }
                          }}
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

      <Modal isOpen={showUploadModal} onClose={() => { setShowUploadModal(false); setUploadError(''); }} title="Upload Target via Excel" icon="upload">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pilih Rombel</label>
            <Combobox options={rombelOptions} value={uploadRombelId} onChange={setUploadRombelId} placeholder="Pilih Rombel" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">File Excel</label>
            <div className="flex flex-col gap-2">
              <input type="file" accept=".xlsx, .xls" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90" />
              <button 
                type="button" 
                onClick={downloadTemplate}
                className="text-primary text-xs font-bold flex items-center gap-1 hover:underline w-fit"
              >
                <Icon name="download" size={14} /> Download Template Excel
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Format kolom: Bulan, Nama Target, Jumlah Target, Satuan</p>
          </div>
          {uploadError && (
            <div className="p-3 bg-error-container/50 text-error text-xs rounded-lg font-medium whitespace-pre-line">
              {uploadError}
            </div>
          )}
        </div>
        <div className="mt-5 flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowUploadModal(false)}>Batal</Button>
          <Button onClick={handleUploadExcel} disabled={saving}>
            {saving ? 'Mengunggah...' : 'Upload'}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingId ? 'Edit Target Bulanan' : 'Tambah Target Bulanan'} subtitle={editingId ? 'Perbarui target capaian' : 'Target capaian per rombel per bulan'} icon="assessment">
        <div className="space-y-4">
          <Input label="Nama Target" value={form.nama_target} onChange={(e) => setForm({ ...form, nama_target: e.target.value })} placeholder="Misal: Kehadiran, Hafalan" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Jumlah Target" type="number" value={form.jumlah_target} onChange={(e) => setForm({ ...form, jumlah_target: e.target.value })} placeholder="0" />
            <Input label="Satuan" value={form.satuan_target} onChange={(e) => setForm({ ...form, satuan_target: e.target.value })} placeholder="kali, hari, juz" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bulan</label>
            <Combobox options={bulanOptions} value={form.bulan_target} onChange={(val) => setForm({ ...form, bulan_target: val })} placeholder="Pilih Bulan" />
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
