import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../ui/Icon';

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = user?.role === 'Admin' ? [
    { label: 'Dashboard', to: '/admin', icon: 'dashboard' },
    { label: 'Desa', to: '/admin/desa', icon: 'holiday_village' },
    { label: 'Kelompok', to: '/admin/kelompok', icon: 'groups' },
    { label: 'Rombel', to: '/admin/rombel', icon: 'school' },
  ] : [
    { label: 'Dashboard', to: '/pengurus', icon: 'dashboard' },
    { label: 'Generus', to: '/pengurus/generus', icon: 'groups' },
    { label: 'Laporan', to: '/pengurus/laporan-bulanan', icon: 'assessment' },
    { label: 'Raport', to: '/pengurus/laporan-raport', icon: 'school' },
  ];

  const isActive = (to: string) => {
    if (to === '/admin' || to === '/pengurus') return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-bottom-nav-height bg-white/95 backdrop-blur-xl border-t border-gray-100 z-40 flex items-center justify-around px-2">
      {navItems.map((item) => {
        const active = isActive(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center px-4 py-1.5 min-w-[64px] transition-all ${
              active
                ? 'bg-secondary-container text-gray-900 font-semibold rounded-full shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <Icon name={item.icon} size={22} filled={active} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
