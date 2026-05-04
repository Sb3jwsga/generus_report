import React from 'react';
import Navbar from './components/Navbar';
import SantriList from './components/SantriList';
import SantriDetail from './components/SantriDetail';
import MateriPage from './components/MateriPage';
import TargetPage from './components/TargetPage';
import LaporanPage from './components/LaporanPage';
import LoginPage from './components/LoginPage';
import ManageSantriPage from './components/ManageSantriPage';
import BuatLaporanPage from './components/BuatLaporanPage';
import Logo from './components/Logo';
import { Santri, User } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from './contexts/DataContext';
import { BookOpen } from 'lucide-react';

export default function App() {
  const { loading: dataLoading } = useData();
  const [activeTab, setActiveTab] = React.useState('santri');
  const [selectedSantri, setSelectedSantri] = React.useState<Santri | null>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedSantri(null);
  };

  const handleLoginSuccess = (user: User) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    setActiveTab('laporan');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab('santri');
  };

  const renderContent = () => {
    if (selectedSantri) {
      return (
        <SantriDetail 
          santri={selectedSantri} 
          onBack={() => setSelectedSantri(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'santri':
        return <SantriList onSelectSantri={(s) => setSelectedSantri(s)} currentUser={currentUser} />;
      case 'materi':
        return <MateriPage />;
      case 'target':
        return <TargetPage />;
      case 'laporan':
        return (
          <LaporanPage 
            isLoggedIn={isLoggedIn} 
            currentUser={currentUser}
            onGoToLogin={() => setActiveTab('login')} 
          />
        );
      case 'kelola':
        return isLoggedIn ? <ManageSantriPage currentUser={currentUser} /> : null;
      case 'buat-laporan':
        return isLoggedIn ? <BuatLaporanPage currentUser={currentUser} /> : null;
      case 'login':
        return (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans relative" id="app-root">
      <AnimatePresence>
        {dataLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-bg flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative mb-8">
              <Logo size={80} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-serif text-brand-primary mb-2">Memuat Data</h2>
            <p className="text-gray-500 text-sm max-w-xs mx-auto animate-pulse">Menghubungkan ke Database...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        user={currentUser}
      />

      <main className="max-w-7xl mx-auto p-4 sm:p-8 pb-24 md:pb-8">
        <AnimatePresence mode="wait">
           <motion.div
             key={selectedSantri ? `detail-${selectedSantri.id}` : activeTab}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.2 }}
           >
             {renderContent()}
           </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mt-20 py-10 border-t border-brand-accent/50 text-center">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
          © 2025 monitoring progress generus • PPG Pelaihari • Ubaidillah Dev
        </p>
      </footer>
    </div>
  );
}

