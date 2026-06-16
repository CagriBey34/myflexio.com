import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Lock, Upload, ArrowRight,
  ArrowLeft, CheckCircle2, XCircle, ShieldCheck
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
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'Dosya boyutu 5MB\'dan küçük olmalıdır.' });
      return;
    }
    setFormData({ ...formData, diploma: file });
  };

  const handleNext = () => {
    if (!formData.ad || !formData.soyad || !formData.email || !formData.telefon || !formData.unvan) {
      setStatus({ type: 'error', message: 'Lütfen tüm kişisel ve mesleki bilgileri doldurun.' });
      return;
    }
    setStatus({ type: null, message: '' });
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
      Object.keys(formData).forEach((key) => {
        if (key === 'kvkk_onay') submitData.append('kvkkOnay', formData[key]);
        else if (key === 'sozlesme_onay') submitData.append('sozlesmeOnay', formData[key]);
        else if (key === 'password') submitData.append('sifre', formData[key]);
        else if (key === 'passwordConfirm') submitData.append('sifreTekrar', formData[key]);
        else submitData.append(key, formData[key]);
      });
      await api.post('/uzman/register', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus({ type: 'success', message: 'Başvurunuz alındı! İnceleme sonrası size bilgi vereceğiz.' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Kayıt başarısız.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start sm:justify-center px-4 py-6 overflow-y-auto relative bg-white font-sans">

      {/* Arka plan blurlar */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#4ade80] blur-[120px] opacity-10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-[#0f4c35] blur-[100px] opacity-5" />
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
                <p className="text-xs font-black uppercase tracking-tight">{status.type === 'success' ? 'Başvuru Alındı!' : 'Bir Sorun Var'}</p>
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
        className="bg-white border border-gray-100 p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-green-900/5 w-full max-w-xl relative z-10"
      >
        {/* Adım göstergesi */}
        <div className="flex justify-center gap-2 mb-7 sm:mb-9">
          {[1, 2].map((i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-10 bg-[#16a34a]' : 'w-3 bg-gray-200'}`} />
          ))}
        </div>

        {/* Başlık */}
        <div className="text-center mb-7 sm:mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#dcfce7] text-[#16a34a] mb-3 sm:mb-4">
            {step === 1 ? <User size={22} /> : <ShieldCheck size={22} />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0a2e1a] tracking-tight mb-1.5">
            {step === 1 ? 'Uzman Profili' : 'Belge & Güvenlik'}
          </h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            {step === 1
              ? 'Mesleki bilgilerinizi eksiksiz girin.'
              : 'Diplomanızı yükleyip hesap güvenliğinizi sağlayın.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="u-step1"
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
                <Input label="E-posta" type="email" icon={Mail} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="kurumsal@email.com" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Input label="Telefon" type="tel" icon={Phone} value={formData.telefon} onChange={(e) => setFormData({ ...formData, telefon: e.target.value })} placeholder="05..." />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unvan *</label>
                    <select
                      value={formData.unvan}
                      onChange={(e) => setFormData({ ...formData, unvan: e.target.value })}
                      className="w-full px-4 py-3.5 border-2 border-gray-100 rounded-xl bg-gray-50 text-sm font-semibold text-[#0a2e1a] outline-none focus:border-[#4ade80] focus:bg-white transition-all appearance-none min-h-[48px]"
                    >
                      <option value="">Seçiniz</option>
                      {['Fizyoterapist', 'Ortopedist', 'Nöroloji Uzmanı', 'Spor Hekimi', 'Fizik Tedavi ve Rehabilitasyon Uzmanı'].map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

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
                key="u-step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Input label="Şifre" type="password" icon={Lock} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                  <Input label="Şifre Tekrar" type="password" icon={Lock} value={formData.passwordConfirm} onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })} placeholder="••••••••" />
                </div>

                {/* Diploma yükleme */}
                <div className="relative group mt-1">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" id="u-diploma" />
                  <label
                    htmlFor="u-diploma"
                    className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-[#4ade80]/40 bg-[#dcfce7]/30 rounded-[1.5rem] cursor-pointer hover:border-[#16a34a] hover:bg-[#dcfce7]/50 transition-all"
                  >
                    <div className="p-2.5 bg-white rounded-xl shadow-sm mb-2.5 text-[#16a34a] group-hover:scale-110 transition-transform">
                      <Upload size={22} />
                    </div>
                    <span className="text-xs font-bold text-[#0a2e1a] text-center max-w-[200px] truncate">
                      {formData.diploma ? formData.diploma.name : 'Diploma Yükle'}
                    </span>
                    {!formData.diploma && (
                      <span className="text-[10px] text-gray-500 mt-1 font-medium">PDF, JPG (Maks. 5MB)</span>
                    )}
                  </label>
                </div>

                {/* KVKK onayı */}
                <div
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#4ade80]/40 transition-colors cursor-pointer select-none"
                  onClick={() => setFormData({ ...formData, kvkk_onay: !formData.kvkk_onay })}
                >
                  <div className={`shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5 ${formData.kvkk_onay ? 'bg-[#16a34a] border-[#16a34a]' : 'border-gray-300 bg-white'}`}>
                    {formData.kvkk_onay && <CheckCircle2 size={14} className="text-white" />}
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
                    &apos;ni okudum ve mesleki verilerimin platform üzerinden işlenmesine rıza gösteriyorum.
                  </span>
                </div>

                {/* Hizmet sözleşmesi onayı */}
                <div
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#4ade80]/40 transition-colors cursor-pointer select-none"
                  onClick={() => setFormData({ ...formData, sozlesme_onay: !formData.sozlesme_onay })}
                >
                  <div className={`shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5 ${formData.sozlesme_onay ? 'bg-[#16a34a] border-[#16a34a]' : 'border-gray-300 bg-white'}`}>
                    {formData.sozlesme_onay && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  <span className="text-xs font-semibold text-gray-600 leading-snug">
                    Uzman Hizmet Sözleşmesi&apos;ni okudum ve kabul ediyorum.
                  </span>
                </div>

                <KVKKModal
                  open={kvkkModalOpen}
                  onClose={() => setKvkkModalOpen(false)}
                  onAccept={() => setFormData({ ...formData, kvkk_onay: true })}
                  tip="uzman"
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
                    Başvuruyu Tamamla
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
              Giriş Yapın
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
