import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../ui/Logo';
import { Icon } from '../ui/Icon';

interface HeaderProps {
  onToggleMobile?: () => void;
}

export function Header({ onToggleMobile }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-sidebar-width z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100">
      <div className="h-16 w-full px-4 lg:px-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button onClick={onToggleMobile} className="lg:hidden text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
            <Icon name="menu" size={24} />
          </button>
          <div className="lg:hidden">
            <Logo width={110} height={33} />
          </div>
          <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-semibold uppercase tracking-wide">
            {user?.role === 'Admin' ? 'Admin Pusat' : 'Pengurus'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-900 leading-tight">{user?.nama_user || user?.username}</span>
            <span className="text-xs text-gray-500 leading-tight">{user?.role}</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {(user?.nama_user || user?.username || '?').charAt(0).toUpperCase()}
          </div>
          <button
            onClick={logout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-error hover:bg-error-container transition-colors font-medium"
          >
            <Icon name="logout" size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
