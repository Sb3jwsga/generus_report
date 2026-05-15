import React, { useState } from 'react';
import { Plus, Lock, Users, Target as TargetIcon, Search, MapPin, Users as UsersIcon, GraduationCap, CheckCircle2, FileText, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { useData } from '../contexts/DataContext';
import { User as UserType, Santri } from '../types';

interface LaporanPageProps {
  isLoggedIn: boolean;
  onGoToLogin: () => void;
  currentUser: UserType | null;
}

export default function LaporanPage({ isLoggedIn, onGoToLogin, currentUser }: LaporanPageProps) {
  const { santri: allSantri, laporan: allLaporan, targets: allTargets, rombel: allRombel, desa: allDesa, kelompok: allKelompok, keterangan: allKeterangan, laporanKeterangan: allLaporanKeterangan } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDesa, setSelectedDesa] = useState(currentUser?.role === 'pengurus' ? currentUser.id_desa : '');
  const [selectedKelompok, setSelectedKelompok] = useState(currentUser?.role === 'pengurus' ? currentUser.id_kelompok : '');
  const [selectedRombel, setSelectedRombel] = useState('');
  const today = new Date();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const currentYear = String(today.getFullYear());

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  React.useEffect(() => {
    if (isLoggedIn && currentUser?.role === 'pengurus') {
      setSelectedDesa(currentUser.id_desa);
      setSelectedKelompok(currentUser.id_kelompok);
    }
  }, [isLoggedIn, currentUser]);

  const months = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  const availableYears = Array.from(new Set([
    currentYear,
    ...allLaporan
      .map(l => l.tanggal_laporan?.split('-')[0])
      .filter((y): y is string => !!y)
  ])).sort((a: string, b: string) => b.localeCompare(a));

  // If user is pengurus, restrict to their area
  const effectiveDesa = (isLoggedIn && currentUser?.role === 'pengurus') ? currentUser.id_desa : selectedDesa;
  const effectiveKelompok = (isLoggedIn && currentUser?.role === 'pengurus') ? currentUser.id_kelompok : selectedKelompok;

  // Grouping logic for table
  const filteredSantri = allSantri.filter(s => {
    const matchesSearch = s.nama_santri.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDesa = effectiveDesa ? s.id_desa === effectiveDesa : true;
    const matchesKelompok = effectiveKelompok ? s.id_kelompok === effectiveKelompok : true;
    const matchesRombel = selectedRombel ? s.id_rombel === selectedRombel : true;
    return matchesSearch && matchesDesa && matchesKelompok && matchesRombel;
  });

  // Filtered reports for statistics
  const filteredSantriIds = new Set(filteredSantri.map(s => s.id_santri));
  
  const filteredLaporan = allLaporan.filter(l => {
    const matchesSantri = filteredSantriIds.has(l.id_santri);
    if (!matchesSantri) return false;

    if (selectedYear || selectedMonth) {
      const [year, month] = (l.tanggal_laporan || '').split('-');
      const matchesYear = selectedYear ? year === selectedYear : true;
      const matchesMonth = selectedMonth ? month === selectedMonth : true;
      return matchesYear && matchesMonth;
    }
    return true;
  });

  // Statistics
  const totalSantriStats = filteredSantri.length;
  const santriWithReportsCount = new Set(filteredLaporan.map(l => l.id_santri)).size;

  // Attendance stats
  const totalHadir = filteredLaporan.reduce((acc, curr) => acc + (curr.hadir || 0), 0);
  const totalSakit = filteredLaporan.reduce((acc, curr) => acc + (curr.sakit || 0), 0);
  const totalIzin = filteredLaporan.reduce((acc, curr) => acc + (curr.izin || 0), 0);
  const totalAlfa = filteredLaporan.reduce((acc, curr) => acc + (curr.alfa || 0), 0);
  const attendanceSum = totalHadir + totalSakit + totalIzin + totalAlfa;
  const attendancePercentage = attendanceSum > 0 ? Math.round((totalHadir / attendanceSum) * 100) : 0;

  // Achievement stats
  const achievementPercentage = filteredLaporan.length > 0
    ? Math.round((filteredLaporan.reduce((acc, curr) => acc + (curr.pencapaian_target / curr.angka_target), 0) / filteredLaporan.length) * 100)
    : 0;

  // Most frequent note category among filtered reports
  const filteredLaporanIds = new Set(filteredLaporan.map(l => l.id_laporan));
  const categoryCounts = allLaporanKeterangan
    .filter(lk => filteredLaporanIds.has(lk.id_laporan))
    .reduce((acc, curr) => {
      acc[curr.id_keterangan] = (acc[curr.id_keterangan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const mostFrequentCategoryId = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];
  const mostFrequentCategory = allKeterangan.find(k => k.id_keterangan === mostFrequentCategoryId)?.jenis_keterangan || '-';

  // Unique target names for columns - filter by rombel if selected
  const targetsForColumns = selectedRombel 
    ? allTargets.filter(t => t.id_rombel === selectedRombel)
    : allTargets;
  const targetNames = Array.from(new Set(targetsForColumns.map(t => t.nama_target)));

  const getRombelName = (id: string) => allRombel.find(r => r.id_rombel === id)?.nama_rombel || '-';
  const getDesaName = (id: string) => allDesa.find(d => d.id_desa === id)?.nama_desa || '-';
  const getKelompokName = (id: string) => allKelompok.find(k => k.id_kelompok === id)?.nama_kelompok || '-';

  // Group by Rombel
  const santriByRombel = allRombel.reduce((acc, rombel) => {
    const santriInRombel = filteredSantri.filter(s => s.id_rombel === rombel.id_rombel);
    if (santriInRombel.length > 0) {
      acc[rombel.nama_rombel] = santriInRombel;
    }
    return acc;
  }, {} as Record<string, Santri[]>);

  return (
    <div className="max-w-7xl mx-auto space-y-10" id="laporan-page">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-brand-primary mb-2">Laporan & Statistik</h2>
          <p className="text-gray-500">Visualisasi pencapaian target generus</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Total Generus', value: totalSantriStats, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Generus Lapor', value: santriWithReportsCount, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Rata Kehadiran', value: `${attendancePercentage}%`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Rata Capaian', value: `${achievementPercentage}%`, icon: TargetIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Catatan Terbanyak', value: mostFrequentCategory, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white p-6 rounded-[32px] border border-brand-accent/50 flex items-center gap-6"
          >
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
               <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-black text-brand-primary leading-none mt-1">{stat.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[40px] border border-brand-accent/50 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-brand-accent/30 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-brand-primary">Tabel Capaian Generus</h3>
           </div>

           {/* Filter Bar */}
           <div className="flex flex-wrap gap-4 items-end">
              <div className="w-full md:w-64 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari nama generus..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-brand-bg/50 border border-brand-accent/50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/10 appearance-none"
                />
              </div>

              <div className="flex-1 min-w-[150px]">
                <div className="flex items-center gap-2 mb-1 pl-1">
                  <MapPin size={10} className="text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Desa</span>
                </div>
                <select 
                  value={effectiveDesa}
                  onChange={(e) => setSelectedDesa(e.target.value)}
                  disabled={isLoggedIn && currentUser?.role === 'pengurus'}
                  className="w-full bg-brand-bg/50 border border-brand-accent/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-primary/10 appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Semua Desa</option>
                  {allDesa.map(d => <option key={d.id_desa} value={d.id_desa}>{d.nama_desa}</option>)}
                </select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <div className="flex items-center gap-2 mb-1 pl-1">
                  <UsersIcon size={10} className="text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Kelompok</span>
                </div>
                <select 
                  value={effectiveKelompok}
                  onChange={(e) => setSelectedKelompok(e.target.value)}
                  disabled={isLoggedIn && currentUser?.role === 'pengurus'}
                  className="w-full bg-brand-bg/50 border border-brand-accent/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-primary/10 appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Semua Kelompok</option>
                  {allKelompok.map(k => <option key={k.id_kelompok} value={k.id_kelompok}>{k.nama_kelompok}</option>)}
                </select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <div className="flex items-center gap-2 mb-1 pl-1">
                  <GraduationCap size={10} className="text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Rombel</span>
                </div>
                <select 
                  value={selectedRombel}
                  onChange={(e) => setSelectedRombel(e.target.value)}
                  className="w-full bg-brand-bg/50 border border-brand-accent/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-primary/10 appearance-none"
                >
                  <option value="">Semua Rombel</option>
                  {allRombel.map(r => <option key={r.id_rombel} value={r.id_rombel}>{r.nama_rombel}</option>)}
                </select>
              </div>

              <button 
                onClick={() => { 
                  if (!(isLoggedIn && currentUser?.role === 'pengurus')) {
                    setSelectedDesa(''); 
                    setSelectedKelompok(''); 
                  }
                  setSelectedRombel(''); 
                  setSearchTerm(''); 
                  setSelectedMonth(currentMonth);
                  setSelectedYear(currentYear);
                }}
                className="px-4 py-2 text-[10px] font-bold text-gray-400 hover:text-brand-primary transition-colors uppercase tracking-widest bg-brand-bg/50 rounded-xl border border-brand-accent/50"
              >
                Reset
              </button>
           </div>

           <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[150px]">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Bulan</div>
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-brand-bg/50 border border-brand-accent/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none"
                >
                  <option value="">Semua Bulan</option>
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Tahun</div>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-brand-bg/50 border border-brand-accent/50 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none"
                >
                  <option value="">Semua Tahun</option>
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-bg/50">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unit / Generus</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">H</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">S</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">I</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">A</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">% Hadir</th>
                {targetNames.map(name => (
                  <th key={name} className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">{name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-accent/30 font-medium text-sm text-brand-primary">
              {Object.entries(santriByRombel).map(([rombelName, santris]: [string, Santri[]]) => (
                <React.Fragment key={rombelName}>
                  <tr className="bg-brand-bg/20">
                    <td colSpan={6 + targetNames.length} className="px-8 py-3 bg-brand-accent/10 border-y border-brand-accent/20">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={14} className="text-brand-primary/60" />
                        <span className="text-xs font-black uppercase tracking-widest text-brand-primary">{rombelName}</span>
                        <span className="text-[10px] text-gray-400 font-bold ml-auto">{santris.length} Generus</span>
                      </div>
                    </td>
                  </tr>
                  {santris.map((santri: Santri) => (
                    <tr key={santri.id_santri} className="hover:bg-brand-bg/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-brand-primary">{santri.nama_santri}</span>
                          <span className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">
                            {getKelompokName(santri.id_kelompok)} • {getDesaName(santri.id_desa)}
                          </span>
                        </div>
                      </td>
                      {(() => {
                        const santriReports = allLaporan.filter(l => {
                          const matchesSantri = l.id_santri === santri.id_santri;
                          if (!matchesSantri) return false;
                          
                          if (selectedYear || selectedMonth) {
                            const [year, month] = (l.tanggal_laporan || '').split('-');
                            const matchesYear = selectedYear ? year === selectedYear : true;
                            const matchesMonth = selectedMonth ? month === selectedMonth : true;
                            return matchesYear && matchesMonth;
                          }
                          return true;
                        });

                        // For attendance, we usually count unique dates to avoid double-counting if there are multiple targets per day
                        const uniqueDates = Array.from(new Set(santriReports.map(l => l.tanggal_laporan)));
                        const dailyStats = uniqueDates.map(date => {
                          // Find reports for this date, pick the first one's attendance (assuming same for the day)
                          const report = santriReports.find(l => l.tanggal_laporan === date);
                          return {
                            h: report?.hadir || 0,
                            s: report?.sakit || 0,
                            i: report?.izin || 0,
                            a: report?.alfa || 0
                          };
                        });

                        const sHadir = dailyStats.reduce((acc, curr) => acc + curr.h, 0);
                        const sSakit = dailyStats.reduce((acc, curr) => acc + curr.s, 0);
                        const sIzin = dailyStats.reduce((acc, curr) => acc + curr.i, 0);
                        const sAlfa = dailyStats.reduce((acc, curr) => acc + curr.a, 0);
                        const sTotal = sHadir + sSakit + sIzin + sAlfa;
                        const sPercentage = sTotal > 0 ? Math.round((sHadir / sTotal) * 100) : 0;

                        return (
                          <>
                            <td className="px-8 py-5 text-center font-bold text-green-600">{sHadir}</td>
                            <td className="px-8 py-5 text-center font-bold text-blue-600">{sSakit}</td>
                            <td className="px-8 py-5 text-center font-bold text-orange-600">{sIzin}</td>
                            <td className="px-8 py-5 text-center font-bold text-red-600">{sAlfa}</td>
                            <td className="px-8 py-5 text-center">
                               <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                 sPercentage > 80 ? 'bg-green-50 text-green-700' : 
                                 sPercentage > 50 ? 'bg-orange-50 text-orange-700' : 
                                 'bg-red-50 text-red-700'
                               }`}>
                                 {sPercentage}%
                               </span>
                            </td>
                          </>
                        );
                      })()}
                      {targetNames.map(name => {
                        const l = allLaporan.find(x => {
                          const matchesSantri = x.id_santri === santri.id_santri;
                          const matchesTarget = x.nama_target === name;
                          if (!matchesSantri || !matchesTarget) return false;

                          if (selectedYear || selectedMonth) {
                            const [year, month] = (x.tanggal_laporan || '').split('-');
                            const matchesYear = selectedYear ? year === selectedYear : true;
                            const matchesMonth = selectedMonth ? month === selectedMonth : true;
                            return matchesYear && matchesMonth;
                          }
                          return true;
                        });
                        return (
                          <td key={name} className="px-8 py-5 text-center">
                            {l ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-sm font-black text-brand-primary">
                                  {Math.round((l.pencapaian_target / l.angka_target) * 100)}%
                                </span>
                                <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-brand-primary" 
                                    style={{ width: `${Math.min((l.pencapaian_target / l.angka_target) * 100, 100)}%` }} 
                                  />
                                </div>
                                <span className="text-[9px] text-gray-400 font-bold">
                                  {l.pencapaian_target} / {l.angka_target} {allTargets.find(t => t.id_target === l.id_target)?.satuan || 'Poin'}
                                </span>
                              </div>
                            ) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              {filteredSantri.length === 0 && (
                <tr>
                  <td colSpan={6 + targetNames.length} className="px-8 py-20 text-center text-gray-400 italic">
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
