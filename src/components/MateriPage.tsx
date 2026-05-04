import React from 'react';
import { BookOpen, Calendar, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { useData } from '../contexts/DataContext';

export default function MateriPage() {
  const { materi: allMateri, rombel: allRombel } = useData();
  
  const getRombelName = (id: string) => {
    return allRombel.find(r => r.id_rombel === id)?.nama_rombel || 'Unknown';
  };

  // Group by rombel
  const rombels = Array.from(new Set(allMateri.map(m => m.id_rombel)));

  return (
    <div className="max-w-7xl mx-auto space-y-8" id="materi-page">
      <header>
        <h2 className="text-3xl font-serif text-brand-primary mb-2">Materi Pembelajaran</h2>
        <p className="text-gray-500">Daftar materi per rombongan belajar (Rombel).</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rombels.length > 0 ? rombels.map((rombelId: any, i) => {
          const materiList = allMateri.filter(m => m.id_rombel === rombelId);
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={rombelId}
              className="bg-white p-8 rounded-[40px] shadow-sm border border-brand-accent/50 group hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-brand-accent rounded-2xl flex items-center justify-center">
                  <BookOpen className="text-brand-primary" size={24} />
                </div>
                <span className="px-3 py-1 bg-brand-bg text-brand-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-accent/50">
                  {getRombelName(rombelId)}
                </span>
              </div>

              <h3 className="text-2xl font-serif font-bold text-brand-primary mb-6">Materi {getRombelName(rombelId)}</h3>
              
              <div className="space-y-8">
                {Object.entries(
                  materiList.reduce((acc, m) => {
                    if (!acc[m.jenis_materi]) acc[m.jenis_materi] = [];
                    acc[m.jenis_materi].push(m);
                    return acc;
                  }, {} as Record<string, typeof materiList>)
                ).map(([jenis, list]: [string, any], idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-brand-accent group-hover:border-brand-primary transition-colors">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{jenis}</p>
                    <div className="flex flex-wrap gap-2">
                      {list.map((m: any, i: number) => (
                        <span key={i} className="text-xs text-gray-700 bg-brand-bg/50 px-3 py-1.5 rounded-lg border border-brand-accent/30 font-medium">
                          {m.nama_materi}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-brand-accent/30 flex items-center justify-between text-brand-secondary">
                 <div className="flex items-center gap-2">
                   <Calendar size={14} className="opacity-50" />
                   <span className="text-[10px] font-bold uppercase">Update Aktif</span>
                 </div>
                 <Info size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          );
        }) : (
          <div className="col-span-full py-20 text-center text-gray-400 italic">
            Belum ada materi yang ditambahkan...
          </div>
        )}
      </div>
    </div>
  );
}
