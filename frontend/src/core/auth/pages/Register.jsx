import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserCircle, Stethoscope, CheckCircle2, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

const containerStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

export default function Register() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-start sm:justify-center px-4 py-6 sm:py-8 font-sans overflow-y-auto relative">

      {/* Arka plan blurlar */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#4ade80] blur-[120px] opacity-5" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-[#0f4c35] blur-[100px] opacity-5" />
      </div>

      {/* Logo */}
      <Link to="/" className="relative z-10 mb-6 sm:mb-8 flex items-center">
        <img src="/logo.png" alt="MyFlexio" className="h-29 sm:h-40 w-auto" />
      </Link>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerStagger}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Başlık */}
        <motion.div variants={fadeUp} className="text-center mb-7 sm:mb-10">
          <h2 className="text-[1.85rem] sm:text-4xl md:text-5xl font-black text-[#0a2e1a] tracking-tight leading-[1.1] mb-3 sm:mb-4">
            Hesap Türünü <span className="text-[#16a34a]">Seç.</span>
          </h2>
          <p className="text-gray-500 font-medium text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
            İhtiyacınıza uygun yolu seçerek MyFlexio'ya ilk adımınızı atın.
          </p>
        </motion.div>

        {/* Kartlar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 md:gap-6">

          {/* Hasta Kartı */}
          <motion.div variants={fadeUp}>
            <Link
              to="/register/hasta"
              className="group flex flex-col h-full p-5 sm:p-7 md:p-9 bg-gray-50 border border-gray-100 rounded-[1.75rem] sm:rounded-[2rem] hover:border-[#4ade80]/50 hover:bg-white hover:shadow-2xl hover:shadow-green-900/5 transition-all duration-400 relative overflow-hidden active:scale-[0.98]"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#dcfce7] rounded-2xl flex items-center justify-center mb-5 sm:mb-7 group-hover:scale-110 transition-transform duration-400 shrink-0">
                <UserCircle size={26} className="text-[#16a34a]" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-[#0a2e1a] mb-2 sm:mb-3 tracking-tight">Hasta Kayıt</h3>
              <p className="text-sm text-gray-500 font-medium mb-5 sm:mb-7 leading-relaxed">
                Uzman desteğiyle ağrılarımdan kurtulmak ve sağlıklı hareket etmek istiyorum.
              </p>

              <div className="space-y-2.5 mb-6 sm:mb-8">
                {['Kişisel Egzersiz Planı', 'Online Uzman Görüşmesi', 'İyileşme Takibi'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-[#0a2e1a]/70">
                    <div className="w-5 h-5 rounded-full bg-[#4ade80]/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="text-[#16a34a]" size={12} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-center gap-2 font-black text-[#16a34a] text-xs uppercase tracking-widest group-hover:gap-3 transition-all duration-300">
                Hemen Başla <ArrowRight size={15} />
              </div>
            </Link>
          </motion.div>

          {/* Uzman Kartı */}
          <motion.div variants={fadeUp}>
            <Link
              to="/register/uzman"
              className="group flex flex-col h-full p-5 sm:p-7 md:p-9 bg-[#0a2e1a] border border-[#0a2e1a] rounded-[1.75rem] sm:rounded-[2rem] hover:shadow-2xl hover:shadow-green-900/40 transition-all duration-400 relative overflow-hidden active:scale-[0.98]"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#4ade80] blur-[70px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none" />

              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#4ade80] rounded-2xl flex items-center justify-center mb-5 sm:mb-7 group-hover:rotate-12 transition-transform duration-400 shrink-0">
                <Stethoscope size={26} className="text-[#0a2e1a]" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-3 tracking-tight">Uzman Kayıt</h3>
              <p className="text-sm text-white/60 font-medium mb-5 sm:mb-7 leading-relaxed">
                Fizyoterapistim, dijital ortamda danışanlarıma profesyonel hizmet sunmak istiyorum.
              </p>

              <div className="space-y-2.5 mb-6 sm:mb-8">
                {['Dijital Hasta Yönetimi', 'Güvenli Ödeme Sistemi'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-white/80">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="text-[#4ade80]" size={12} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-center gap-2 font-black text-[#4ade80] text-xs uppercase tracking-widest group-hover:gap-3 transition-all duration-300">
                Aramıza Katıl <ArrowRight size={15} />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Alt bilgi */}
        <motion.div variants={fadeUp} className="mt-8 sm:mt-10 text-center pb-4">
          <p className="text-sm text-gray-400 font-bold">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-[#16a34a] hover:text-[#0a2e1a] transition-colors underline underline-offset-4 decoration-2 decoration-[#4ade80]/30">
              Giriş Yapın
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-5 opacity-40">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-[#0a2e1a]">
              <ShieldCheck size={13} /> KVKK KORUMALI
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-[#0a2e1a]">
              <HeartPulse size={13} /> %100 GÜVENLİ
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
