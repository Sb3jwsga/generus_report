import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Santri, User } from '../types';
import { useData } from '../contexts/DataContext';
import { withTimeout, delay, clampedTask } from '../lib/utils';
import { saveSantri, deleteSantriApi } from '../services/apiService';

interface ManageSantriPageProps {
  currentUser: User | null;
}

export default function ManageSantriPage({ currentUser }: ManageSantriPageProps) {
  const { santri: allSantri, rombel: allRombel, desa: allDesa, kelompok: allKelompok, loading: dataLoading, refreshData } = useData();
  const [santris, setSantris] = useState<Santri[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (!dataLoading) {
      if (currentUser?.role === 'admin') {
        setSantris(allSantri);
      } else if (currentUser) {
        setSantris(allSantri.filter(s => s.id_kelompok === currentUser.id_kelompok));
      }
    }
  }, [allSantri, dataLoading, currentUser]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [santriToDelete, setSantriToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nama_santri: '',
    id_rombel: '',
    id_desa: '',
    id_kelompok: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L' as 'L' | 'P'
  });

  useEffect(() => {
    if (allRombel.length > 0 && !formData.id_rombel) {
      const defaultDesaId = currentUser?.role === 'admin' ? (allDesa[0]?.id_desa || '') : (currentUser?.id_desa || '');
      const defaultKelompokId = currentUser?.role === 'admin' ? (allKelompok[0]?.id_kelompok || '') : (currentUser?.id_kelompok || '');

      setFormData(prev => ({
        ...prev,
        id_rombel: allRombel[0]?.id_rombel || '',
        id_desa: defaultDesaId,
        id_kelompok: defaultKelompokId,
      }));
    }
  }, [allRombel, allDesa, allKelompok, currentUser]);

  const filteredSantri = santris.filter(s => 
    s.nama_santri.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    const defaultDesaId = currentUser?.role === 'admin' ? (allDesa[0]?.id_desa || '') : (currentUser?.id_desa || '');
    const defaultKelompokId = currentUser?.role === 'admin' ? (allKelompok[0]?.id_kelompok || '') : (currentUser?.id_kelompok || '');

    setEditingSantri(null);
    setFormData({
      nama_santri: '',
      id_rombel: allRombel[0]?.id_rombel || '',
      id_desa: defaultDesaId,
      id_kelompok: defaultKelompokId,
      tanggal_lahir: '',
      jenis_kelamin: 'L'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (santri: Santri) => {
    setEditingSantri(santri);
    setFormData({
      nama_santri: santri.nama_santri,
      id_rombel: santri.id_rombel,
      id_desa: santri.id_desa,
      id_kelompok: santri.id_kelompok,
      tanggal_lahir: santri.tanggal_lahir,
      jenis_kelamin: santri.jenis_kelamin || 'L'
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setSantriToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (santriToDelete) {
      const originalSantris = [...santris];
      // Optimistic update: remove from UI immediately
      setSantris(prev => prev.filter(s => s.id_santri !== santriToDelete));
      setIsDeleteModalOpen(false);
      
      try {
        // Real database operation
      const result = await clampedTask(deleteSantriApi(santriToDelete), 1000, 15000); 
      
      if (result && (result.status === 'success' || result.success === true)) {
        // Sync with server data silently
        await refreshData(true);
      } else {
        const errorMsg = result?.message || result?.error || 'Server rejected deletion';
        throw new Error(errorMsg);
      }
    } catch (e: any) {
      console.error('Error deleting santri:', e);
      // Rollback on failure
      setSantris(originalSantris);
      alert(`Gagal menghapus data: ${e.message || 'Cek Apps Script Anda'}`);
    } finally {
      setSantriToDelete(null);
    }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const santriData: Santri = {
      id_santri: editingSantri ? editingSantri.id_santri : `NEW-${Date.now()}`,
      ...formData
    };

    const originalSantris = [...santris];
    
    // Optimistic update
    if (editingSantri) {
      setSantris(prev => prev.map(s => s.id_santri === santriData.id_santri ? santriData : s));
    } else {
      setSantris(prev => [santriData, ...prev]);
    }
    
    setIsModalOpen(false);

    try {
      // Real database operation
      const result = await clampedTask(saveSantri(santriData), 1000, 15000); 
      
      if (result && (result.status === 'success' || result.success === true)) {
        // Sync with server data
        await refreshData(true);
      } else {
        const errorMsg = result?.message || result?.error || 'Server rejected save';
        throw new Error(errorMsg);
      }
    } catch (e: any) {
      console.error('Error saving santri:', e);
      // Rollback
      setSantris(originalSantris);
      alert(`Gagal menyimpan data: ${e.message || 'Pastikan Apps Script sudah memiliki handler saveSantri'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getRombelName = (id: string) => allRombel.find(r => r.id_rombel === id)?.nama_rombel || '-';
  const getDesaName = (id: string) => allDesa.find(d => d.id_desa === id)?.nama_desa || '-';
  const getKelompokName = (id: string) => allKelompok.find(k => k.id_kelompok === id)?.nama_kelompok || '-';

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-white/60 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-brand-accent border-t-brand-primary rounded-full animate-spin"></div>
              <p className="text-brand-primary font-bold animate-pulse">Memproses Data...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif text-brand-primary">Kelola Data Generus</h2>
          <p className="text-gray-500">Tambah, ubah, atau hapus database generus.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-2.5 bg-white border border-brand-accent/50 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/5"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-medium hover:opacity-90 transition-all"
          >
            <UserPlus size={18} />
            Tambah Santri
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[40px] border border-brand-accent/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-bg/50">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">L/P</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rombel</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kelompok</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Desa</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-accent/30 font-medium text-sm text-brand-primary">
              {filteredSantri.length > 0 ? filteredSantri.map((s) => (
                <tr key={s.id_santri} className="hover:bg-brand-bg/30 transition-colors">
                  <td className="px-8 py-5 font-bold">{s.nama_santri}</td>
                  <td className="px-8 py-5 text-gray-500">{s.jenis_kelamin || '-'}</td>
                  <td className="px-8 py-5">
                    <span className="bg-brand-accent/50 px-2 py-0.5 rounded text-[10px] uppercase">{getRombelName(s.id_rombel)}</span>
                  </td>
                  <td className="px-8 py-5 text-gray-500">{getKelompokName(s.id_kelompok)}</td>
                  <td className="px-8 py-5 text-gray-500">{getDesaName(s.id_desa)}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(s)} className="p-2 hover:bg-brand-accent/50 rounded-lg text-brand-primary transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteClick(s.id_santri)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic">
                    Belum ada data generus...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-brand-accent/30 flex items-center justify-between">
                <h3 className="text-2xl font-serif font-bold text-brand-primary">
                  {editingSantri ? 'Ubah Data Santri' : 'Tambah Santri Baru'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-brand-bg rounded-xl text-gray-400 transition-colors">
                   <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Nama Lengkap</label>
                  <input 
                    required
                    type="text" 
                    value={formData.nama_santri}
                    onChange={(e) => setFormData(prev => ({ ...prev, nama_santri: e.target.value }))}
                    className="w-full px-4 py-3 bg-brand-bg/50 border border-brand-accent/50 rounded-2xl focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Jenis Kelamin</label>
                    <select 
                      value={formData.jenis_kelamin}
                      onChange={(e) => setFormData(prev => ({ ...prev, jenis_kelamin: e.target.value as 'L' | 'P' }))}
                      className="w-full px-4 py-3 bg-brand-bg/50 border border-brand-accent/50 rounded-2xl focus:border-brand-primary transition-all outline-none"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Tgl Lahir</label>
                    <input 
                      type="date" 
                      value={formData.tanggal_lahir}
                      onChange={(e) => setFormData(prev => ({ ...prev, tanggal_lahir: e.target.value }))}
                      className="w-full px-4 py-3 bg-brand-bg/50 border border-brand-accent/50 rounded-2xl focus:border-brand-primary transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Rombel</label>
                    <select 
                      value={formData.id_rombel}
                      onChange={(e) => setFormData(prev => ({ ...prev, id_rombel: e.target.value }))}
                      className="w-full px-4 py-3 bg-brand-bg/50 border border-brand-accent/50 rounded-2xl focus:border-brand-primary transition-all outline-none"
                    >
                      {allRombel.map(r => <option key={r.id_rombel} value={r.id_rombel}>{r.nama_rombel}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Desa</label>
                    <select 
                      disabled={currentUser?.role !== 'admin'}
                      value={formData.id_desa}
                      onChange={(e) => setFormData(prev => ({ ...prev, id_desa: e.target.value }))}
                      className={`w-full px-4 py-3 bg-brand-bg/50 border border-brand-accent/50 rounded-2xl focus:border-brand-primary transition-all outline-none ${currentUser?.role !== 'admin' ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {allDesa
                        .filter(d => currentUser?.role === 'admin' || d.id_desa === currentUser?.id_desa)
                        .map(d => <option key={d.id_desa} value={d.id_desa}>{d.nama_desa}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Kelompok</label>
                  <select 
                    disabled={currentUser?.role !== 'admin'}
                    value={formData.id_kelompok}
                    onChange={(e) => setFormData(prev => ({ ...prev, id_kelompok: e.target.value }))}
                    className={`w-full px-4 py-3 bg-brand-bg/50 border border-brand-accent/50 rounded-2xl focus:border-brand-primary transition-all outline-none ${currentUser?.role !== 'admin' ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {allKelompok
                      .filter(k => currentUser?.role === 'admin' || k.id_kelompok === currentUser?.id_kelompok)
                      .map(k => <option key={k.id_kelompok} value={k.id_kelompok}>{k.nama_kelompok}</option>)}
                  </select>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-brand-bg text-gray-400 font-bold rounded-2xl hover:bg-brand-accent transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-4 bg-brand-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    Simpan Data
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-brand-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-serif font-bold text-brand-primary">Hapus Data?</h3>
                <p className="text-sm text-gray-500">
                  Apakah Anda yakin ingin menghapus data generus ini? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-3 w-full pt-4">
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-3 bg-brand-bg text-gray-400 font-bold rounded-xl hover:bg-brand-accent transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
