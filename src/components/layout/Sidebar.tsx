import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../ui/Logo';
import { Icon } from '../ui/Icon';

interface SidebarProps {
  isMobile?: boolean;
  onToggleMobile?: () => void;
}

export function Sidebar({ isMobile = false, onToggleMobile }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menus = user?.role === 'Admin' ? [
    { label: 'Dashboard', to: '/admin', icon: 'dashboard' },
    { label: 'Data Desa', to: '/admin/desa', icon: 'holiday_village' },
    { label: 'Data Kelompok', to: '/admin/kelompok', icon: 'groups' },
    { label: 'Data Rombel', to: '/admin/rombel', icon: 'school' },
    { label: 'Kelola Generus', to: '/admin/generus', icon: 'person_add' },
    { label: 'Manajemen User', to: '/admin/user', icon: 'person' },
    { label: 'Target Bulanan', to: '/admin/target-bulanan', icon: 'assessment' },
    { label: 'Target Raport', to: '/admin/target-raport', icon: 'grade' },
    { label: 'Materi', to: '/admin/materi', icon: 'menu_book' },
    { label: 'Kategori Catatan', to: '/admin/kategori-catatan', icon: 'label' },
    { label: 'Pengaturan Semester', to: '/admin/semester-config', icon: 'calendar_month' },
  ] : [
    { label: 'Dashboard', to: '/pengurus', icon: 'dashboard' },
    { label: 'Data Generus', to: '/pengurus/generus', icon: 'groups' },
    { label: 'Laporan Bulanan', to: '/pengurus/laporan-bulanan', icon: 'assessment' },
    { label: 'Raport Semester', to: '/pengurus/laporan-raport', icon: 'school' },
  ];

  const isActive = (to: string) => {
    if (to === '/admin' || to === '/pengurus') return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <>
      {isMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onToggleMobile}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-full w-sidebar-width bg-primary-container z-50 flex-col justify-between py-space-lg shadow-lg transition-transform duration-300 flex ${
          isMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-space-lg px-space-md overflow-y-auto">
          <div className="flex items-center justify-between px-space-xs">
            <Logo width={150} height={44} />
            <button onClick={onToggleMobile} className="lg:hidden text-white/80 hover:text-white">
              <Icon name="close" size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {menus.map((menu) => {
              const active = isActive(menu.to);
              return (
                <Link
                  key={menu.to}
                  to={menu.to}
                  onClick={isMobile ? onToggleMobile : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                    active
                      ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
                  }`}
                >
                  <Icon name={menu.icon} size={20} filled={active} />
                  <span>{menu.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-space-md mt-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors font-medium"
          >
            <Icon name="logout" size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
