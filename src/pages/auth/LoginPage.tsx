import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/ui/Logo';
import { Icon } from '../../components/ui/Icon';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const loggedInUser = await login(username, password);
    if (loggedInUser) {
      navigate(loggedInUser.role === 'Admin' ? '/admin' : '/pengurus', { replace: true });
    } else {
      setError('Username atau password salah');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-center mb-6">
            <Logo width={180} height={54} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 text-center">Masuk ke Akun Anda</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6 text-center">Kelola data generus & laporan perkembangan</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icon name="person" size={20} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icon name="lock" size={20} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-error-container/50 text-error text-sm rounded-lg">
                <Icon name="error" size={18} />
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white rounded-lg px-4 py-3 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Memproses...</>
              ) : (
                <>
                  <Icon name="login" size={20} />
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium">
              <Icon name="arrow_back" size={16} />
              Kembali ke Portal Publik
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
