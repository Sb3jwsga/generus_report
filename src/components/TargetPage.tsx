import React from 'react';
import { Hash, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { useData } from '../contexts/DataContext';

export default function TargetPage() {
  const { targets: allTargets, rombel: allRombel } = useData();

  const getRombelName = (id: string) => {
    return allRombel.find(r => r.id_rombel === id)?.nama_rombel || 'Unknown';
  };

  // Group targets by rombel
  const rombelIds = Array.from(new Set(allTargets.map(t => t.id_rombel)));

  return (
    <div className="max-w-7xl mx-auto space-y-8" id="target-page">
      <header>
        <h2 className="text-3xl font-serif text-brand-primary mb-2">Target Angka</h2>
        <p className="text-gray-500">Target kuantitatif per rombongan belajar.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {rombelIds.length > 0 ? rombelIds.map((rombelId: string, i) => {
          const targets = allTargets.filter(t => t.id_rombel === rombelId);
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              key={rombelId}
              className="bg-white p-8 rounded-[40px] shadow-sm border border-brand-accent/50"
            >
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="text-brand-primary" size={24} />
                 </div>
                 <h3 className="text-2xl font-serif font-bold text-brand-primary">{getRombelName(rombelId)}</h3>
              </div>

              <div className="space-y-4">
                {targets.map((target) => (
                  <div key={target.id_target} className="flex items-center justify-between p-4 bg-brand-bg rounded-2xl border border-brand-accent/30 group hover:border-brand-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-brand-primary shadow-sm">
                        <Hash size={14} />
                      </div>
                      <span className="font-bold text-gray-700">{target.nama_target}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-brand-primary">{target.angka_target}</span>
                      <span className="ml-1 text-[10px] font-bold text-gray-400 uppercase">{target.satuan || 'Poin'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        }) : (
          <div className="col-span-full py-20 text-center text-gray-400 italic">
             Belum ada data target yang ditambahkan...
          </div>
        )}
      </div>
    </div>
  );
}
