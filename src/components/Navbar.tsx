import React from 'react';
import { BookOpen, Users, Target, FileText, LogIn, LogOut, Menu, X, Settings, PlusCircle } from 'lucide-react';
import { User } from '../types';
import Logo from './Logo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  user: User | null;
}

export default function Navbar({ activeTab, setActiveTab, isLoggedIn, onLogout, user }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: 'santri', label: 'Generus', icon: Users },
    { id: 'materi', label: 'Materi', icon: BookOpen },
    { id: 'target', label: 'Target', icon: Target },
    { id: 'laporan', label: 'Laporan', icon: FileText },
  ];

  if (isLoggedIn) {
     menuItems.push({ id: 'buat-laporan', label: 'Buat Laporan', icon: PlusCircle });
     menuItems.push({ id: 'kelola', label: 'Kelola Generus', icon: Settings });
  }

  return (
    <>
      <nav className="bg-white border-b border-brand-accent shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => setActiveTab('santri')}
              >
                <Logo size={40} />
                <span className="text-xl font-serif font-bold text-brand-primary hidden sm:block">PPG Pelaihari</span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden lg:flex items-center gap-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === item.id 
                      ? 'bg-brand-accent text-brand-primary' 
                      : 'text-gray-500 hover:text-brand-primary hover:bg-brand-bg'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon size={16} />
                      {item.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {isLoggedIn && user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-right">
                    <p className="text-[10px] sm:text-xs font-bold text-brand-primary truncate max-w-[80px] sm:max-w-none">{user.nama_user}</p>
                    <p className="text-[8px] sm:text-[10px] text-gray-400 capitalize">{user.role}</p>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="hidden min-[400px]:block">Keluar</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setActiveTab('login')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'login'
                    ? 'bg-brand-primary text-white'
                    : 'bg-brand-accent text-brand-primary hover:opacity-90'
                  }`}
                >
                  <LogIn size={16} />
                  Login
                </button>
              )}

              {/* Mobile Header Menu (Optional Toggle) */}
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="hidden md:flex lg:hidden p-2 text-gray-500 hover:bg-brand-bg rounded-xl"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Tablet Dropdown Menu */}
        {isOpen && (
          <div className="hidden md:block lg:hidden border-t border-brand-accent bg-white px-4 py-2 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  activeTab === item.id 
                  ? 'bg-brand-accent text-brand-primary' 
                  : 'text-gray-500 hover:bg-brand-bg'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation - Highly Mobile Friendly */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-brand-accent px-2 py-2 z-[60] flex items-center justify-around">
        {menuItems.filter(item => ['santri', 'materi', 'target', 'laporan', 'buat-laporan'].includes(item.id)).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 p-2 min-w-[60px] transition-all relative ${
              activeTab === item.id ? 'text-brand-primary' : 'text-gray-400'
            }`}
          >
            {activeTab === item.id && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-primary rounded-full transition-all" />
            )}
            <item.icon size={20} />
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
        {isLoggedIn && (
           <button
             onClick={() => setActiveTab('kelola')}
             className={`flex flex-col items-center gap-1 p-2 min-w-[60px] transition-all relative ${
               activeTab === 'kelola' ? 'text-brand-primary' : 'text-gray-400'
             }`}
           >
             {activeTab === 'kelola' && (
               <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-primary rounded-full transition-all" />
             )}
             <Settings size={20} />
             <span className="text-[9px] font-black uppercase tracking-tighter">Profil Generus</span>
           </button>
        )}
      </div>
    </>
  );
}
