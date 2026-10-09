import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Icon } from '../../components/ui/Icon';
import { BULAN_LIST } from '../../utils/constants';

export default function DashboardPengurus() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ generus: 0, laporanBulanIni: 0, raport: 0 });
  const currentMonth = BULAN_LIST[new Date().getMonth()];

  useEffect(() => {
    if (!user?.id_kelompok) return;
    const fetch = async () => {
      const [g, lb, lr] = await Promise.all([
        supabase.from('generus').select('*', { count: 'exact', head: true }).eq('id_kelompok', user.id_kelompok),
        supabase.from('laporan_bulanan').select('id_laporan, generus!inner(id_kelompok)', { count: 'exact', head: true }).eq('generus.id_kelompok', user.id_kelompok),
        supabase.from('laporan_raport').select('id_laporan_raport, generus!inner(id_kelompok)', { count: 'exact', head: true }).eq('generus.id_kelompok', user.id_kelompok),
      ]);
      setStats({ generus: g.count ?? 0, laporanBulanIni: lb.count ?? 0, raport: lr.count ?? 0 });
    };
    fetch();
  }, [user]);

  return (
    <DashboardLayout>
      <PageHeader
        badge="Pusat Data Terpadu"
        title="Dashboard Pengelolaan Generus"
        description={`Pantau capaian target mengaji, hafalan, dan akhlak generus per rombel. Bulan berjalan: ${currentMonth}.`}
        action={
          <>
            <Link to="/pengurus/laporan-bulanan/tambah" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 shadow-sm">
              <Icon name="post_add" size={18} /> Input Laporan
            </Link>
            <Link to="/pengurus/generus/tambah" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary-container text-gray-900 text-sm font-bold hover:bg-secondary-fixed shadow-sm">
              <Icon name="person_add" size={18} /> Tambah Generus
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Generus" value={stats.generus} sub="Di kelompok Anda" icon="diversity_3" />
        <StatCard label="Laporan Bulanan" value={stats.laporanBulanIni} sub={`Periode ${currentMonth}`} icon="fact_check" iconBg="bg-secondary-container/40" iconColor="text-gray-900" />
        <StatCard label="Laporan Raport" value={stats.raport} sub="Total diterbitkan" icon="school" />
      </div>

      <div className="mt-6 relative w-full rounded-xl overflow-hidden bg-primary-container text-white shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-fixed">Program Unggulan</span>
          <h2 className="font-bold text-lg mt-1">Evaluasi & Tasmi' Juz 30 Serentak</h2>
          <p className="text-sm text-white/80 mt-1 max-w-xl">Pastikan data mutaba'ah setiap halaqah telah terisi lengkap sebelum batas akhir pengisian.</p>
        </div>
        <Link to="/pengurus/laporan-bulanan" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary-container text-gray-900 text-sm font-bold hover:bg-secondary-fixed shrink-0">
          <Icon name="arrow_forward" size={18} /> Lihat Laporan
        </Link>
      </div>
    </DashboardLayout>
  );
}
