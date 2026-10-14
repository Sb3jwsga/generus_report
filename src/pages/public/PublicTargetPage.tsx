import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../api/supabase';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Spinner } from '../../components/ui/Spinner';
import { Icon } from '../../components/ui/Icon';
import { BULAN_LIST } from '../../utils/constants';

export default function PublicTargetPage() {
  const [targets, setTargets] = useState<any[]>([]);
  const [rombelList, setRombelList] = useState<any[]>([]);
  const [filterRombel, setFilterRombel] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [targetResult, rombelResult] = await Promise.all([
        supabase.from('target_bulanan').select('*, rombel(nama_rombel)'),
        supabase.from('rombel').select('*').order('nama_rombel'),
      ]);
      setTargets(targetResult.data || []);
      setRombelList(rombelResult.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const targetsByBulan = useMemo(() => {
    const filtered = targets.filter((target) => !filterRombel || target.id_rombel === filterRombel);
    return BULAN_LIST.map((bulan) => ({
      bulan,
      targets: filtered
        .filter((target) => target.bulan_target === bulan)
        .sort((a, b) => (a.rombel?.nama_rombel || '').localeCompare(b.rombel?.nama_rombel || '')),
    })).filter((group) => group.targets.length > 0);
  }, [filterRombel, targets]);

  if (loading) {
    return <PublicLayout><div className="flex justify-center p-12"><Spinner size="lg" /></div></PublicLayout>;
  }

  return (
    <PublicLayout>
      <div className="relative w-full rounded-2xl bg-gradient-to-br from-[#1e63b2] to-[#15457f] text-white p-6 lg:p-8 mb-6 overflow-hidden shadow-md">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-gray-900 text-[11px] font-bold w-fit shadow-sm mb-3">
              <Icon name="verified" size={14} /> Target Capaian Generus
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold">Target Bulanan per Rombel</h1>
            <p className="text-sm text-white/80 mt-2 leading-relaxed">Lihat target capaian setiap rombel yang disusun berurutan dari Januari hingga Desember.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center gap-3 min-w-[170px]">
            <div className="w-10 h-10 rounded-lg bg-secondary-container text-gray-900 flex items-center justify-center"><Icon name="flag" size={22} /></div>
            <div><p className="text-xl font-extrabold leading-tight">{targets.length}</p><p className="text-[11px] text-white/70">Target Bulanan</p></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider"><Icon name="filter_list" size={16} /> Jenjang Rombel:</div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFilterRombel('')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${!filterRombel ? 'bg-secondary-container text-gray-900 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}>Semua Jenjang</button>
          {rombelList.map((rombel) => (
            <button key={rombel.id_rombel} onClick={() => setFilterRombel(filterRombel === rombel.id_rombel ? '' : rombel.id_rombel)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filterRombel === rombel.id_rombel ? 'bg-secondary-container text-gray-900 shadow-sm font-bold' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}>{rombel.nama_rombel}</button>
          ))}
        </div>
      </div>

      {targetsByBulan.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400"><Icon name="flag" size={32} /></div>
          <p className="font-semibold text-gray-900">{targets.length === 0 ? 'Belum ada target' : 'Tidak ada target untuk rombel ini'}</p>
          <p className="text-sm text-gray-500 mt-1">Pilih rombel lain atau coba lagi nanti.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {targetsByBulan.map(({ bulan, targets: bulanTargets }) => (
            <section key={bulan}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center"><Icon name="calendar_month" size={21} /></div>
                <div><h2 className="font-extrabold text-gray-900">{bulan}</h2><p className="text-xs text-gray-500">{bulanTargets.length} target capaian</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bulanTargets.map((target) => (
                  <article key={target.id_target_bulan} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center shrink-0"><Icon name="flag" size={22} /></div>
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-[11px] font-bold">{target.rombel?.nama_rombel || 'Umum'}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mt-4">{target.nama_target}</h3>
                    <p className="text-sm text-gray-500 mt-1">Target: <span className="font-bold text-primary">{target.jumlah_target} {target.satuan_target}</span></p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PublicLayout>
  );
}
