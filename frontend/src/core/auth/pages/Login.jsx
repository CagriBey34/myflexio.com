import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, CheckCircle2, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../../shared/store/authStore';
import api from '../../../shared/services/api';
import Button from '../../../shared/components/ui/Button';
import SEO from '../../../shared/components/SEO';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      const { user, accessToken, refreshToken } = response.data.data;
      login(user, accessToken, refreshToken);
      setStatus({ type: 'success', message: 'Giriş başarılı! Panelinize aktarılıyorsunuz.' });
      setTimeout(() => {
        if (user.role === 'uzman') navigate('/uzman/dashboard');
        else if (user.role === 'hasta') navigate('/hasta/dashboard');
        else if (user.role === 'admin') navigate('/admin/dashboard');
      }, 1500);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'E-posta veya şifre hatalı. Lütfen kontrol edin.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start sm:justify-center px-4 py-6 overflow-y-auto relative bg-white font-sans">
      <SEO
        title="Giriş Yap"
        description="MyFlexio hesabınıza giriş yapın. Uzman fizyoterapistlerle bağlantı kurun, randevu alın ve egzersiz programlarınıza ulaşın."
        canonical="https://myflexio.com/login"
      />

      {/* Arka plan blurlar */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#4ade80] blur-[120px] opacity-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-[#0f4c35] blur-[100px] opacity-5" />
      </div>

      {/* Bildirim popup */}
      <AnimatePresence>
        {status.type && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-4 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none"
          >
            <div className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl w-full max-w-sm
              ${status.type === 'success' ? 'bg-[#dcfce7] border-[#16a34a]/20 text-[#0a2e1a]' : 'bg-rose-50 border-rose-100 text-rose-900'}`}
            >
              <div className={`p-1.5 rounded-xl shrink-0 ${status.type === 'success' ? 'bg-[#16a34a] text-white' : 'bg-rose-500 text-white'}`}>
                {status.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-tight">{status.type === 'success' ? 'Hoş Geldiniz!' : 'Giriş Başarısız'}</p>
                <p className="text-xs font-medium opacity-80 mt-0.5 leading-snug">{status.message}</p>
              </div>
              <button onClick={() => setStatus({ type: null, message: '' })} className="p-1 hover:bg-black/5 rounded-lg transition-colors shrink-0">
                <XCircle size={18} className="opacity-40 hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo */}
      <Link to="/" className="relative z-10 mt-2 mb-6 sm:mb-0 sm:absolute sm:top-5 sm:left-5 flex items-center">
        <img src="/logo.png" alt="MyFlexio" className="h-9 sm:h-20 w-auto" />
      </Link>

      {/* Kart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white border border-gray-100 p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-green-900/5 w-full max-w-md relative z-10"
      >
        {/* Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#dcfce7] text-[#16a34a] mb-4">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0a2e1a] tracking-tight mb-1.5">
            Tekrar Hoş Geldiniz
          </h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            Sağlık yolculuğunuza devam etmek için giriş yapın.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* E-posta */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-posta Adresi</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#16a34a] transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-[#4ade80] focus:bg-white transition-all font-semibold text-[#0a2e1a] placeholder:text-gray-400 placeholder:font-normal text-sm min-h-[48px]"
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          {/* Şifre */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Şifre</label>
              <a href="#" className="text-[10px] font-bold text-[#16a34a] hover:text-[#0a2e1a] transition-colors">Şifremi Unuttum</a>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#16a34a] transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-[#4ade80] focus:bg-white transition-all font-semibold text-[#0a2e1a] placeholder:text-gray-400 placeholder:font-normal text-sm min-h-[48px]"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Giriş Butonu */}
          <div className="pt-4">
            <Button
              type="submit"
              loading={loading}
              className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all active:scale-[0.98] min-h-[52px]"
            >
              <LogIn size={17} />
              Giriş Yap
            </Button>
          </div>
        </form>

        {/* Alt Link */}
        <div className="mt-8 text-center pt-6 border-t border-gray-50">
          <p className="text-xs font-bold text-gray-400">
            Henüz üye değil misiniz?{' '}
            <Link
              to="/register"
              className="text-[#16a34a] underline underline-offset-4 decoration-2 decoration-[#4ade80]/40 hover:text-[#0a2e1a] ml-1 transition-colors inline-flex items-center gap-1"
            >
              Hemen Kaydol <ArrowRight size={13} />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
