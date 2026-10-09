import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import type { Generus } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { EmptyState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';

export default function DetailGenerusPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [generus, setGenerus] = useState<(Generus & any) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('generus').select('*, rombel(nama_rombel), kelompok(nama_kelompok)').eq('id_generus', id).single()
      .then(({ data }) => {
        setGenerus(data);
        setLoading(false);
      });
  }, [id]);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/pengurus/generus')}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-semibold mb-4"
        >
          <Icon name="arrow_back" size={16} /> Kembali ke Data Generus
        </button>

        {loading ? (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        ) : !generus ? (
          <EmptyState icon="person_search" title="Data tidak ditemukan" description="Generus yang dicari tidak ada atau sudah dihapus." />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-container p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-extrabold shrink-0">
                  {generus.nama_generus.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-extrabold truncate">{generus.nama_generus}</h1>
                  <p className="text-sm text-white/80 flex items-center gap-1 mt-1">
                    <Icon name={generus.jenis_kelamin === 'Laki-laki' ? 'male' : 'female'} size={14} />
                    {generus.jenis_kelamin}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Tanggal Lahir', value: new Date(generus.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), icon: 'cake' },
                { label: 'Rombel', value: generus.rombel?.nama_rombel || '-', icon: 'school' },
                { label: 'Kelompok', value: generus.kelompok?.nama_kelompok || '-', icon: 'groups' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                    <Icon name={item.icon} size={14} className="text-primary" />
                    {item.label}
                  </div>
                  <p className="font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="px-6 pb-6 flex flex-wrap gap-2">
              <Link
                to={`/pengurus/generus/tambah?id=${generus.id_generus}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Icon name="edit" size={18} /> Edit Data
              </Link>
              <Link
                to="/pengurus/laporan-bulanan/tambah"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90"
              >
                <Icon name="post_add" size={18} /> Input Laporan
              </Link>
              <Link
                to="/pengurus/laporan-raport/tambah"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary-container text-gray-900 text-sm font-bold hover:bg-secondary-fixed"
              >
                <Icon name="school" size={18} /> Input Raport
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
