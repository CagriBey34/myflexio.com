import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, HeartPulse, ShieldCheck, Activity,
  Bone, Star, UserCheck, Video, Clock, Globe,
  CheckCircle, BarChart2, Users, Award, Zap,
  Stethoscope, BookOpen, ChevronRight
} from 'lucide-react';

/* ─── Animasyon Varyantları ─────────────────────────────────── */
const fadeUp = {
  hidden: { y: 40, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

/* ─── Kemik / Eklem İkon Bileşenleri ─────────────────────────── */
function SpineIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
      <rect x="15" y="2" width="10" height="7" rx="2" fill="#bae6fd" />
      <rect x="15" y="11" width="10" height="7" rx="2" fill="#7dd3fc" />
      <rect x="15" y="20" width="10" height="7" rx="2" fill="#38bdf8" />
      <rect x="15" y="29" width="10" height="7" rx="2" fill="#0ea5e9" />
      <line x1="20" y1="9" x2="20" y2="11" stroke="#0ea5e9" strokeWidth="1.5" />
      <line x1="20" y1="18" x2="20" y2="20" stroke="#0ea5e9" strokeWidth="1.5" />
      <line x1="20" y1="27" x2="20" y2="29" stroke="#0ea5e9" strokeWidth="1.5" />
    </svg>
  );
}

function PostureIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
      <circle cx="20" cy="6" r="4" fill="#a5f3fc" />
      <path d="M20 10 L20 28" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 16 L12 22" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 16 L28 22" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 28 L14 36" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 28 L26 36" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SportIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
      <ellipse cx="20" cy="20" rx="14" ry="10" stroke="#7dd3fc" strokeWidth="2" />
      <path d="M10 15 Q20 8 30 15" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 25 Q20 32 30 25" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="3" fill="#0ea5e9" />
    </svg>
  );
}

function DeskIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
      <rect x="6" y="24" width="28" height="4" rx="2" fill="#bae6fd" />
      <rect x="10" y="12" width="8" height="12" rx="1" fill="#7dd3fc" />
      <rect x="8" y="10" width="12" height="3" rx="1" fill="#38bdf8" />
      <path d="M26 16 L30 28" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 22 L32 22" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Uzman Verisi ────────────────────────────────────────────── */
const experts = [
  { name: 'Ayşe Kaya', title: 'Uzm. Fzt.', specialty: 'Omurga Rehabilitasyonu', initial: 'AK', color: '#dcfce7' },
  { name: 'Mehmet Demir', title: 'Uzm. Fzt.', specialty: 'Sporcu Rehabilitasyonu', initial: 'MD', color: '#dbeafe' },
  { name: 'Selin Arslan', title: 'Uzm. Fzt.', specialty: 'Nörolojik Rehabilitasyon', initial: 'SA', color: '#fce7f3' },
  { name: 'Berk Yıldız', title: 'Uzm. Fzt.', specialty: 'Postür ve Skolyoz', initial: 'BY', color: '#fef3c7' },
  { name: 'Zeynep Çelik', title: 'Uzm. Fzt.', specialty: 'Pediatrik Fizyoterapi', initial: 'ZÇ', color: '#ede9fe' },
];

/* ─── Blog Verisi ─────────────────────────────────────────────── */
const blogPosts = [
  {
    tag: 'Ağrı Yönetimi',
    title: 'Sabahları Bel Ağrısıyla mı Uyanıyorsunuz? İşte 3 Temel Sebep.',
    desc: 'Sabah tutukluğu ve bel ağrısının ardında yatan gerçek nedenler ve evde uygulayabileceğiniz pratik çözümler.',
    readTime: '4 dk okuma',
    color: '#dcfce7',
    tagColor: '#16a34a',
  },
  {
    tag: 'Sık Sorulan Sorular',
    title: 'Online Fizyoterapi Hakkında Doğru Bilinen Yanlışlar.',
    desc: '"Ekrandan muayene olmaz" diyenlere gerçekleri anlatalım. Dijital fizyoterapi hakkındaki 5 büyük yanlış inanç.',
    readTime: '5 dk okuma',
    color: '#dbeafe',
    tagColor: '#1d4ed8',
  },
  {
    tag: 'Egzersiz',
    title: 'Masa Başında Dik Durmanızı Sağlayacak 5 Dakikalık Egzersiz.',
    desc: 'Günde 5 dakika ayırarak boyun ve sırt kaslarınızı güçlendirin. Ofiste yapabileceğiniz kolay ve etkili hareketler.',
    readTime: '3 dk okuma',
    color: '#fef3c7',
    tagColor: '#d97706',
  },
];

