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
    if (!formData.ad || !formData.soyad || !formData.email || !formData.telefon) {
      setStatus({ type: 'error', message: 'Lütfen tüm kişisel bilgileri eksiksiz doldurun.' });
      return;
    }
    setStatus({ type: null, message: '' });
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
      setStatus({ type: 'success', message: 'Kaydınız oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz.' });
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Sunucuyla bağlantı kurulamadı. Lütfen tekrar deneyin.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start sm:justify-center px-4 py-6 overflow-y-auto relative bg-white font-sans">

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
                <p className="text-xs font-black uppercase tracking-tight">{status.type === 'success' ? 'Harika!' : 'Bir Sorun Var'}</p>
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
      <Link to="/" className="relative z-10 mb-6 flex items-center">
        <img src="/logo.png" alt="MyFlexio" className="h-19 sm:h-20 w-auto" />
      </Link>

      {/* Form kartı */}
      <motion.div
        layout
        className="bg-white border border-gray-100 p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-green-900/5 w-full max-w-lg relative z-10"
      >
        {/* Adım göstergesi */}
        <div className="flex justify-center gap-2 mb-7 sm:mb-9">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-10 bg-[#16a34a]' : 'w-3 bg-gray-200'}`}
            />
          ))}
        </div>

        {/* Başlık */}
        <div className="text-center mb-7 sm:mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#dcfce7] text-[#16a34a] mb-3 sm:mb-4">
            {step === 1 ? <User size={22} /> : <ShieldCheck size={22} />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0a2e1a] tracking-tight mb-1.5">
            {step === 1 ? 'Sizi Tanıyalım' : 'Güvenlik'}
          </h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            {step === 1
              ? 'Bilgileriniz uzman eşleşmesi için kullanılır.'
              : 'Şifreniz sistemlerimizde güvenle saklanır.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Input label="Ad" icon={User} value={formData.ad} onChange={(e) => setFormData({ ...formData, ad: e.target.value })} placeholder="Adınız" />
                  <Input label="Soyad" icon={User} value={formData.soyad} onChange={(e) => setFormData({ ...formData, soyad: e.target.value })} placeholder="Soyadınız" />
                </div>
                <Input label="E-posta" type="email" icon={Mail} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="ornek@email.com" />
                <Input label="Telefon" type="tel" icon={Phone} value={formData.telefon} onChange={(e) => setFormData({ ...formData, telefon: e.target.value })} placeholder="05XX XXX XX XX" />

                <div className="pt-3">
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-[#0a2e1a] hover:bg-[#0f4c35] text-white py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-colors min-h-[52px]"
                  >
                    Sonraki Adım <ArrowRight size={17} />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="space-y-4"
              >
                <Input label="Şifre" type="password" icon={Lock} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                <Input label="Şifre Tekrar" type="password" icon={Lock} value={formData.passwordConfirm} onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })} placeholder="••••••••" />

                {/* KVKK onay */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#4ade80]/40 transition-colors select-none cursor-pointer mt-2"
                  onClick={() => setFormData({ ...formData, kvkk_onay: !formData.kvkk_onay })}
                >
                  <div className={`shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5 ${formData.kvkk_onay ? 'bg-[#16a34a] border-[#16a34a]' : 'border-gray-300 bg-white'}`}>
                    {formData.kvkk_onay && <Check size={14} className="text-white" />}
                  </div>
                  <span className="text-xs font-semibold text-gray-600 leading-snug">
                    myflexio tarafından hazırlanan{' '}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setKvkkModalOpen(true); }}
                      className="text-[#16a34a] underline underline-offset-2 hover:text-[#0a2e1a] transition-colors font-bold"
                    >
                      KVKK Aydınlatma Metni
                    </button>
                    &apos;ni okudum ve sağlık verilerimin işlenmesine açık rıza gösteriyorum.
                  </span>
                </div>

                <KVKKModal
                  open={kvkkModalOpen}
                  onClose={() => setKvkkModalOpen(false)}
                  onAccept={() => setFormData({ ...formData, kvkk_onay: true })}
                  tip="hasta"
                />

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center gap-1.5 text-sm font-black text-gray-400 hover:text-[#0a2e1a] transition-colors py-3.5 min-h-[52px]"
                  >
                    <ArrowLeft size={17} /> Geri
                  </button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="bg-[#16a34a] hover:bg-[#15803d] text-white py-3.5 rounded-xl font-black shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all min-h-[52px]"
                  >
                    Kaydı Tamamla
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <div className="mt-7 sm:mt-8 text-center pt-6 border-t border-gray-50">
          <p className="text-xs font-bold text-gray-400">
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
