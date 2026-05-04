import React, { useState } from 'react';
import { Search, ChevronRight, User as UserIcon, MapPin, Users, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';
import { Santri, User } from '../types';
import { useData } from '../contexts/DataContext';
import { formatDate } from '../lib/utils';

interface SantriListProps {
  onSelectSantri: (santri: Santri) => void;
  currentUser: User | null;
}

export default function SantriList({ onSelectSantri, currentUser }: SantriListProps) {
  const { santri: allSantri, rombel: allRombel, desa: allDesa, kelompok: allKelompok } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDesa, setSelectedDesa] = useState(currentUser?.role === 'pengurus' ? currentUser.id_desa : '');
  const [selectedKelompok, setSelectedKelompok] = useState(currentUser?.role === 'pengurus' ? currentUser.id_kelompok : '');
  const [selectedRombel, setSelectedRombel] = useState('');

  const getRombelName = (id: string) => allRombel.find(r => r.id_rombel === id)?.nama_rombel || '-';
  const getDesaName = (id: string) => allDesa.find(d => d.id_desa === id)?.nama_desa || '-';
  const getKelompokName = (id: string) => allKelompok.find(k => k.id_kelompok === id)?.nama_kelompok || '-';

  const filteredSantri = allSantri
    .filter(s => {
      const matchesSearch = s.nama_santri.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDesa = selectedDesa ? s.id_desa === selectedDesa : true;
      const matchesKelompok = selectedKelompok ? s.id_kelompok === selectedKelompok : true;
      const matchesRombel = selectedRombel ? s.id_rombel === selectedRombel : true;
      return matchesSearch && matchesDesa && matchesKelompok && matchesRombel;
    })
    .sort((a, b) => a.nama_santri.localeCompare(b.nama_santri));

  const stats = {
    total: filteredSantri.length,
    male: filteredSantri.filter(s => s.jenis_kelamin === 'L').length,
    female: filteredSantri.filter(s => s.jenis_kelamin === 'P').length,
  };

  return (
    <div className="space-y-8" id="santri-list">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif text-brand-primary">Database Generus</h2>
          <p className="text-gray-500">Monitoring dan pengelolaan data terpadu.</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama generus..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-brand-accent/50 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all"
          />
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-[32px] border border-brand-accent/50 shadow-sm flex items-center gap-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-primary/5 flex items-center justify-center shrink-0">
            <Users className="text-brand-primary" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Generus</p>
            <h3 className="text-2xl font-serif text-brand-primary leading-none">{stats.total}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-[32px] border border-brand-accent/50 shadow-sm flex items-center gap-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
            <UserIcon className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Laki-Laki</p>
            <h3 className="text-2xl font-serif text-brand-primary leading-none">{stats.male}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-[32px] border border-brand-accent/50 shadow-sm flex items-center gap-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center shrink-0">
            <UserIcon className="text-pink-500" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Perempuan</p>
            <h3 className="text-2xl font-serif text-brand-primary leading-none">{stats.female}</h3>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-brand-accent/50 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1 pl-1">
            <MapPin size={12} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter Desa</span>
          </div>
          <select 
            disabled={currentUser?.role === 'pengurus'}
            value={selectedDesa}
            onChange={(e) => setSelectedDesa(e.target.value)}
            className={`w-full bg-brand-bg/50 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 appearance-none ${currentUser?.role === 'pengurus' ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <option value="">Semua Desa</option>
            {allDesa
              .filter(d => currentUser?.role === 'admin' || !currentUser || d.id_desa === currentUser.id_desa)
              .map(d => <option key={d.id_desa} value={d.id_desa}>{d.nama_desa}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1 pl-1">
            <Users size={12} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter Kelompok</span>
          </div>
          <select 
            disabled={currentUser?.role === 'pengurus'}
            value={selectedKelompok}
            onChange={(e) => setSelectedKelompok(e.target.value)}
            className={`w-full bg-brand-bg/50 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 appearance-none ${currentUser?.role === 'pengurus' ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <option value="">Semua Kelompok</option>
            {allKelompok
              .filter(k => currentUser?.role === 'admin' || !currentUser || k.id_kelompok === currentUser.id_kelompok)
              .map(k => <option key={k.id_kelompok} value={k.id_kelompok}>{k.nama_kelompok}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1 pl-1">
            <GraduationCap size={12} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter Rombel</span>
          </div>
          <select 
            value={selectedRombel}
            onChange={(e) => setSelectedRombel(e.target.value)}
            className="w-full bg-brand-bg/50 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 appearance-none"
          >
            <option value="">Semua Rombel</option>
            {allRombel.map(r => <option key={r.id_rombel} value={r.id_rombel}>{r.nama_rombel}</option>)}
          </select>
        </div>

        <button 
          onClick={() => { 
            if (currentUser?.role !== 'pengurus') {
              setSelectedDesa(''); 
              setSelectedKelompok(''); 
            }
            setSelectedRombel(''); 
            setSearchTerm(''); 
          }}
          className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-brand-primary transition-colors uppercase tracking-widest mt-4 md:mt-0"
        >
          Reset
        </button>
      </div>

      {/* Table Display */}
      <div className="bg-white rounded-[40px] border border-brand-accent/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-bg/50">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16">No</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Generus</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rombel</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kelompok</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Desa</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tgl Lahir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-accent/30 font-medium text-sm text-brand-primary">
              {filteredSantri.map((santri, i) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={santri.id_santri} 
                  className="hover:bg-brand-bg/30 transition-colors group cursor-pointer"
                  onClick={() => onSelectSantri(santri)}
                >
                  <td className="px-8 py-5 text-gray-400 font-mono text-xs">{i + 1}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-accent/30 flex items-center justify-center shrink-0">
                        <UserIcon size={14} className="text-brand-primary opacity-60" />
                      </div>
                      <span className="font-bold">{santri.nama_santri}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-brand-bg rounded-lg text-xs border border-brand-accent/50">{getRombelName(santri.id_rombel)}</span>
                  </td>
                  <td className="px-8 py-5 opacity-70">{getKelompokName(santri.id_kelompok)}</td>
                  <td className="px-8 py-5 opacity-70">{getDesaName(santri.id_desa)}</td>
                  <td className="px-8 py-5 font-mono text-xs opacity-60">{formatDate(santri.tanggal_lahir)}</td>
                </motion.tr>
              ))}
              {filteredSantri.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic">
                    Data generus tidak ditemukan...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