/* ─── ANA SAYFA ──────────────────────────────────────────────── */
export default function Home() {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} className="bg-white text-[#0a2e1a] font-sans overflow-hidden">

      {/* ══════════════════════════════════
          NAVBAR
      ══════════════════════════════════ */}
      <nav className="absolute top-0 left-0 w-full px-6 md:px-16 py-5 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#4ade80] flex items-center justify-center">
            <HeartPulse size={18} className="text-[#0a2e1a]" />
          </div>
          <span className="text-white text-xl font-black tracking-tight">MyFlexio</span>
        </div>
        {/*  <div className="hidden md:flex items-center gap-8 text-white/80 text-sm font-medium">
          <a href="#nasil-calisir" className="hover:text-white transition-colors">Nasıl Çalışır?</a>
          <a href="#tedavi-alanlari" className="hover:text-white transition-colors">Tedavi Alanları</a>
          <a href="#uzmanlar" className="hover:text-white transition-colors">Uzmanlar</a>
          <a href="#blog" className="hover:text-white transition-colors">Blog</a>
        </div> */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-black/20 backdrop-blur-md p-2 rounded-full">
          <Link to="/login" className="bg-[#ffff] text-[#0a2e1a] text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#22c55e] transition-colors">
            Giriş Yap
          </Link>
          <Link to="/register" className="bg-[#4ade80] text-[#0a2e1a] text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#22c55e] transition-colors">
            Başla
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════════
          1. HERO
      ══════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a2e1a 0%, #0f4c35 40%, #1a6b4a 100%)' }}>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-[#4ade80] blur-[120px] opacity-10" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-[#22c55e] blur-[100px] opacity-10" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 pt-28 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Sol: Metin */}
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 text-[#4ade80] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8 border border-[#4ade80]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
              Çevrimiçi Fizyoterapi Platformu
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-white leading-tight mb-6">
              Hareket Özgürlüğünü<br />
              <span className="text-[#4ade80]">Evine Taşı.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-white/70 text-lg leading-relaxed mb-10 max-w-lg">
              Uzman fizyoterapistler ile
              iyileşme sürecini bugün başlat.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              <Link to="/register" className="flex items-center gap-2 bg-[#4ade80] text-[#0a2e1a] font-bold px-8 py-4 rounded-full hover:bg-[#22c55e] transition-all duration-300 shadow-lg shadow-green-500/20 text-sm">
                Ücretsiz Başla
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="flex items-center gap-2 bg-white/10 text-white border border-white/20 font-semibold px-8 py-4 rounded-full hover:bg-white/20 transition-all duration-300 text-sm">
                Giriş Yap
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12 flex items-center gap-6 flex-wrap">
              {[
                { icon: <ShieldCheck size={15} />, text: 'KVKK Uyumlu' },
                { icon: <Award size={15} />, text: 'Lisanslı Uzmanlar' },
                {/*   { icon: <Star size={15} />, text: '4.8/5 Kullanıcı Puanı' }, */ }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/60 text-xs font-medium">
                  <span className="text-[#4ade80]">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Sağ: Görsel kart */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative flex justify-center"
          >
            <div className="relative w-full max-w-sm">
              {/* Ana kart */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#4ade80] flex items-center justify-center text-[#0a2e1a]">
                    <Video size={20} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Canlı Seans</div>
                    <div className="text-white/50 text-xs">15 Dk Ön Görüşme</div>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                </div>
                <div className="w-full h-36 rounded-2xl bg-[#0a2e1a]/40 flex items-center justify-center border border-white/10">
                  <Stethoscope size={48} className="text-[#4ade80]/40" strokeWidth={1} />
                </div>
                {/*    <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Uzman', value: '47+' },
                    { label: 'Hasta', value: '1.2K' },
                    { label: 'Puan', value: '4.8' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 text-center">
                      <div className="text-[#4ade80] font-black text-lg">{s.value}</div>
                      <div className="text-white/50 text-[10px]">{s.label}</div>
                    </div>
                  ))}
                </div> */}
              </div>

              {/* Yüzen rozetler */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2"
              >
                <CheckCircle size={16} className="text-[#16a34a]" />
                <span className="text-xs font-bold text-[#0a2e1a]">Seans tamamlandı ✓</span>
              </motion.div>

              {/*   <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2"
              >
                <Activity size={16} className="text-[#0ea5e9]" />
                <span className="text-xs font-bold text-[#0a2e1a]">İyileşme %73</span>
              </motion.div> */}
            </div>
          </motion.div>
        </div>

        {/* Alt dalga */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 30C1200 70 800 10 600 40C400 70 200 20 0 50Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════
          2. NASIL ÇALIŞIR?
      ══════════════════════════════════ */}
      <section id="nasil-calisir" className="py-24 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <span className="inline-block text-[#16a34a] text-xs font-bold uppercase tracking-widest bg-[#dcfce7] px-4 py-2 rounded-full mb-4">
              Nasıl Çalışır?
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-[#0a2e1a]">
              3 Adımda İyileşme
            </h2>
            <p className="text-gray-500 text-base mt-4 max-w-lg mx-auto">
              Karmaşık süreçler yok. Sadece üç adımda profesyonel fizyoterapi desteğine kavuş.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Bağlantı çizgisi */}
            <div className="hidden md:block absolute top-[3.5rem] left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-[2px] bg-gradient-to-r from-[#dcfce7] via-[#4ade80] to-[#dcfce7]" />

            {[
              {
                num: '01',
                icon: <BarChart2 size={30} />,
                title: 'Profilini Oluştur ve Raporlarını Yükle',
                desc: 'Geçmiş ameliyatlarını, MR/Röntgen raporlarını ve şikayetlerini sisteme gir. Seni bütünsel olarak anlayalım.',
                color: '#dcfce7',
                textColor: '#16a34a',
              },
              {
                num: '02',
                icon: <Video size={30} />,
                title: 'Uzmanla Online Görüş',
                desc: 'Sana en uygun fizyoterapisti seç ve ilk online muayeneni gerçekleştir. Evinin rahatlığında, güvenle.',
                color: '#dbeafe',
                textColor: '#1d4ed8',
              },
              {
                num: '03',
                icon: <Activity size={30} />,
                title: 'Sana Özel Hareket Çizelgeni Uygula',
                desc: 'Uzmanının senin için seçtiği profesyonel videoları izle, iyileşmeni takip et ve her gün biraz daha güçlen.',
                color: '#fef3c7',
                textColor: '#d97706',
              },
            ].map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Numara + İkon */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10"
                    style={{ background: step.color, color: step.textColor }}>
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0f4c35] text-white text-[10px] font-black flex items-center justify-center z-20">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#0a2e1a] mb-3 leading-tight">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="mt-14 text-center">
            <Link to="/register"
              className="inline-flex items-center gap-2 bg-[#0f4c35] text-white font-bold px-8 py-4 rounded-full hover:bg-[#16a34a] transition-colors text-sm shadow-lg shadow-green-900/20">
              Hemen Ücretsiz Başla
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          3. TEDAVİ ALANLARI
      ══════════════════════════════════ */}
      <section id="tedavi-alanlari" className="py-24 px-6 md:px-16 bg-[#f0fdf4]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <span className="inline-block text-[#16a34a] text-xs font-bold uppercase tracking-widest bg-[#dcfce7] px-4 py-2 rounded-full mb-4">
              Uzmanlık Alanlarımız
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-[#0a2e1a]">
              Tedavi Alanlarımız
            </h2>
            <p className="text-gray-500 text-base mt-4 max-w-lg mx-auto">
              Bedeninin her detayı bizim için önemli. Bütünsel sağlık yaklaşımıyla tasarlanmış kapsamlı tedavi alanları.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <SpineIcon />,
                title: 'Omurga Sağlığı',
                desc: 'Bel ve boyun fıtığı yönetimi. Disk problemleri ve kapsamlı omurga rehabilitasyonu.',
                tags: ['Bel Fıtığı', 'Boyun Fıtığı', 'Disk Problemleri'],
              },
              {
                icon: <PostureIcon />,
                title: 'Postür Düzeltme',
                desc: 'Duruş bozuklukları ve skolyoz için kişiselleştirilmiş destek ve egzersiz programları.',
                tags: ['Skolyoz', 'Kifoz', 'Duruş Analizi'],
              },
              {
                icon: <SportIcon />,
                title: 'Sporcu Rehabilitasyonu',
                desc: 'Sakatlık sonrası güvenli ve hızlı sahaya dönüş için uzman eşliğinde rehabilitasyon.',
                tags: ['Diz', 'Omuz', 'Ayak Bileği'],
              },
              {
                icon: <DeskIcon />,
                title: 'Ofis Ergonomisi',
                desc: 'Masabaşı çalışanlar için kronik ağrı yönetimi ve vücut mekaniği düzenlemesi.',
                tags: ['Boyun Ağrısı', 'Sırt Ağrısı', 'El Bilekleri'],
              },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}
                className="bg-white rounded-3xl p-7 border border-gray-100 hover:border-[#4ade80]/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                <div className="mb-5 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {item.icon}
                </div>
                <h3 className="text-lg font-black text-[#0a2e1a] mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{item.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, ti) => (
                    <span key={ti} className="text-[10px] font-bold text-[#0891b2] bg-[#e0f2fe] px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          4. UZMAN KADROMUZ
      ══════════════════════════════════ */}


      {/* ══════════════════════════════════
          5. İSTATİSTİKLER (Koyu alan)
      ══════════════════════════════════ */}
      {/*    <section className="py-20 px-6 md:px-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a2e1a 0%, #0f4c35 60%, #1a6b4a 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { value: '%97', label: 'Hasta Memnuniyeti' },
              { value: '120', label: 'Gün Ort. İyileşme Süresi' },
              { value: '4.8/5', label: 'Uygulama Puanı' },
              { value: '%93', label: 'Program Uyumu' },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="text-4xl md:text-5xl font-black text-[#4ade80] mb-2">{s.value}</div>
                <div className="text-white/60 text-sm font-medium">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      {/* ══════════════════════════════════
          6. BLOGDAN İPUÇLARI
      ══════════════════════════════════ */}


      {/* ══════════════════════════════════
          7. CTA
      ══════════════════════════════════ */}
      <section className="py-20 px-6 md:px-16 mx-4 md:mx-8 mb-8 rounded-[2rem] overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #0a2e1a 0%, #0f4c35 60%, #1a6b4a 100%)' }}>

        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#4ade80] blur-[120px] opacity-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.span variants={fadeUp}
              className="inline-block text-[#4ade80] text-xs font-bold uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full mb-6 border border-[#4ade80]/30">
              Hemen Başlayın
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
              Ağrısız Bir Yaşam İçin<br />
              <span className="text-[#4ade80]">Dijital Rehberin Burada.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70 text-base mb-10 max-w-xl mx-auto leading-relaxed">
              MyFlexio hesabı oluşturmak ücretsizdir. Vücudunu dinle ve ilk adımı bugün at.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#4ade80] text-[#0a2e1a] font-bold px-10 py-4 rounded-full hover:bg-[#22c55e] transition-all duration-300 shadow-lg shadow-green-500/30 text-sm">
                Ücretsiz Başla
                <ArrowRight size={16} />
              </Link>
              <Link to="/login"
                className="w-full sm:w-auto flex items-center justify-center bg-white/10 text-white border border-white/20 font-semibold px-10 py-4 rounded-full hover:bg-white/20 transition-all duration-300 text-sm">
                Giriş Yap
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          8. FOOTER
      ══════════════════════════════════ */}
      <footer className="bg-[#0a2e1a] px-6 md:px-16 pt-16 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#4ade80] flex items-center justify-center">
                  <HeartPulse size={18} className="text-[#0a2e1a]" />
                </div>
                <span className="text-white text-xl font-black tracking-tight">MyFlexio</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                Uzman fizyoterapistler ile hastalar arasındaki köprü.
                Her yerden, her zaman profesyonel sağlık hizmeti.
              </p>
            </div>

            {/*     <div>
              <div className="text-white font-bold text-sm mb-4">Platform</div>
              <ul className="space-y-2.5">
                {['Özellikler', 'Fiyatlandırma', 'Uzmanlar İçin', 'Kurumsal'].map((item, i) => (
                  <li key={i}><a href="#" className="text-white/50 text-sm hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div> */}

            {/*    <div>
              <div className="text-white font-bold text-sm mb-4">Şirket</div>
              <ul className="space-y-2.5">
                {['Hakkımızda', 'Blog', 'Kariyer', 'İletişim', 'KVKK'].map((item, i) => (
                  <li key={i}><a href="#" className="text-white/50 text-sm hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div> */}
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-xs">© 2026 MyFlexio. Tüm hakları saklıdır.</p>
           {/*  <div className="flex gap-6 text-white/30 text-xs">
              <a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a>
              <a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a>
              <a href="#" className="hover:text-white transition-colors">Çerez Politikası</a>
            </div> */}
          </div>

          <div className="mt-3 overflow-hidden">
            <div className="text-white/5 font-black text-[7rem] md:text-[11rem] leading-none tracking-tighter text-center select-none">
              MyFlexio
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
