import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { Icon } from '../ui/Icon';

interface PublicLayoutProps {
  children: ReactNode;
}

const tabs = [
  { label: 'Direktori Generus', to: '/public/generus', icon: 'groups' },
  { label: 'Pencapaian Bulanan', to: '/public/capaian', icon: 'assessment' },
  { label: 'Raport Semester', to: '/public/raport', icon: 'school' },
  { label: 'Materi Belajar', to: '/public/materi', icon: 'menu_book' },
];

export function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="h-16 max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between">
          <Link to="/">
            <Logo width={150} height={45} />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                location.pathname === '/'
                  ? 'bg-surface-container-high text-primary font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Motitor Generus
            </Link>
          </nav>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Icon name="login" size={18} />
            <span className="hidden sm:inline">Masuk Sistem</span>
          </Link>
        </div>
      </header>

      <main className="w-full pt-16">
        <section className="bg-white border-b border-gray-100 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="flex items-center overflow-x-auto gap-2 py-3">
              {tabs.map((tab) => {
                const active = location.pathname === tab.to;
                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                      active
                        ? 'bg-primary text-white font-semibold shadow-sm'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon name={tab.icon} size={18} filled={active} />
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 w-full">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t py-10 mt-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo width={150} height={45} />
          <p className="text-sm text-gray-500">© 2026 UbaiDev. Seluruh hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
