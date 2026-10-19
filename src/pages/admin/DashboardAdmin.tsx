import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Icon } from '../../components/ui/Icon';
import { Combobox } from '../../components/ui/Combobox';
import { Spinner } from '../../components/ui/Spinner';
import { BULAN_LIST } from '../../utils/constants';

export default function DashboardAdmin() {
  const [stats, setStats] = useState({
    desa: 0, kelompok: 0, rombel: 0, generus: 0, targetBulanan: 0, targetRaport: 0, materi: 0, user: 0,
  });
  const [kelompokList, setKelompokList] = useState<any[]>([]);
  const [generusList, setGenerusList] = useState<any[]>([]);
  const [laporanRaw, setLaporanRaw] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [filterBulan, setFilterBulan] = useState(BULAN_LIST[new Date().getMonth()]);
  const [filterTahun, setFilterTahun] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      const tables = ['desa', 'kelompok', 'rombel', 'generus', 'target_bulanan', 'target_raport', 'materi', 'user'];
      const results = await Promise.all(
        tables.map((t) => supabase.from(t).select('*', { count: 'exact', head: true }))
      );
      setStats({
        desa: results[0].count ?? 0,
        kelompok: results[1].count ?? 0,
        rombel: results[2].count ?? 0,
        generus: results[3].count ?? 0,
        targetBulanan: results[4].count ?? 0,
        targetRaport: results[5].count ?? 0,
        materi: results[6].count ?? 0,
        user: results[7].count ?? 0,
      });
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchChart = async () => {
      setChartLoading(true);
      const [k, g, l] = await Promise.all([
        supabase.from('kelompok').select('id_kelompok, nama_kelompok').order('nama_kelompok'),
        supabase.from('generus').select('id_generus, id_kelompok'),
        supabase.from('laporan_bulanan').select('id_santri, tanggal_laporan'),
      ]);
      setKelompokList(k.data || []);
      setGenerusList(g.data || []);
      setLaporanRaw(l.data || []);
      setChartLoading(false);
    };
    fetchChart();
  }, []);

  // Tahun filter mengikuti tahun yang ada di tanggal_laporan.
  const tahunOptions = [...new Set(laporanRaw.map((l) => (l.tanggal_laporan || '').slice(0, 4)).filter(Boolean))]
    .sort()
    .reverse()
    .map((t) => ({ value: t, label: t }));

  useEffect(() => {
    if (tahunOptions.length && !tahunOptions.some((o) => o.value === filterTahun)) {
      setFilterTahun(tahunOptions[0].value);
    }
  }, [tahunOptions, filterTahun]);

  const cards = [
    { label: 'Desa', value: stats.desa, icon: 'holiday_village', to: '/admin/desa' },
    { label: 'Kelompok', value: stats.kelompok, icon: 'groups', to: '/admin/kelompok' },
    { label: 'Rombel', value: stats.rombel, icon: 'school', to: '/admin/rombel' },
    { label: 'Generus', value: stats.generus, icon: 'diversity_3', to: '#' },
    { label: 'Target Bulanan', value: stats.targetBulanan, icon: 'assessment', to: '/admin/target-bulanan' },
    { label: 'Target Raport', value: stats.targetRaport, icon: 'grade', to: '/admin/target-raport' },
    { label: 'Materi', value: stats.materi, icon: 'menu_book', to: '/admin/materi' },
    { label: 'User', value: stats.user, icon: 'person', to: '/admin/user' },
  ];

  const bulanOptions = BULAN_LIST.map((b) => ({ value: b, label: b }));
  const bulanIndex = BULAN_LIST.indexOf(filterBulan) + 1;
  const bulanPrefix = `${filterTahun}-${String(bulanIndex).padStart(2, '0')}`;
  const reportedIds = new Set(
    laporanRaw.filter((l) => (l.tanggal_laporan || '').startsWith(bulanPrefix)).map((l) => l.id_santri)
  );
  const kelompokStats = kelompokList.map((k) => {
    const generusKelompok = generusList.filter((g) => g.id_kelompok === k.id_kelompok);
    return {
      id: k.id_kelompok,
      nama: k.nama_kelompok,
      total: generusKelompok.length,
      reported: generusKelompok.filter((g) => reportedIds.has(g.id_generus)).length,
    };
  });
  const maxTotal = Math.max(1, ...kelompokStats.map((k) => k.total));
  const barWidth = (value: number) => `${Math.round((value / maxTotal) * 100)}%`;

  return (
    <DashboardLayout>
      <PageHeader
        badge="Panel Admin"
        title="Dashboard Admin"
        description="Kelola master data, target, materi, dan pengguna sistem."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} />
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
          <div>
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Icon name="bar_chart" size={20} className="text-primary" />
              Jumlah Generus & Laporan Bulanan per Kelompok
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Total generus dibandingkan dengan yang sudah dilaporkan pada bulan terpilih.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full lg:w-80 shrink-0">
            <Combobox options={bulanOptions} value={filterBulan} onChange={setFilterBulan} placeholder="Bulan" clearable={false} />
            <Combobox options={tahunOptions} value={filterTahun} onChange={setFilterTahun} placeholder="Tahun" clearable={false} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-5 text-xs text-gray-600">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-surface-container-highest" aria-hidden="true" /> Total Generus
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-primary" aria-hidden="true" /> Sudah Dilaporkan
          </span>
        </div>

        {chartLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : kelompokStats.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">Belum ada data kelompok.</p>
        ) : (
          <div className="space-y-5">
            {kelompokStats.map((k) => (
              <div key={k.id}>
                <div className="flex items-center justify-between gap-3 text-sm mb-2">
                  <span className="font-semibold text-gray-800 truncate">{k.nama}</span>
                  <span className="text-xs text-gray-500 shrink-0 tabular-nums">
                    {k.reported} / {k.total} dilaporkan
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-surface-container-highest" style={{ width: barWidth(k.total) }} />
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: barWidth(k.reported) }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="bolt" size={20} className="text-primary" />
          Aksi Cepat
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/desa" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90">
            <Icon name="add" size={18} /> Tambah Desa
          </Link>
          <Link to="/admin/user" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary-container text-gray-900 text-sm font-bold hover:bg-secondary-fixed">
            <Icon name="person_add" size={18} /> Tambah User
          </Link>
          <Link to="/admin/target-bulanan" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <Icon name="assessment" size={18} /> Kelola Target
          </Link>
          <Link to="/admin/semester-config" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <Icon name="calendar_month" size={18} /> Pengaturan Semester
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
