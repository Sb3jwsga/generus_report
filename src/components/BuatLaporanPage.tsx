import React, { useState } from 'react';
import { Save, CheckCircle2, GraduationCap, FileText, Target as TargetIcon, ChevronRight, MessageSquare, Search, Pencil, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { useData } from '../contexts/DataContext';
import { submitLaporan, submitLaporanKeterangan, deleteReport } from '../services/apiService';
import { withTimeout, clampedTask, formatDate } from '../lib/utils';

interface BuatLaporanPageProps {
  currentUser: User | null;
}

type TabType = 'input' | 'hasil';

export default function BuatLaporanPage({ currentUser }: BuatLaporanPageProps) {
  const { santri: allSantri, rombel: allRombel, targets: allTargets, laporan: allLaporan, keterangan: allKeterangan, laporanKeterangan: allLaporanKeterangan, kelompok: allKelompok, refreshData } = useData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRombelId, setSelectedRombelId] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<TabType>('input');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [reportDate, setReportDate] = useState(getLocalDateString());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryResults, setSearchQueryResults] = useState('');
  
  const today = new Date();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const currentYear = String(today.getFullYear());

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // State for batch inputs in "Input Laporan"
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [attendance, setAttendance] = useState<Record<string, { hadir: string; sakit: string; izin: string; alfa: string }>>({});
  const [catatanInputs, setCatatanInputs] = useState<Record<string, { categoryId: string; text: string }[]>>({});

  const handleInputChange = (santriId: string, targetId: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      [`${santriId}-${targetId}`]: value
    }));
  };

  const handleAttendanceChange = (santriId: string, type: 'hadir' | 'sakit' | 'izin' | 'alfa', value: string) => {
    setAttendance(prev => ({
      ...prev,
      [santriId]: {
        ...(prev[santriId] || { hadir: '', sakit: '', izin: '', alfa: '' }),
        [type]: value
      }
    }));
  };

  const handleCatatanChange = (santriId: string, index: number, field: 'categoryId' | 'text', value: string) => {
    setCatatanInputs(prev => {
      const currentCatatan = prev[santriId] || [{ categoryId: '', text: '' }];
      const newCatatan = [...currentCatatan];
      newCatatan[index] = { ...newCatatan[index], [field]: value };
      return { ...prev, [santriId]: newCatatan };
    });
  };

  const handleAddCatatan = (santriId: string) => {
    setCatatanInputs(prev => ({
      ...prev,
      [santriId]: [...(prev[santriId] || [{ categoryId: '', text: '' }]), { categoryId: '', text: '' }]
    }));
  };

  const handleRemoveCatatan = (santriId: string, index: number) => {
    setCatatanInputs(prev => {
      const currentCatatan = prev[santriId] || [{ categoryId: '', text: '' }];
      if (currentCatatan.length <= 1) return prev;
      const newCatatan = currentCatatan.filter((_, i) => i !== index);
      return { ...prev, [santriId]: newCatatan };
    });
  };

  const handleSaveBatch = async (santriId: string) => {
    // Validation
    if (!reportDate) {
      setFormError('Tanggal laporan wajib diisi.');
      return false;
    }

    // Restriction: Only one report per month per santri
    const reportMonth = reportDate.substring(0, 7); // "YYYY-MM"
    const existingSameMonth = allLaporan.find(l => 
      l.id_santri === santriId && 
      l.tanggal_laporan.startsWith(reportMonth) &&
      l.tanggal_laporan !== reportDate
    );

    if (existingSameMonth) {
      setFormError(`Laporan untuk bulan ${reportMonth} sudah ada pada tanggal ${formatDate(existingSameMonth.tanggal_laporan)}. Anda hanya bisa input 1 kali per bulan.`);
      return false;
    }

    // Check targets (assuming all targets in rombel are mandatory)
    const targets = allTargets.filter(t => t.id_rombel === selectedRombelId);
    for (const target of targets) {
      const val = inputs[`${santriId}-${target.id_target}`];
      if (val === undefined || val === '' || val === null) {
        setFormError(`Target "${target.nama_target}" wajib diisi.`);
        return false;
      }
    }

    // Check attendance
    const att = attendance[santriId] || { hadir: '', sakit: '', izin: '', alfa: '' };
    if (att.hadir === '' || att.sakit === '' || att.izin === '' || att.alfa === '') {
      setFormError('Data kehadiran wajib diisi lengkap (bisa diisi 0).');
      return false;
    }

    setFormError(null);
    setIsProcessing(true);
    try {
      const santri = allSantri.find(s => s.id_santri === santriId);
      
      // Before saving, delete existing reports for this date/santri to avoid duplicates
      // This makes the "append-only" Apps Script act like an "overwrite"
      await deleteReport(santriId, reportDate);

      const lkId = Utilities_getUuid(); 
      const batchId = Utilities_getUuid();

      const submissionPromises = targets.map(target => {
        return submitLaporan({
          id_laporan: batchId,
          tanggal_laporan: reportDate,
          id_santri: santriId,
          id_target: target.id_target,
          id_laporanketerangan: lkId,
          id_kelompok: santri?.id_kelompok || '',
          id_desa: santri?.id_desa || '',
          nama_santri: santri?.nama_santri || '',
          nama_target: target.nama_target,
          pencapaian_target: Number(inputs[`${santriId}-${target.id_target}`]),
          angka_target: target.angka_target,
          hadir: Number(att.hadir),
          sakit: Number(att.sakit),
          izin: Number(att.izin),
          alfa: Number(att.alfa)
        });
      });

      const catatanList = catatanInputs[santriId] || [];
      catatanList.forEach(catatan => {
        if (catatan.categoryId && catatan.text) {
          submissionPromises.push(submitLaporanKeterangan({
            id_laporanketerangan: lkId,
            id_santri: santriId,
            id_laporan: batchId, 
            id_keterangan: catatan.categoryId,
            catatan: catatan.text
          }));
        }
      });

      const results = await clampedTask(Promise.all(submissionPromises), 1500, 10000);
      
      const failed = results.find(r => r.status !== 'success');
      if (failed) {
        throw new Error(failed.message || 'Salah satu laporan ditolak server');
      }

      await refreshData(true);
      
      setFormError(null);
      setSuccessMessage('Laporan berhasil disimpan!');
      setTimeout(() => setSuccessMessage(null), 3000);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message === 'TIMEOUT') {
         setFormError('Proses pengiriman melebihi 5 detik. Mohon cek database.');
      } else {
         console.error('Error saving reports:', error);
         setFormError('Gagal menyimpan laporan. Pastikan koneksi internet aktif.');
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper inside client since Utilities.getUuid is only in Apps Script
  function Utilities_getUuid() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  const getKelompokName = (id: string) => allKelompok.find(k => k.id_kelompok === id)?.nama_kelompok || `Kelompok ${id}`;

  const handleEditReport = (aggReport: any) => {
    const santri = allSantri.find(s => s.id_santri === aggReport.id_santri);
    if (santri) {
      setReportDate(aggReport.tanggal_laporan);
      // Pre-fill inputs from existing reports for that specific date
      const relevantReports = allLaporan.filter(
        r => r.id_santri === aggReport.id_santri && r.tanggal_laporan === aggReport.tanggal_laporan
      );
      
      const newInputs: Record<string, string> = { ...inputs };
      relevantReports.forEach(r => {
        newInputs[`${r.id_santri}-${r.id_target}`] = r.pencapaian_target.toString();
      });
      setInputs(newInputs);

      // Pre-fill attendance
      if (relevantReports.length > 0) {
        const first = relevantReports[0];
        setAttendance(prev => ({
          ...prev,
          [aggReport.id_santri]: {
            hadir: (first.hadir ?? 0).toString(),
            sakit: (first.sakit ?? 0).toString(),
            izin: (first.izin ?? 0).toString(),
            alfa: (first.alfa ?? 0).toString()
          }
        }));
      }
      
      // Pre-fill catatan
      const relevantLaporanIds = relevantReports.map(r => r.id_laporanketerangan).filter(id => !!id);
      const allCatatan = allLaporanKeterangan.filter(
        k => relevantLaporanIds.includes(k.id_laporanketerangan)
      );
      
      if (allCatatan.length > 0) {
        setCatatanInputs(prev => ({
          ...prev,
          [aggReport.id_santri]: allCatatan.map(c => ({
            categoryId: c.id_keterangan,
            text: c.catatan || ''
          }))
        }));
      } else {
        // Ensure at least one empty note exists
        setCatatanInputs(prev => ({
          ...prev,
          [aggReport.id_santri]: [{ categoryId: '', text: '' }]
        }));
      }

      openReportModal(santri);
    }
  };

  const handleDeleteReport = (idSantri: string, tanggal: string) => {
    setDeleteConfirm({ idSantri, tanggal });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    const { idSantri, tanggal } = deleteConfirm;
    setDeleteConfirm(null);
    setIsProcessing(true);
    try {
      const result = await clampedTask(deleteReport(idSantri, tanggal), 1000, 15000);
      
      if (result?.status === 'success') {
        await refreshData(true);
        setSuccessMessage('Laporan berhasil dihapus!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error('Server rejected deletion');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      setFormError('Gagal menghapus laporan. Pastikan Apps Script memiliki action: deleteReport.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // State for Keterangan per santri
  const [selectedSantriForReport, setSelectedSantriForReport] = useState<any>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ idSantri: string; tanggal: string } | null>(null);

  const openReportModal = (santri: any) => {
    setFormError(null);
    setSelectedSantriForReport(santri);
    setIsReportModalOpen(true);
  };

  const selectedRombel = allRombel.find(r => r.id_rombel === selectedRombelId);
  const targetsInRombel = allTargets.filter(t => t.id_rombel === selectedRombelId);
  const santriInRombel = allSantri
    .filter(s => {
      const matchesRombel = s.id_rombel === selectedRombelId;
      const matchesKelompok = currentUser?.role === 'pengurus' ? s.id_kelompok === currentUser.id_kelompok : true;
      const matchesSearch = s.nama_santri.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRombel && matchesKelompok && matchesSearch;
    })
    .sort((a, b) => a.nama_santri.localeCompare(b.nama_santri));

  // Aggregate reports by date and santri for "Hasil Laporan"
  const aggregatedReports = React.useMemo(() => {
    const groups: Record<string, any> = {};
    
    allLaporan.forEach(report => {
      const santri = allSantri.find(s => s.id_santri === report.id_santri);
      if (!santri || santri.id_rombel !== selectedRombelId) return;
      
      const matchesKelompok = currentUser?.role === 'pengurus' ? santri.id_kelompok === currentUser.id_kelompok : true;
      if (!matchesKelompok) return;
      
      const date = report.tanggal_laporan;
      const santriId = report.id_santri;
      const key = `${date}-${santriId}`;
      
      if (!groups[key]) {
        groups[key] = {
          id_santri: santriId,
          nama_santri: report.nama_santri,
          tanggal_laporan: date,
          total_pencapaian: 0,
          total_target: 0,
          reports: []
        };
      }
      
      groups[key].total_pencapaian += report.pencapaian_target;
      groups[key].total_target += report.angka_target;
      groups[key].reports.push(report);
    });
    
    return Object.values(groups)
      .filter(l => {
        const matchesSearch = l.nama_santri.toLowerCase().includes(searchQueryResults.toLowerCase());
        
        const [year, month] = (l.tanggal_laporan || '').split('-');
        const matchesYear = selectedYear ? year === selectedYear : true;
        const matchesMonth = selectedMonth ? month === selectedMonth : true;
        
        return matchesSearch && matchesYear && matchesMonth;
      })
      .sort((a, b) => b.tanggal_laporan.localeCompare(a.tanggal_laporan));
  }, [allLaporan, allSantri, selectedRombelId, searchQueryResults, selectedMonth, selectedYear, currentUser]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 relative">
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm"
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
          <h2 className="text-3xl font-serif text-brand-primary">Laporan Perkembangan</h2>
          <p className="text-gray-500 text-sm">Pilih generus untuk menginput laporan harian.</p>
        </div>
        
                {/* Rombel Dropdown */}
        <div className="w-full md:w-64">
           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 ml-1">Pilih Rombel</label>
           <div className="relative group">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" size={18} />
              <select 
                value={selectedRombelId}
                onChange={(e) => setSelectedRombelId(e.target.value)}
                className="w-full pl-12 pr-10 py-4 bg-white border border-brand-accent/50 rounded-2xl text-sm font-bold text-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all appearance-none cursor-pointer shadow-sm"
              >
                <option value="">-- Pilih Rombel --</option>
                {allRombel.map(r => (
                  <option key={r.id_rombel} value={r.id_rombel}>{r.nama_rombel}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                 <ChevronRight size={16} className="rotate-90" />
              </div>
           </div>
        </div>
      </header>

      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 font-bold text-sm"
          >
            <CheckCircle2 size={20} />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedRombelId ? (
        <div className="bg-white rounded-[40px] border border-brand-accent/50 p-20 text-center space-y-4">
           <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center mx-auto text-brand-primary/20">
              <GraduationCap size={40} />
           </div>
           <div>
              <h3 className="text-xl font-serif font-bold text-brand-primary">Belum Ada Rombel Terpilih</h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">Silakan pilih rombel terlebih dahulu untuk mulai melakukan penginputan laporan.</p>
           </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sub Tabs */}
          <div className="flex p-1.5 bg-brand-bg rounded-2xl w-fit mx-auto md:mx-0 border border-brand-accent/50">
            <button 
              onClick={() => setActiveSubTab('input')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'input' 
                ? 'bg-white text-brand-primary shadow-sm' 
                : 'text-gray-400 hover:text-brand-primary'
              }`}
            >
              <TargetIcon size={14} />
              Input Laporan
            </button>
            <button 
              onClick={() => setActiveSubTab('hasil')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'hasil' 
                ? 'bg-white text-brand-primary shadow-sm' 
                : 'text-gray-400 hover:text-brand-primary'
              }`}
            >
              <FileText size={14} />
              Hasil Laporan
            </button>
          </div>

          <div className="bg-white rounded-[40px] border border-brand-accent/50 shadow-sm overflow-hidden min-h-[400px]">
             {activeSubTab === 'input' ? (
               <div className="p-8 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div>
                       <h3 className="text-xl font-serif font-bold text-brand-primary">Daftar Santri: {selectedRombel.nama_rombel}</h3>
                       <p className="text-xs text-gray-400">Klik nama generus untuk mengisi laporan harian.</p>
                     </div>

                     <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                        {/* Date Picker for Input replaced by Month/Year select */}
                        <div className="flex items-center gap-2 p-1.5 bg-brand-bg/50 border border-brand-accent/50 rounded-2xl shadow-sm">
                           <div className="flex items-center px-3 text-gray-400">
                             <Calendar size={16} />
                           </div>
                           <select 
                             value={reportDate.substring(5, 7)}
                             onChange={(e) => setReportDate(`${reportDate.substring(0, 4)}-${e.target.value}-01`)}
                             className="bg-white border-none rounded-xl px-3 md:px-4 py-2 text-sm font-bold text-brand-primary focus:outline-none outline-none cursor-pointer"
                           >
                             {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                               <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                             ))}
                           </select>
                           <select 
                             value={reportDate.substring(0, 4)}
                             onChange={(e) => setReportDate(`${e.target.value}-${reportDate.substring(5, 7)}-01`)}
                             className="bg-white border-none rounded-xl px-3 md:px-4 py-2 text-sm font-bold text-brand-primary focus:outline-none outline-none cursor-pointer"
                           >
                              {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - 5 + i)).map(y => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                           </select>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:w-80 group">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                           <input 
                              type="text"
                              placeholder="Cari nama generus..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 bg-brand-bg/50 border border-brand-accent/50 rounded-2xl text-sm font-bold text-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all shadow-sm"
                           />
                        </div>
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="hidden md:grid grid-cols-12 px-8 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <div className="col-span-1">No</div>
                        <div className="col-span-5">Nama Santri</div>
                        <div className="col-span-3">Grup / Kelompok</div>
                        <div className="col-span-3 text-right">Aksi</div>
                     </div>

                     <div className="flex flex-col gap-3">
                        {santriInRombel.map((santri, idx) => {
                          const currentMonthPrefix = reportDate.substring(0, 7);
                          const alreadyReported = allLaporan.some(l => 
                            l.id_santri === santri.id_santri && 
                            l.tanggal_laporan.startsWith(currentMonthPrefix)
                          );

                          return (
                            <button
                              key={santri.id_santri}
                              onClick={() => !alreadyReported && openReportModal(santri)}
                              disabled={alreadyReported}
                              className={`w-full grid grid-cols-1 md:grid-cols-12 items-center gap-4 p-4 md:p-6 bg-white border border-brand-accent/40 rounded-3xl md:rounded-[24px] transition-all text-left shadow-sm group ${
                                alreadyReported 
                                  ? 'opacity-70 cursor-not-allowed bg-brand-bg/10' 
                                  : 'hover:border-brand-primary/30 hover:bg-brand-bg/20'
                              }`}
                            >
                              <div className="md:col-span-6 flex items-center gap-4">
                                <span className="hidden md:block text-xs font-black text-brand-primary/20 w-6">
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                                <div className={`w-10 h-10 md:w-12 md:h-12 bg-white border border-brand-accent rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform flex-shrink-0 ${alreadyReported ? 'text-gray-300' : 'text-brand-primary'}`}>
                                  <span className="font-serif font-bold text-base md:text-lg">{santri.nama_santri.charAt(0)}</span>
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                  <span className={`font-bold text-sm md:text-base truncate ${alreadyReported ? 'text-gray-400' : 'text-brand-primary'}`}>{santri.nama_santri}</span>
                                  <span className="md:hidden text-[9px] font-black text-gray-400 uppercase tracking-widest">{getKelompokName(santri.id_kelompok)}</span>
                                </div>
                              </div>

                              <div className="hidden md:block md:col-span-3">
                                <div className="flex flex-col">
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Unit</span>
                                   <span className="text-xs font-bold text-brand-primary">{getKelompokName(santri.id_kelompok)}</span>
                                </div>
                              </div>

                              <div className="md:col-span-3 flex items-center justify-end">
                                 <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                   alreadyReported 
                                     ? 'bg-green-50 text-green-600' 
                                     : 'bg-brand-primary/5 text-brand-primary group-hover:bg-brand-primary group-hover:text-white'
                                 }`}>
                                    <span className="hidden sm:inline">
                                      {alreadyReported ? 'Sudah Dilaporkan' : 'Input Laporan'}
                                    </span>
                                    {alreadyReported ? <CheckCircle2 size={16} /> : <ChevronRight size={16} />}
                                 </div>
                              </div>
                            </button>
                          );
                        })}
                     </div>
                     
                     {santriInRombel.length === 0 && (
                       <div className="py-20 text-center text-gray-400 italic text-sm">
                         Tidak ada generus di rombel ini untuk wilayah tugas Anda.
                       </div>
                     )}
                  </div>
               </div>
             ) : (
                <div className="p-8 space-y-8 flex flex-col h-full">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                     <div>
                        <h3 className="text-xl font-serif font-bold text-brand-primary">Hasil Laporan: {selectedRombel.nama_rombel}</h3>
                        <p className="text-xs text-gray-400">Menampilkan rekapan pencapaian generus.</p>
                     </div>

                     <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        {/* Month/Year Filter */}
                        <div className="flex items-center gap-2 p-1.5 bg-brand-bg rounded-2xl border border-brand-accent/50">
                           <div className="flex items-center px-2 text-brand-primary opacity-50">
                             <Calendar size={14} />
                           </div>
                           <select 
                             value={selectedMonth}
                             onChange={(e) => setSelectedMonth(e.target.value)}
                             className="bg-white border-none rounded-xl px-3 py-2 text-[10px] font-bold text-brand-primary focus:outline-none transition-all outline-none"
                           >
                             <option value="">Bulan</option>
                             {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                               <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                             ))}
                           </select>

                           <select 
                             value={selectedYear}
                             onChange={(e) => setSelectedYear(e.target.value)}
                             className="bg-white border-none rounded-xl px-3 py-2 text-[10px] font-bold text-brand-primary focus:outline-none transition-all outline-none"
                           >
                             <option value="">Tahun</option>
                             {Array.from(new Set([
                               currentYear,
                               ...allLaporan
                                 .map(l => l.tanggal_laporan?.split('-')[0])
                                 .filter((y): y is string => !!y)
                             ])).sort((a, b) => b.localeCompare(a)).map(y => (
                               <option key={y} value={y}>{y}</option>
                             ))}
                           </select>
                        </div>

                        {/* Search Input for Results */}
                        <div className="relative group min-w-[240px]">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={16} />
                           <input 
                              type="text"
                              placeholder="Cari nama generus..."
                              value={searchQueryResults}
                              onChange={(e) => setSearchQueryResults(e.target.value)}
                              className="w-full pl-11 pr-4 py-2.5 bg-brand-bg/50 border border-brand-accent/50 rounded-xl text-xs font-bold text-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all shadow-sm"
                           />
                        </div>

                        {(selectedMonth !== currentMonth || selectedYear !== currentYear || searchQueryResults) && (
                           <button 
                              onClick={() => {
                                 setSelectedMonth(currentMonth);
                                 setSelectedYear(currentYear);
                                 setSearchQueryResults('');
                              }}
                              className="text-[10px] font-bold text-red-500 hover:underline px-2"
                           >
                              Reset
                           </button>
                        )}
                     </div>
                  </div>
                  
                  <div className="overflow-x-auto -mx-8">
                    <table className="w-full text-left border-collapse">
                       <thead>
                         <tr className="bg-brand-bg/30 border-y border-brand-accent/20">
                           <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-40">Tanggal</th>
                           <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Santri</th>
                           <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Pencapaian Target</th>
                           <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-32">Aksi</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-brand-accent/20">
                         {aggregatedReports.map((l) => (
                             <tr key={`${l.tanggal_laporan}-${l.id_santri}`} className="hover:bg-brand-bg/10 transition-colors">
                               <td className="px-8 py-5 whitespace-nowrap">
                                  <span className="text-xs font-mono font-bold text-gray-500">{formatDate(l.tanggal_laporan)}</span>
                               </td>
                               <td className="px-8 py-5">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-brand-primary text-sm">{l.nama_santri}</span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Pencapaian Harian</span>
                                  </div>
                               </td>
                               <td className="px-8 py-5">
                                  <div className="flex items-center justify-center gap-3">
                                     <div className="flex-1 max-w-[120px] h-1.5 bg-brand-bg rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-brand-primary rounded-full transition-all duration-1000"
                                          style={{ width: `${Math.min((l.total_pencapaian / l.total_target) * 100, 100)}%` }}
                                        />
                                     </div>
                                     <div className="flex flex-col items-end min-w-[70px]">
                                        <span className="text-xs font-black text-brand-primary">
                                           {l.total_target > 0 ? Math.round((l.total_pencapaian / l.total_target) * 100) : 0}%
                                        </span>
                                        <span className="text-[9px] font-bold text-gray-400">
                                           {l.total_pencapaian}/{l.total_target}
                                        </span>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-5">
                                  <div className="flex items-center justify-center gap-2">
                                     <button 
                                       onClick={() => handleEditReport(l)}
                                       className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group/btn"
                                       title="Edit Laporan"
                                     >
                                        <Pencil size={14} className="group-hover/btn:scale-110 transition-transform" />
                                     </button>
                                     <button 
                                       onClick={() => handleDeleteReport(l.id_santri, l.tanggal_laporan || '')}
                                       className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm group/btn"
                                       title="Hapus Laporan"
                                     >
                                        <Trash2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                                     </button>
                                  </div>
                               </td>
                             </tr>
                           ))}
                         {aggregatedReports.length === 0 && (
                           <tr>
                              <td colSpan={4} className="px-8 py-32 text-center text-gray-400 italic text-sm">
                                 Belum ada data laporan untuk kriteria ini.
                              </td>
                           </tr>
                         )}
                       </tbody>
                    </table>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-brand-primary/20 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-brand-primary">Hapus Laporan?</h3>
                <p className="text-gray-500 text-sm mt-2">
                  Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReportModalOpen && selectedSantriForReport && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportModalOpen(false)}
              className="absolute inset-0 bg-brand-primary/20 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-brand-primary">{selectedSantriForReport.nama_santri}</h3>
                    <p className="text-xs text-gray-400 font-black uppercase tracking-widest">
                       {selectedRombel?.nama_rombel} • Kelompok {selectedSantriForReport.id_kelompok}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Tanggal Laporan</label>
                       <input 
                         type="date"
                         value={reportDate}
                         onChange={(e) => setReportDate(e.target.value)}
                         className="px-3 py-2 bg-brand-bg border border-brand-accent rounded-xl text-xs font-bold text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all"
                       />
                    </div>
                    <button onClick={() => setIsReportModalOpen(false)} className="p-2 bg-brand-bg rounded-xl text-gray-400 hover:text-brand-primary transition-colors">
                       <ChevronRight className="rotate-180" size={24} />
                    </button>
                  </div>
                </div>

                {formError && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-bold text-sm flex items-center gap-3"
                   >
                     <AlertCircle size={18} />
                     {formError}
                   </motion.div>
                )}

                <div className="space-y-8">
                  {/* Attendance Section */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Kehadiran Hari Ini</label>
                    <div className="grid grid-cols-4 gap-2">
                       {['hadir', 'sakit', 'izin', 'alfa'].map((type) => (
                         <div key={type} className="space-y-1">
                           <div className="text-[9px] font-black uppercase text-center text-gray-400">{type.charAt(0)}</div>
                           <input 
                             type="number"
                             value={attendance[selectedSantriForReport.id_santri]?.[type as keyof typeof attendance[string]] ?? ''}
                             onChange={(e) => handleAttendanceChange(selectedSantriForReport.id_santri, type as any, e.target.value)}
                             className="w-full py-3 bg-brand-bg border border-brand-accent rounded-xl text-center font-black text-brand-primary outline-none focus:border-brand-primary transition-all"
                           />
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Targets Section */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Pencapaian Target ({targetsInRombel.length})</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {targetsInRombel.map(target => (
                        <div key={target.id_target} className="p-4 bg-brand-bg/50 border border-brand-accent rounded-2xl flex items-center justify-between gap-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-primary shadow-sm">
                                 <TargetIcon size={18} />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-brand-primary">{target.nama_target}</p>
                                 <p className="text-[10px] text-gray-400">Goal: {target.angka_target} {target.satuan || 'Poin'}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                             <input 
                               type="number"
                               placeholder="0"
                               className="w-16 px-2 py-2 bg-white border border-brand-accent focus:border-brand-primary rounded-xl text-center font-black text-brand-primary outline-none transition-all placeholder:text-gray-300"
                               value={inputs[`${selectedSantriForReport.id_santri}-${target.id_target}`] || ''}
                               onChange={(e) => handleInputChange(selectedSantriForReport.id_santri, target.id_target, e.target.value)}
                             />
                             <span className="text-[10px] font-black text-gray-300">/{target.angka_target} <span className="text-[8px] uppercase">{target.satuan || 'Poin'}</span></span>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes Category Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Catatan & Keterangan</label>
                       <button 
                         onClick={() => handleAddCatatan(selectedSantriForReport.id_santri)}
                         className="flex items-center gap-1 text-[10px] font-bold text-brand-primary hover:underline"
                       >
                          <span>+ Tambah Catatan</span>
                       </button>
                    </div>
                    <div className="space-y-4">
                      {(catatanInputs[selectedSantriForReport.id_santri] || [{ categoryId: '', text: '' }]).map((catatan, idx) => (
                        <div key={idx} className="space-y-2 p-3 bg-brand-bg/30 rounded-2xl border border-brand-accent/30 relative group/catatan">
                          {idx > 0 && (
                            <button 
                              onClick={() => handleRemoveCatatan(selectedSantriForReport.id_santri, idx)}
                              className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/catatan:opacity-100 transition-opacity"
                            >
                               <Trash2 size={12} />
                            </button>
                          )}
                          <div className="relative">
                             <select 
                               className="w-full px-4 py-3 bg-white border border-brand-accent rounded-xl text-xs font-bold text-brand-primary outline-none focus:border-brand-primary appearance-none pr-10"
                               value={catatan.categoryId}
                               onChange={(e) => handleCatatanChange(selectedSantriForReport.id_santri, idx, 'categoryId', e.target.value)}
                             >
                               <option value="">- Pilih Kategori -</option>
                               {allKeterangan.map(k => (
                                 <option key={k.id_keterangan} value={k.id_keterangan}>{k.jenis_keterangan}</option>
                               ))}
                             </select>
                             <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                          </div>
                          <textarea 
                            placeholder="Berikan catatan tambahan di sini..."
                            className="w-full px-4 py-3 bg-white border border-brand-accent rounded-xl text-xs font-medium text-brand-primary outline-none focus:border-brand-primary transition-all min-h-[60px] resize-none"
                            value={catatan.text}
                            onChange={(e) => handleCatatanChange(selectedSantriForReport.id_santri, idx, 'text', e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                   <button 
                     onClick={() => setIsReportModalOpen(false)}
                     className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                   >
                     Batal
                   </button>
                   <button 
                     disabled={isProcessing}
                     onClick={async () => {
                        if (isProcessing) return;
                        const success = await handleSaveBatch(selectedSantriForReport.id_santri);
                        if (success) {
                           setIsReportModalOpen(false);
                           alert('Data berhasil disimpan');
                        }
                     }}
                     className={`flex-[2] py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-2 ${
                       isProcessing 
                         ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                         : 'bg-brand-primary text-white shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98]'
                     }`}
                   >
                     {isProcessing ? (
                       <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                     ) : (
                       <Save size={20} />
                     )}
                     {isProcessing ? 'Menyimpan...' : 'Simpan Laporan'}
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
