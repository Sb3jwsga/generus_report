import { Santri } from '../types';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useData } from '../contexts/DataContext';
import { formatDate } from '../lib/utils';

interface SantriDetailProps {
  santri: Santri;
  onBack: () => void;
}

export default function SantriDetail({ santri, onBack }: SantriDetailProps) {
  const { rombel: allRombel, desa: allDesa, kelompok: allKelompok } = useData();
  const rombelName = allRombel.find(r => r.id_rombel === santri.id_rombel)?.nama_rombel || '-';
  const desaName = allDesa.find(d => d.id_desa === santri.id_desa)?.nama_desa || '-';
  const kelompokName = allKelompok.find(k => k.id_kelompok === santri.id_kelompok)?.nama_kelompok || '-';

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8 pb-10"
      id={`santri-detail-${santri.id_santri}`}
    >
      <header className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-brand-primary transition-colors font-medium text-sm"
        >
          <ArrowLeft size={18} />
          Kembali ke Daftar
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-brand-accent/30 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-32 bg-brand-primary/5" />
             <div className="relative z-10 pt-4">
                <div className="w-32 h-32 mx-auto rounded-[32px] bg-brand-accent/30 flex items-center justify-center mb-6 overflow-hidden">
                   <UserIcon size={64} className="text-brand-primary opacity-30" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-brand-primary">{santri.nama_santri}</h3>
                <p className="text-gray-500 italic mb-2">{rombelName}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-full">
                  Lahir: {formatDate(santri.tanggal_lahir)}
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-8 rounded-[40px] shadow-sm border border-brand-accent/30">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-xl font-serif font-bold text-brand-primary">Profil Generus</h4>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Nama Lengkap</label>
                   <p className="text-lg font-bold text-brand-primary">{santri.nama_santri}</p>
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Unit Rombel</label>
                   <p className="text-lg font-bold text-brand-primary">{rombelName}</p>
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Kelompok</label>
                   <p className="text-lg font-bold text-brand-primary">{kelompokName}</p>
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Desa</label>
                   <p className="text-lg font-bold text-brand-primary">{desaName}</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
