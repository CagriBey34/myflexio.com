import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  UserCircle,
  Stethoscope,
  CheckCircle2,
  ArrowRight,
  HeartPulse,
  ShieldCheck,
} from 'lucide-react';

/* ─── Animasyon Varyantları (Ana sayfadakiyle aynı) ─── */
const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  }
};

const containerStagger = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  }
};

export default function Register() {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden relative">

      {/* --- LOGO --- */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-[#0a2e1a] hover:text-[#16a34a] transition-colors z-10"
      >
        <div className="w-8 h-8 rounded-xl bg-[#dcfce7] flex items-center justify-center">
          <HeartPulse size={18} className="text-[#16a34a]" />
        </div>
        <span className="font-black text-lg tracking-tight">MyFlexio</span>
      </Link>

      {/* Arka Plan Dekoratif Blurlar */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#4ade80] blur-[120px] opacity-5" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#0f4c35] blur-[100px] opacity-5" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerStagger}
        className="relative z-10 w-full max-w-5xl pt-16 sm:pt-0"
      >
        {/* Üst Başlık Alanı */}
        <motion.div variants={fadeUp} className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-[#0a2e1a] tracking-tighter leading-[0.9] mb-4 sm:mb-6">
            Hesap Türünü <span className="text-[#16a34a]">Seç.</span>
          </h2>
          <p className="text-gray-500 font-medium text-sm md:text-base max-w-md mx-auto">
            İhtiyacınıza uygun olan yolu seçerek MyFlexio dünyasına ilk adımınızı atın.
          </p>
        </motion.div>

        {/* Kartlar Izgarası */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          
          {/* Danışan Kartı (Açık Renk Teması) */}
          <motion.div variants={fadeUp}>
            <Link
              to="/register/hasta"
              className="group flex flex-col h-full p-5 sm:p-8 md:p-10 bg-gray-50 border border-gray-100 rounded-[2rem] sm:rounded-[2.5rem] hover:border-[#4ade80]/50 hover:bg-white hover:shadow-2xl hover:shadow-green-900/5 transition-all duration-500 relative overflow-hidden active:scale-[0.98]"
            >
              <div className="w-14 h-14 bg-[#dcfce7] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <UserCircle size={32} className="text-[#16a34a]" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-black text-[#0a2e1a] mb-3 tracking-tight">Hasta Kayıt</h3>
              <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
                Uzman desteğiyle ağrılarımdan kurtulmak ve sağlıklı hareket etmek istiyorum.
              </p>

              <div className="space-y-3 mb-10">
                {['Kişisel Egzersiz Planı', 'Online Uzman Görüşmesi', 'İyileşme Takibi'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs font-bold text-[#0a2e1a]/70">
                    <div className="w-5 h-5 rounded-full bg-[#4ade80]/20 flex items-center justify-center">
                      <CheckCircle2 className="text-[#16a34a]" size={12} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-center gap-2 font-black text-[#16a34a] text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                Hemen Başla <ArrowRight size={16} />
              </div>
            </Link>
          </motion.div>

          {/* Uzman Kartı (Koyu Renk Teması - Ana Sayfa Hero Gibi) */}
          <motion.div variants={fadeUp}>
            <Link
              to="/register/uzman"
              className="group flex flex-col h-full p-5 sm:p-8 md:p-10 bg-[#0a2e1a] border border-[#0a2e1a] rounded-[2rem] sm:rounded-[2.5rem] hover:shadow-2xl hover:shadow-green-900/40 transition-all duration-500 relative overflow-hidden active:scale-[0.98]"
            >
              {/* Arka Plan Işıltısı */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ade80] blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
              
              <div className="w-14 h-14 bg-[#4ade80] rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform duration-500">
                <Stethoscope size={32} className="text-[#0a2e1a]" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">Uzman Kayıt</h3>
              <p className="text-sm text-white/60 font-medium mb-8 leading-relaxed">
                Fizyoterapistim, dijital ortamda danışanlarıma profesyonel hizmet sunmak istiyorum.
              </p>

              <div className="space-y-3 mb-10">
                {['Dijital Hasta Yönetimi', 'Güvenli Ödeme Sistemi'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs font-bold text-white/80">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                      <CheckCircle2 className="text-[#4ade80]" size={12} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-center gap-2 font-black text-[#4ade80] text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                Aramıza Katıl <ArrowRight size={16} />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Alt Bilgi */}
        <motion.div variants={fadeUp} className="mt-12 text-center">
          <p className="text-sm text-gray-400 font-bold">
            Zaten bir hesabınız var mı?{' '}
            <Link to="/login" className="text-[#16a34a] hover:text-[#0a2e1a] transition-colors underline underline-offset-4 decoration-2 decoration-[#4ade80]/30">
              Giriş Yapın
            </Link>
          </p>
          
          <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-1 text-[10px] font-black text-[#0a2e1a]">
                <ShieldCheck size={14} /> KVKK KORUMALI
             </div>
             <div className="flex items-center gap-1 text-[10px] font-black text-[#0a2e1a]">
                <HeartPulse size={14} /> %100 GÜVENLİ
             </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}