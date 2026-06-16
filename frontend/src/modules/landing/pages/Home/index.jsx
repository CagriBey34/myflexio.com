import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup, useScroll } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Activity,
  Video, CheckCircle, BarChart2, Award, Stethoscope
} from 'lucide-react';

/* ─── Animasyon Varyantları ─────────────────────────────────── */
const fadeUp = {
  hidden: { y: 32, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

/* ─── ANA SAYFA ──────────────────────────────────────────────── */
export default function Home() {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setIsCompact(v > 70));
    return unsub;
  }, [scrollY]);

  return (
    <div ref={containerRef} className="bg-white text-[#0a2e1a] font-sans overflow-x-hidden">

      {/* ══════════════════════════════════
          NAVBAR
      ══════════════════════════════════ */}
      <LayoutGroup>
        <AnimatePresence initial={false}>
          {!isCompact ? (
            <motion.nav
              key="expanded"
              initial={false}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="fixed top-0 left-0 w-full px-4 sm:px-6 md:px-14 py-3 flex justify-between items-center z-50"
            >
              <motion.button
                layoutId="nav-logo"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="cursor-pointer flex-shrink-0"
                transition={{ layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
              >
                <img src="/logo.png" alt="MyFlexio" className="h-20 sm:h-22 w-auto brightness-0 invert" />
              </motion.button>

              <motion.div
                layoutId="nav-cta"
                className="flex items-center gap-2 bg-black/20 backdrop-blur-md p-1.5 rounded-full"
                transition={{ layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
              >
                <Link
                  to="/login"
                  className="bg-white text-[#0a2e1a] text-xs sm:text-sm font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-full hover:bg-[#22c55e] hover:text-white transition-colors min-h-[36px] sm:min-h-[40px] flex items-center"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="bg-[#4ade80] text-[#0a2e1a] text-xs sm:text-sm font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-full hover:bg-[#22c55e] transition-colors min-h-[36px] sm:min-h-[40px] flex items-center"
                >
                  Başla
                </Link>
              </motion.div>
            </motion.nav>
          ) : (
            <motion.div
              key="compact"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, y: -14, transition: { duration: 0.22 } }}
              className="fixed top-3 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
            >
              <div className="pointer-events-auto relative max-w-full">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#4ade80]/20 to-[#22c55e]/20 blur-xl scale-110 pointer-events-none" />
                <div className="relative flex items-center bg-[#0a2e1a]/92 backdrop-blur-xl rounded-full px-1.5 py-1.5 border border-[#4ade80]/20 shadow-2xl shadow-black/30">
                  <motion.button
                    layoutId="nav-logo"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="cursor-pointer px-2 sm:px-3"
                    transition={{ layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
                  >
                    <img src="/logo.png" alt="MyFlexio" className="h-12 sm:h-15 w-auto brightness-0 invert" />
                  </motion.button>
                  <div className="w-px h-15 bg-white/15 mx-1 shrink-0" />
                  <motion.div
                    layoutId="nav-cta"
                    className="flex items-center gap-1.5 sm:gap-2 p-0.5"
                    transition={{ layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
                  >
                    <Link
                      to="/login"
                      className="text-white/100 bg-white/10 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-full hover:bg-white/100 hover:text-[#0a2e1a] transition-colors min-h-[36px] flex items-center"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      to="/register"
                      className="bg-[#4ade80] text-[#0a2e1a] text-xs sm:text-sm font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-full hover:bg-[#22c55e] transition-colors min-h-[36px] flex items-center"
                    >
                      Başla
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>

      {/* ══════════════════════════════════
          1. HERO
      ══════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a2e1a 0%, #0f4c35 40%, #1a6b4a 100%)' }}
      >
        {/* Arka plan glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-8 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-[#4ade80] blur-[100px] sm:blur-[120px] opacity-10" />
          <div className="absolute bottom-16 right-8 sm:right-20 w-56 sm:w-80 h-56 sm:h-80 rounded-full bg-[#22c55e] blur-[90px] sm:blur-[100px] opacity-10" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-14 pt-24 sm:pt-28 pb-16 sm:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Sol — Metin */}
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 bg-white/10 text-[#4ade80] text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 border border-[#4ade80]/30"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse shrink-0" />
              Çevrimiçi Fizyoterapi Platformu
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-[2.15rem] sm:text-4xl md:text-5xl lg:text-[3.4rem] font-black text-white leading-[1.15] mb-5 sm:mb-6"
            >
              Hareket Özgürlüğünü<br />
              <span className="text-[#4ade80]">Evine Taşı.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-lg"
            >
              Uzman fizyoterapistler ile iyileşme sürecini bugün başlat.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 bg-[#4ade80] text-[#0a2e1a] font-bold px-7 sm:px-8 py-4 rounded-full hover:bg-[#22c55e] transition-all duration-300 shadow-lg shadow-green-500/20 text-sm min-h-[52px]"
              >
                Ücretsiz Başla
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 font-semibold px-7 sm:px-8 py-4 rounded-full hover:bg-white/20 transition-all duration-300 text-sm min-h-[52px]"
              >
                Giriş Yap
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 sm:mt-12 flex items-center gap-5 sm:gap-6 flex-wrap">
              {[
                { icon: <ShieldCheck size={14} />, text: 'KVKK Uyumlu' },
                { icon: <Award size={14} />, text: 'Lisanslı Uzmanlar' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/60 text-xs font-medium">
                  <span className="text-[#4ade80]">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Sağ — Kart (sadece lg+) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative hidden lg:flex justify-center"
          >
            <div className="relative w-full max-w-sm">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#4ade80] flex items-center justify-center text-[#0a2e1a] shrink-0">
                    <Video size={20} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Canlı Seans</div>
                    <div className="text-white/50 text-xs">15 Dk Ön Görüşme</div>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-[#4ade80] animate-pulse shrink-0" />
                </div>
                <div className="w-full h-36 rounded-2xl bg-[#0a2e1a]/40 flex items-center justify-center border border-white/10">
                  <Stethoscope size={48} className="text-[#4ade80]/40" strokeWidth={1} />
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2"
              >
                <CheckCircle size={16} className="text-[#16a34a] shrink-0" />
                <span className="text-xs font-bold text-[#0a2e1a]">Seans tamamlandı ✓</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Mobilde küçük özellik kartları — lg'de gizlenir */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="grid grid-cols-2 gap-3 lg:hidden"
          >
            {[
              { icon: <Video size={18} />, label: 'Canlı Seans', sub: 'HD kalite' },
              { icon: <CheckCircle size={18} />, label: 'Güvenli Platform', sub: 'KVKK uyumlu' },
              { icon: <Activity size={18} />, label: 'Takip Sistemi', sub: 'İlerleme raporu' },
              { icon: <Stethoscope size={18} />, label: 'Uzman Ekip', sub: 'Lisanslı uzmanlar' },
            ].map((f, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4ade80]/20 flex items-center justify-center text-[#4ade80] shrink-0">
                  {f.icon}
                </div>
                <div>
                  <div className="text-white text-xs font-bold">{f.label}</div>
                  <div className="text-white/50 text-[10px]">{f.sub}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Alt dalga */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10 sm:h-16">
            <path d="M0 60L1440 60L1440 20C1200 55 800 5 600 30C400 55 200 10 0 35Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════
          2. NASIL ÇALIŞIR?
      ══════════════════════════════════ */}
      <section id="nasil-calisir" className="py-16 sm:py-24 px-4 sm:px-6 md:px-14 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-block text-[#16a34a] text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-[#dcfce7] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4">
              Nasıl Çalışır?
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#0a2e1a] mt-2">
              3 Adımda İyileşme
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mt-3 sm:mt-4 max-w-lg mx-auto leading-relaxed">
              Karmaşık süreçler yok. Sadece üç adımda profesyonel fizyoterapi desteğine kavuş.
            </p>
          </motion.div>

          {/* Masaüstü: yatay grid, Mobil: dikey liste */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
            {/* Masaüstü yatay bağlantı çizgisi */}
            <div className="hidden md:block absolute top-[3.5rem] left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-[2px] bg-gradient-to-r from-[#dcfce7] via-[#4ade80] to-[#dcfce7]" />

            {[
              {
                num: '01',
                icon: <BarChart2 size={26} />,
                title: 'Profilini Oluştur',
                titleMobile: 'Profilini Oluştur ve Raporlarını Yükle',
                desc: 'Geçmiş ameliyatlarını, MR/Röntgen raporlarını ve şikayetlerini sisteme gir.',
                color: '#dcfce7',
                textColor: '#16a34a',
              },
              {
                num: '02',
                icon: <Video size={26} />,
                title: 'Uzmanla Görüş',
                titleMobile: 'Uzmanla Online Görüş',
                desc: 'Sana en uygun fizyoterapisti seç ve ilk online muayeneni gerçekleştir.',
                color: '#dbeafe',
                textColor: '#1d4ed8',
              },
              {
                num: '03',
                icon: <Activity size={26} />,
                title: 'Çizelgeni Uygula',
                titleMobile: 'Sana Özel Hareket Çizelgeni Uygula',
                desc: 'Uzmanının seçtiği tedavi yöntemini uygula ve iyileşmeni takip et.',
                color: '#fef3c7',
                textColor: '#d97706',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative flex md:flex-col items-start md:items-center gap-4 md:gap-0 text-left md:text-center"
              >
                {/* Mobil: dikey çizgi (son hariç) */}
                {i < 2 && (
                  <div className="md:hidden absolute left-[1.75rem] top-[4.5rem] w-0.5 h-full max-h-20 bg-gradient-to-b from-gray-200 to-transparent" />
                )}

                <div className="relative shrink-0 mb-0 md:mb-6">
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center relative z-10"
                    style={{ background: step.color, color: step.textColor }}
                  >
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0f4c35] text-white text-[10px] font-black flex items-center justify-center z-20">
                    {step.num}
                  </span>
                </div>

                <div className="md:mt-0 flex-1">
                  <h3 className="text-base sm:text-lg font-black text-[#0a2e1a] mb-1.5 md:mb-3 leading-tight">
                    <span className="md:hidden">{step.titleMobile}</span>
                    <span className="hidden md:inline">{step.titleMobile}</span>
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          3. KİMLER İÇİN?
      ══════════════════════════════════ */}
      <section id="kimler-icin" className="py-16 sm:py-24 px-4 sm:px-6 md:px-14 bg-[#fafaf9] border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-block text-[#16a34a] text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-[#dcfce7] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4">
              MyFlexio Kimler İçin?
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#0a2e1a] mt-2">
              Senin İçin Tasarlandı
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mt-3 sm:mt-4 max-w-2xl mx-auto leading-relaxed">
              Hayat kaliteni artırmak, ağrılarından kurtulmak veya gelecekteki olası problemleri önlemek istiyorsan, MyFlexio yanında.
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          >
            {[
              {
                iconUrl: 'https://moovbuddy.com/wp-content/uploads/2022/11/v6-300x300.png',
                title: 'Bölgesel Ağrı Yönetimi',
                desc: 'Bel, boyun, omuz, diz veya diğer eklemlerinde hayat kaliteni düşüren kronik ya da akut ağrılar hissediyorsan.',
              },
              {
                iconUrl: 'https://moovbuddy.com/wp-content/uploads/2022/11/v2-300x300.png',
                title: 'Postür & Duruş Optimizasyonu',
                desc: 'Gün boyu masa başında çalışmaktan omuzların öne düşüyorsa ve daha dik, özgüvenli bir omurga yapısı istiyorsan.',
              },
              {
                iconUrl: 'https://moovbuddy.com/wp-content/uploads/2022/11/v3-300x300.png',
                title: 'Operasyon Sonrası Toparlanma',
                desc: 'Cerrahi müdahaleler sonrasında rehabilitasyon sürecine evinin konforunda uzman eşliğinde devam etmek istiyorsan.',
              },
              {
                iconUrl: 'https://moovbuddy.com/wp-content/uploads/2022/11/v5-300x300.png',
                title: 'Dijital Egzersiz Rehberliği',
                desc: '"Hareketi doğru yapıyor muyum?" endişesini taşıyorsan ve bir fizyoterapist gözetiminde ilerlemek istiyorsan.',
              },
              {
                iconUrl: 'https://moovbuddy.com/wp-content/uploads/2022/11/v4-300x300.png',
                title: 'Esneklik & Mobilite Kaybı',
                desc: 'Kas sertliği veya eklem tutukluğu yaşıyorsan ve vücuduna akıcı hareket özgürlüğünü yeniden kazandırmak istiyorsan.',
              },
              {
                iconUrl: 'https://moovbuddy.com/wp-content/uploads/2022/11/v.png',
                title: 'Preventif (Koruyucu) Sağlık',
                desc: 'Gelecekteki omurga problemlerini önlemek ve vücut mekaniğini her zaman zirvede tutmak istiyorsan.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-gray-100 hover:border-[#4ade80]/40 hover:shadow-xl hover:shadow-[#4ade80]/5 hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 group text-center flex flex-col items-center"
              >
                <img
                  src={item.iconUrl}
                  alt={item.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-4 sm:mb-5 mx-auto group-hover:scale-105 transition-transform duration-300 object-contain"
                />
                <h3 className="text-base sm:text-lg font-black text-[#0a2e1a] mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          4. CTA
      ══════════════════════════════════ */}
      <section
        className="py-14 sm:py-20 px-4 sm:px-6 md:px-14 mx-3 sm:mx-4 md:mx-8 mb-6 sm:mb-8 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden relative mt-10 sm:mt-12"
        style={{ background: 'linear-gradient(135deg, #0a2e1a 0%, #0f4c35 60%, #1a6b4a 100%)' }}
      >
        <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#4ade80] blur-[100px] sm:blur-[120px] opacity-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.span
              variants={fadeUp}
              className="inline-block text-[#4ade80] text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-5 sm:mb-6 border border-[#4ade80]/30"
            >
              Hemen Başlayın
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="text-2xl sm:text-3xl md:text-5xl font-black text-white leading-tight mb-4 sm:mb-6"
            >
              Ağrısız Bir Yaşam İçin<br />
              <span className="text-[#4ade80]">Dijital Rehberin Burada.</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-white/70 text-sm sm:text-base mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed"
            >
              MyFlexio hesabı oluşturmak ücretsizdir. Vücudunu dinle ve ilk adımı bugün at.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 bg-[#4ade80] text-[#0a2e1a] font-bold px-8 sm:px-10 py-4 rounded-full hover:bg-[#22c55e] transition-all duration-300 shadow-lg shadow-green-500/30 text-sm min-h-[52px]"
              >
                Ücretsiz Başla
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center bg-white/10 text-white border border-white/20 font-semibold px-8 sm:px-10 py-4 rounded-full hover:bg-white/20 transition-all duration-300 text-sm min-h-[52px]"
              >
                Giriş Yap
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          5. FOOTER
      ══════════════════════════════════ */}
      <footer className="bg-[#0a2e1a] px-4 sm:px-6 md:px-14 pt-10 sm:pt-14 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="pb-8 sm:pb-10 border-b border-white/10">
            <div className="mb-3 sm:mb-4">
              <img src="/logo.png" alt="MyFlexio" className="h-10 sm:h-12 w-auto brightness-0 invert" />
            </div>
            <p className="text-white/50 text-xs sm:text-sm leading-relaxed max-w-xs">
              Uzman fizyoterapistler ile hastalar arasındaki köprü.
              Her yerden, her zaman profesyonel sağlık hizmeti.
            </p>
          </div>

          <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-white/30 text-xs">© 2026 MyFlexio. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
