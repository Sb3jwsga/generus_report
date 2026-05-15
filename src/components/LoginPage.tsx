import React, { useState } from 'react';
import { BookOpen, AlertCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';
import { login } from '../services/apiService';
import Logo from './Logo';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(username, password);
      if (result && result.status === 'success') {
        onLoginSuccess(result.user);
      } else {
        setError(result?.message || 'Username atau password salah.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat masuk. Periksa koneksi internet.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4" id="login-page">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl shadow-brand-primary/10 border border-brand-accent/50"
      >
        <div className="text-center mb-10">
          <div className="mb-6 flex justify-center">
            <Logo size={80} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-brand-primary mb-2">Portal Pengajar</h2>
          <p className="text-gray-500 text-sm">Masuk untuk mengelola data dan laporan generus.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-brand-bg border border-brand-accent/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kata Sandi</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-brand-bg border border-brand-accent/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-primary transition-colors"
                id="toggle-password"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-2">
               <input type="checkbox" id="remember" className="w-4 h-4 rounded border-brand-accent text-brand-primary focus:ring-brand-primary" />
               <label htmlFor="remember" className="text-xs text-gray-500 cursor-pointer">Ingat saya</label>
             </div>
             <a href="#" className="text-xs font-bold text-brand-primary hover:underline">Lupa sandi?</a>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 animate-shake">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Memverifikasi...' : 'Masuk Sekarang'}
          </button>
        </form>

        <p className="mt-10 text-center text-[10px] text-gray-400 font-medium uppercase tracking-tighter uppercase">
          © 2024 PPG Pelaihari • Ubaidillah Dev
        </p>
      </motion.div>
    </div>
  );
}
