import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, CheckCircle2, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../../shared/store/authStore';
import api from '../../../shared/services/api';
import Button from '../../../shared/components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // Bildirim State'i
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { user, accessToken, refreshToken } = response.data.data;

      // Auth store güncellemesi
      login(user, accessToken, refreshToken);

      setStatus({ type: 'success', message: 'Giriş başarılı! Panelinize aktarılıyorsunuz.' });

      // Role göre yönlendirme
      setTimeout(() => {
        if (user.role === 'uzman') {
          navigate('/uzman/dashboard');
        } else if (user.role === 'hasta') {
          navigate('/hasta/dashboard');
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard');
        }
      }, 1500);

    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'E-posta veya şifre hatalı. Lütfen kontrol edin.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100dvh-80px)] flex items-center justify-center px-4 py-8 overflow-hidden relative bg-white font-sans">
      
      {/* --- ARKA PLAN DEKORATİF BLURLAR --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#4ade80] blur-[120px] opacity-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#0f4c35] blur-[100px] opacity-5" />
      </div>

      {/* --- POPUP BİLDİRİMLER --- */}
      <AnimatePresence>
        {status.type && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none"
          >
            <div className={`pointer-events-auto flex items-center gap-4 p-5 rounded-3xl border shadow-2xl backdrop-blur-xl max-w-md w-full 
              ${status.type === 'success' ? 'bg-[#dcfce7] border-[#16a34a]/20 text-[#0a2e1a]' : 'bg-rose-50 border-rose-100 text-rose-900'}`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${status.type === 'success' ? 'bg-[#16a34a] text-white' : 'bg-rose-500 text-white'}`}>
                {status.type === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-black uppercase tracking-tight leading-tight">
                  {status.type === 'success' ? 'Hoş Geldiniz!' : 'Giriş Başarısız'}
                </p>
                <p className="text-xs font-bold opacity-80 mt-1">{status.message}</p>
              </div>
              <button 
                onClick={() => setStatus({ type: null, message: '' })}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors"
              >
                <XCircle size={20} className="opacity-40 hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- LOGIN KART --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-gray-100 p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-green-900/5 max-w-md w-full relative z-10"
      >
        {/* Logo & Header */}
        <div className="text-center mb-10 shrink-0">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#dcfce7] text-[#16a34a] mb-5">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[#0a2e1a] tracking-tight mb-2">
            Tekrar Hoş Geldiniz
          </h2>
          <p className="text-sm text-gray-500 font-medium px-2 leading-relaxed">
            Sağlık yolculuğunuza devam etmek için hesabınıza giriş yapın.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* E-posta */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">E-posta Adresi</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#16a34a] transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#4ade80] focus:bg-white transition-all font-bold text-[#0a2e1a] placeholder:text-gray-400 text-sm"
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          {/* Şifre */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Şifre</label>
              <a href="#" className="text-[10px] font-black text-[#16a34a] hover:text-[#0a2e1a] uppercase tracking-tighter transition-colors">Şifremi Unuttum</a>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#16a34a] transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#4ade80] focus:bg-white transition-all font-bold text-[#0a2e1a] placeholder:text-gray-400 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Giriş Butonu */}
          <div className="pt-6">
            <Button
              type="submit"
              loading={loading}
              className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all active:scale-95"
            >
              <LogIn size={18} />
              Giriş Yap
            </Button>
          </div>
        </form>

        {/* Alt Link */}
        <div className="mt-10 text-center pt-8 border-t border-gray-50">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Henüz üye değil misiniz? <br className="md:hidden" />
            <Link to="/register" className="text-[#16a34a] underline underline-offset-4 decoration-2 decoration-[#4ade80]/40 hover:text-[#0a2e1a] ml-1 transition-colors inline-flex items-center gap-1">
              Hemen Kaydol <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}