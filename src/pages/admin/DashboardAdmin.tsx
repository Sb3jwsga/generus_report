import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Icon } from '../../components/ui/Icon';

export default function DashboardAdmin() {
  const [stats, setStats] = useState({
    desa: 0, kelompok: 0, rombel: 0, generus: 0, targetBulanan: 0, targetRaport: 0, materi: 0, user: 0,
  });

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
