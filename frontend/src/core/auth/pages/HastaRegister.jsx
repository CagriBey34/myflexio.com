import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Lock, Phone, ArrowRight, 
  ArrowLeft, ShieldCheck, Check, XCircle, CheckCircle2 
} from 'lucide-react';
import Input from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';
import KVKKModal from '../../../shared/components/ui/KVKKModal';
import api from '../../../shared/services/api';

export default function HastaRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ad: '', soyad: '', email: '', password: '', passwordConfirm: '', telefon: '', kvkk_onay: false,
  });
  
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);
  const [kvkkModalOpen, setKvkkModalOpen] = useState(false);

  const handleNext = () => {
    if (step === 1 && (!formData.ad || !formData.soyad || !formData.email || !formData.telefon)) {
      setStatus({ type: 'error', message: 'Lütfen tüm kişisel bilgileri eksiksiz doldurun.' });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      setStatus({ type: 'error', message: 'Girdiğiniz şifreler birbiriyle eşleşmiyor.' });
      return;
    }
    if (!formData.kvkk_onay) {
      setStatus({ type: 'error', message: 'Devam etmek için KVKK metnini onaylamalısınız.' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/hasta/register', {
        ad: formData.ad, soyad: formData.soyad, email: formData.email,
        sifre: formData.password, sifreTekrar: formData.passwordConfirm,
        telefon: formData.telefon, kvkkOnay: formData.kvkk_onay,
      });
      
      setStatus({ type: 'success', message: 'Kaydınız başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz.' });
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Sunucuyla bağlantı kurulamadı. Lütfen tekrar deneyin.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden relative bg-white font-sans">
      
      {/* --- ARKA PLAN DEKORATİF BLURLAR --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#4ade80] blur-[120px] opacity-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#0f4c35] blur-[100px] opacity-5" />
      </div>

      {/* --- POPUP NOTIFICATIONS (AnimatePresence) --- */}
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
                  {status.type === 'success' ? 'Harika!' : 'Bir Sorun Var'}
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

      {/* --- FORM CONTAINER --- */}
      <motion.div
        layout
        className="bg-white border border-gray-100 p-5 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-green-900/5 max-w-lg w-full relative z-10"
      >
        {/* Step Indicator */}
        <div className="flex justify-center gap-2 mb-10">
          <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'w-12 bg-[#16a34a]' : 'w-3 bg-gray-200'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 2 ? 'w-12 bg-[#16a34a]' : 'w-3 bg-gray-200'}`} />
        </div>

        <div className="text-center mb-10 shrink-0">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#dcfce7] text-[#16a34a] mb-4">
            {step === 1 ? <User size={24} /> : <ShieldCheck size={24} />}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0a2e1a] tracking-tight mb-2">
            {step === 1 ? 'Sizi Tanıyalım' : 'Güvenlik'}
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            {step === 1 ? 'Bilgileriniz uzman eşleşmesi için kullanılır.' : 'Şifreniz sistemlerimizde güvenle saklanır.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative min-h-[300px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 w-full"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <Input label="Ad" icon={User} value={formData.ad} onChange={(e) => setFormData({ ...formData, ad: e.target.value })} placeholder="Adınız" />
                  <Input label="Soyad" icon={User} value={formData.soyad} onChange={(e) => setFormData({ ...formData, soyad: e.target.value })} placeholder="Soyadınız" />
                </div>
                <Input label="E-posta" type="email" icon={Mail} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="ornek@email.com" />
                <Input label="Telefon" type="tel" icon={Phone} value={formData.telefon} onChange={(e) => setFormData({ ...formData, telefon: e.target.value })} placeholder="05XX XXX XX XX" />
                
                <Button type="button" onClick={handleNext} className="w-full bg-[#0a2e1a] hover:bg-[#0f4c35] text-white py-4 rounded-2xl font-black mt-6 flex items-center justify-center gap-2 transition-colors">
                  Sonraki Adım <ArrowRight size={18} />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 w-full"
              >
                <Input label="Şifre" type="password" icon={Lock} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                <Input label="Şifre Tekrar" type="password" icon={Lock} value={formData.passwordConfirm} onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })} placeholder="••••••••" />
                
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-4 hover:border-[#4ade80]/40 transition-colors select-none">
                  <div
                    className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer mt-0.5 ${formData.kvkk_onay ? 'bg-[#16a34a] border-[#16a34a]' : 'border-gray-300 bg-white'}`}
                    onClick={() => setFormData({...formData, kvkk_onay: !formData.kvkk_onay})}
                  >
                    {formData.kvkk_onay && <Check size={16} className="text-white" />}
                  </div>
                  <span className="text-xs font-bold text-gray-600 leading-snug">
                    myflexio tarafından hazırlanan{' '}
                    <button type="button" onClick={() => setKvkkModalOpen(true)} className="text-[#16a34a] underline underline-offset-2 hover:text-[#0a2e1a] transition-colors">
                      KVKK Aydınlatma Metni
                    </button>
                    &apos;ni okudum. Sağlık verilerim dahil kişisel verilerimin, bana özel tedavi planı hazırlanması ve uzman fizyoterapistle eşleştirilmem amacıyla işlenmesine açık rıza gösteriyorum.
                  </span>
                </div>
                <KVKKModal
                  open={kvkkModalOpen}
                  onClose={() => setKvkkModalOpen(false)}
                  onAccept={() => setFormData({ ...formData, kvkk_onay: true })}
                  tip="hasta"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <button type="button" onClick={() => setStep(1)} className="flex items-center justify-center gap-2 text-sm font-black text-gray-400 hover:text-[#0a2e1a] transition-colors py-4">
                    <ArrowLeft size={18} /> Geri Dön
                  </button>
                  <Button type="submit" loading={loading} className="bg-[#16a34a] hover:bg-[#15803d] text-white py-4 rounded-2xl font-black shadow-lg shadow-green-900/20 active:scale-95 transition-all">
                    Kaydı Tamamla
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <div className="mt-10 text-center shrink-0">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Zaten bir hesabınız var mı?{' '}
            <Link to="/login" className="text-[#16a34a] underline underline-offset-4 decoration-2 decoration-[#4ade80]/40 hover:text-[#0a2e1a] transition-colors ml-1">
              Giriş Yap
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}