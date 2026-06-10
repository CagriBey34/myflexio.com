import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Lock, Upload, Award, 
  ArrowRight, ArrowLeft, CheckCircle2, XCircle, ShieldCheck
} from 'lucide-react';
import api from '../../../shared/services/api';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import KVKKModal from '../../../shared/components/ui/KVKKModal';

export default function UzmanRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ad: '', soyad: '', email: '', telefon: '', unvan: '',
    password: '', passwordConfirm: '', diploma: null,
    kvkk_onay: false, sozlesme_onay: false,
  });
  
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);
  const [kvkkModalOpen, setKvkkModalOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'Dosya boyutu 5MB\'dan küçük olmalıdır.' });
        return;
      }
      setFormData({ ...formData, diploma: file });
    }
  };

  const handleNext = () => {
    if (step === 1 && (!formData.ad || !formData.soyad || !formData.email || !formData.telefon || !formData.unvan)) {
      setStatus({ type: 'error', message: 'Lütfen tüm kişisel ve mesleki bilgileri doldurun.' });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      setStatus({ type: 'error', message: 'Şifreler birbiriyle eşleşmiyor.' });
      return;
    }
    if (!formData.diploma) {
      setStatus({ type: 'error', message: 'Lütfen diploma veya sertifika belgenizi yükleyin.' });
      return;
    }
    if (!formData.kvkk_onay || !formData.sozlesme_onay) {
      setStatus({ type: 'error', message: 'Lütfen tüm yasal onayları işaretleyin.' });
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'kvkk_onay') submitData.append('kvkkOnay', formData[key]);
        else if (key === 'sozlesme_onay') submitData.append('sozlesmeOnay', formData[key]);
        else if (key === 'password') submitData.append('sifre', formData[key]);
        else if (key === 'passwordConfirm') submitData.append('sifreTekrar', formData[key]);
        else submitData.append(key, formData[key]);
      });

      await api.post('/uzman/register', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStatus({ type: 'success', message: 'Başvurunuz alındı! İnceleme sonrası size bilgi vereceğiz.' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Kayıt başarısız.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden relative bg-white font-sans">
      
      {/* --- ARKA PLAN DEKORATİF BLURLAR --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#4ade80] blur-[120px] opacity-10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#0f4c35] blur-[100px] opacity-5" />
      </div>

      {/* --- POPUP BİLDİRİMLER --- */}
      <AnimatePresence>
        {status.type && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none"
          >
            <div className={`pointer-events-auto flex items-center gap-4 p-5 rounded-3xl border shadow-2xl backdrop-blur-xl max-w-md w-full 
              ${status.type === 'success' ? 'bg-[#dcfce7] border-[#16a34a]/20 text-[#0a2e1a]' : 'bg-rose-50 border-rose-100 text-rose-900'}`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${status.type === 'success' ? 'bg-[#16a34a] text-white' : 'bg-rose-500 text-white'}`}>
                {status.type === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              </div>
              <div className="flex-1 text-sm font-bold">{status.message}</div>
              <button onClick={() => setStatus({ type: null, message: '' })}><XCircle size={20} className="opacity-40 hover:opacity-100 transition-opacity" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FORM KAPSAYICI --- */}
      <motion.div 
        layout 
        className="bg-white border border-gray-100 p-5 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-green-900/5 max-w-2xl w-full relative z-10"
      >
        
        {/* Step Indicator */}
        <div className="flex justify-center gap-2 mb-10">
          {[1, 2].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-12 bg-[#16a34a]' : 'w-3 bg-gray-200'}`} />
          ))}
        </div>

        <div className="text-center mb-10 shrink-0">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#dcfce7] text-[#16a34a] mb-4">
            {step === 1 ? <User size={24} /> : <ShieldCheck size={24} />}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0a2e1a] tracking-tight mb-2">
            {step === 1 ? 'Uzman Profili' : 'Belge & Güvenlik'}
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            {step === 1 ? 'Lütfen mesleki bilgilerinizi eksiksiz girin.' : 'Diplomanızı yükleyip hesap güvenliğinizi sağlayın.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative min-h-[350px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="u-step1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <Input label="Ad" icon={User} value={formData.ad} onChange={(e) => setFormData({ ...formData, ad: e.target.value })} placeholder="Adınız" />
                  <Input label="Soyad" icon={User} value={formData.soyad} onChange={(e) => setFormData({ ...formData, soyad: e.target.value })} placeholder="Soyadınız" />
                </div>
                <Input label="E-posta" type="email" icon={Mail} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="kurumsal@email.com" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <Input label="Telefon" type="tel" icon={Phone} value={formData.telefon} onChange={(e) => setFormData({ ...formData, telefon: e.target.value })} placeholder="05..." />
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Unvan *</label>
                    <select
                      value={formData.unvan}
                      onChange={(e) => setFormData({ ...formData, unvan: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl bg-gray-50 text-sm font-bold text-[#0a2e1a] outline-none focus:border-[#4ade80] focus:bg-white transition-all appearance-none"
                    >
                      <option value="">Seçiniz</option>
                      {["Fizyoterapist", "Ortopedist", "Nöroloji Uzmanı", "Spor Hekimi", "Fizik Tedavi Rehabilitasyon"].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <Button type="button" onClick={handleNext} className="w-full bg-[#0a2e1a] hover:bg-[#0f4c35] text-white py-4 rounded-2xl font-black mt-6 flex items-center justify-center gap-2 transition-colors">
                  Sonraki Adım <ArrowRight size={18} />
                </Button>
              </motion.div>
            ) : (
              <motion.div key="u-step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <Input label="Şifre" type="password" icon={Lock} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                  <Input label="Şifre Tekrar" type="password" icon={Lock} value={formData.passwordConfirm} onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })} placeholder="••••••••" />
                </div>

                {/* Diploma Upload Area */}
                <div className="relative group mt-2">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" id="u-diploma" />
                  <label htmlFor="u-diploma" className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#4ade80]/40 bg-[#dcfce7]/30 rounded-[2rem] cursor-pointer hover:border-[#16a34a] hover:bg-[#dcfce7]/50 transition-all">
                    <div className="p-3 bg-white rounded-2xl shadow-sm mb-3 text-[#16a34a] group-hover:scale-110 transition-transform">
                      <Upload size={24} />
                    </div>
                    <span className="text-xs font-bold text-[#0a2e1a] text-center max-w-[200px] truncate">
                      {formData.diploma ? formData.diploma.name : 'Diploma Yükle'}
                    </span>
                    {!formData.diploma && (
                      <span className="text-[10px] text-gray-500 mt-1 font-medium">PDF, JPG (Max 5MB)</span>
                    )}
                  </label>
                </div>

                {/* Onaylar */}
                <div className="space-y-3 mt-4">
                  {/* KVKK onayı */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#4ade80]/40 transition-colors">
                    <div
                      className={`w-6 h-6 shrink-0 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer mt-0.5 ${formData.kvkk_onay ? 'bg-[#16a34a] border-[#16a34a]' : 'border-gray-300 bg-white'}`}
                      onClick={() => setFormData({...formData, kvkk_onay: !formData.kvkk_onay})}
                    >
                      {formData.kvkk_onay && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                    <span className="text-xs font-bold text-gray-600 leading-snug">
                      myflexio tarafından hazırlanan{' '}
                      <button type="button" onClick={() => setKvkkModalOpen(true)} className="text-[#16a34a] underline underline-offset-2 hover:text-[#0a2e1a] transition-colors">
                        KVKK Aydınlatma Metni
                      </button>
                      &apos;ni okudum. Mesleki verilerim dahil kişisel verilerimin platform üzerinden hizmet sunumu amacıyla işlenmesine açık rıza gösteriyorum.
                    </span>
                  </div>

                  {/* Hizmet sözleşmesi onayı */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:border-[#4ade80]/40 transition-colors" onClick={() => setFormData({...formData, sozlesme_onay: !formData.sozlesme_onay})}>
                    <div className={`w-6 h-6 shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${formData.sozlesme_onay ? 'bg-[#16a34a] border-[#16a34a]' : 'border-gray-300 bg-white'}`}>
                      {formData.sozlesme_onay && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                    <span className="text-xs font-bold text-gray-600 leading-snug">Uzman Hizmet Sözleşmesini okudum ve kabul ediyorum.</span>
                  </div>

                  <KVKKModal
                    open={kvkkModalOpen}
                    onClose={() => setKvkkModalOpen(false)}
                    onAccept={() => setFormData({ ...formData, kvkk_onay: true })}
                    tip="uzman"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-8">
                  <button type="button" onClick={() => setStep(1)} className="flex items-center justify-center gap-2 text-sm font-black text-gray-400 py-4 hover:text-[#0a2e1a] transition-colors">
                    <ArrowLeft size={18} /> Geri
                  </button>
                  <Button type="submit" loading={loading} className="bg-[#16a34a] hover:bg-[#15803d] text-white py-4 rounded-2xl font-black shadow-lg shadow-green-900/20 transition-all">
                    Başvuruyu Tamamla
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <div className="mt-10 text-center shrink-0">
          <p className="text-xs font-bold text-gray-400">
            Zaten bir hesabınız var mı?{' '}
            <Link to="/login" className="text-[#16a34a] underline underline-offset-4 decoration-2 decoration-[#4ade80]/40 hover:text-[#0a2e1a] transition-colors ml-1">
              Giriş Yapın
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}