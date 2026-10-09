import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public
import PublicPortal from './pages/public/PublicPortal';
import PublicGenerusPage from './pages/public/PublicGenerusPage';
import PublicCapaianPage from './pages/public/PublicCapaianPage';
import PublicRaportPage from './pages/public/PublicRaportPage';
import PublicMateriPage from './pages/public/PublicMateriPage';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Admin
import DashboardAdmin from './pages/admin/DashboardAdmin';
import DesaPage from './pages/admin/DesaPage';
import KelompokPage from './pages/admin/KelompokPage';
import RombelPage from './pages/admin/RombelPage';
import AdminGenerusPage from './pages/admin/GenerusPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import KategoriCatatanPage from './pages/admin/KategoriCatatanPage';
import TargetBulananPage from './pages/admin/TargetBulananPage';
import TargetRaportPage from './pages/admin/TargetRaportPage';
import MateriPage from './pages/admin/MateriPage';
import SemesterConfigPage from './pages/admin/SemesterConfigPage';

// Pengurus
import DashboardPengurus from './pages/pengurus/DashboardPengurus';
import GenerusPage from './pages/pengurus/GenerusPage';
import FormGenerusPage from './pages/pengurus/FormGenerusPage';
import DetailGenerusPage from './pages/pengurus/DetailGenerusPage';
import LaporanBulananPage from './pages/pengurus/LaporanBulananPage';
import FormLaporanBulananPage from './pages/pengurus/FormLaporanBulananPage';
import LaporanRaportPage from './pages/pengurus/LaporanRaportPage';
import FormLaporanRaportPage from './pages/pengurus/FormLaporanRaportPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicPortal />} />
          <Route path="/public/generus" element={<PublicGenerusPage />} />
          <Route path="/public/capaian" element={<PublicCapaianPage />} />
          <Route path="/public/raport" element={<PublicRaportPage />} />
          <Route path="/public/materi" element={<PublicMateriPage />} />

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DashboardAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/desa"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DesaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/kelompok"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <KelompokPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rombel"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <RombelPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/generus"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminGenerusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/kategori-catatan"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <KategoriCatatanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/target-bulanan"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <TargetBulananPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/target-raport"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <TargetRaportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/materi"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <MateriPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/semester-config"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <SemesterConfigPage />
              </ProtectedRoute>
            }
          />

          {/* Pengurus Routes */}
          <Route
            path="/pengurus"
            element={
              <ProtectedRoute allowedRoles={['Pengurus']}>
                <DashboardPengurus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengurus/generus"
            element={
              <ProtectedRoute allowedRoles={['Pengurus']}>
                <GenerusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengurus/generus/tambah"
            element={
              <ProtectedRoute allowedRoles={['Pengurus']}>
                <FormGenerusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengurus/generus/:id"
            element={
              <ProtectedRoute allowedRoles={['Pengurus']}>
                <DetailGenerusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengurus/laporan-bulanan"
            element={
              <ProtectedRoute allowedRoles={['Pengurus']}>
                <LaporanBulananPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengurus/laporan-bulanan/tambah"
            element={
              <ProtectedRoute allowedRoles={['Pengurus']}>
                <FormLaporanBulananPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengurus/laporan-raport"
            element={
              <ProtectedRoute allowedRoles={['Pengurus']}>
                <LaporanRaportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengurus/laporan-raport/tambah"
            element={
              <ProtectedRoute allowedRoles={['Pengurus']}>
                <FormLaporanRaportPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;