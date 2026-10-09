import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import { Logo } from '../../components/ui/Logo';
import { Icon } from '../../components/ui/Icon';

export default function PublicPortal() {
  const [totalGenerus, setTotalGenerus] = useState<number | null>(null);

  useEffect(() => {
    supabase.from('generus').select('*', { count: 'exact', head: true }).then(({ count }) => {
      setTotalGenerus(count ?? 0);
    });
  }, []);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="h-16 max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between">
          <Logo width={160} height={48} />
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Icon name="login" size={18} />
              Masuk Sistem
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full pt-16">
        <section className="relative bg-gradient-to-r from-[#1e63b2] via-[#1e63b2] to-[#15457f] text-white overflow-hidden py-14 lg:py-20">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern height="60" id="islamic-geom" patternUnits="userSpaceOnUse" width="60">
                  <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="30" cy="30" fill="none" r="10" stroke="currentColor" strokeWidth="1.5" />
                </pattern>
              </defs>
              <rect fill="url(#islamic-geom)" height="100%" width="100%" />
            </svg>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 lg:px-6 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md mb-4">
              <Icon name="verified" size={18} className="text-secondary-fixed" />
              <span className="text-xs tracking-wider uppercase text-secondary-fixed font-semibold">Transparansi Pendidikan Generus</span>
            </div>
            <h1 className="text-3xl lg:text-5xl max-w-4xl leading-tight font-extrabold drop-shadow-sm">
              Portal Informasi & Perkembangan Generus
            </h1>
            <p className="text-base lg:text-lg text-white/80 max-w-2xl mt-3 mb-8 leading-relaxed">
              Pantau transparansi capaian belajar, materi kurikulum, dan rekapitulasi raport generus secara terbuka dan mudah diakses oleh orang tua.
            </p>

            <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-2 p-2 rounded-xl bg-white shadow-xl">
              <div className="relative flex-1 flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <Icon name="search" size={20} />
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-gray-900 text-sm focus:outline-none"
                  placeholder="Ketik Nama Generus untuk cek raport..."
                />
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-secondary-container hover:bg-secondary-fixed text-gray-900 text-sm font-semibold transition-all shadow-sm"
              >
                <Icon name="admin_panel_settings" size={20} />
                Login Pengurus
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/80 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Icon name="group" size={18} className="text-secondary-fixed" />
                <span>{totalGenerus === null ? 'Memuat...' : `${totalGenerus} Generus Terdaftar`}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Direktori Generus', desc: 'Data lengkap generus per rombel & kelompok', to: '/public/generus', icon: 'groups', bg: 'bg-primary' },
            { label: 'Pencapaian Bulanan', desc: 'Grafik capaian target bulanan', to: '/public/capaian', icon: 'assessment', bg: 'bg-secondary-container' },
            { label: 'Raport Semester', desc: 'Nilai raport semester transparan', to: '/public/raport', icon: 'school', bg: 'bg-primary' },
            { label: 'Materi Belajar', desc: 'Silabus & modul pembelajaran', to: '/public/materi', icon: 'menu_book', bg: 'bg-secondary-container' },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group border border-gray-100"
            >
              <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform ${item.bg.includes('secondary') ? 'text-gray-900' : 'text-white'}`}>
                <Icon name={item.icon} size={28} />
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{item.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Lihat <Icon name="arrow_forward" size={16} />
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t py-10 mt-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo width={160} height={48} />
          <p className="text-sm text-gray-500">© 2026 UbaiDev. Seluruh hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
