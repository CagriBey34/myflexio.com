import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartPulse, ShieldCheck, Instagram, Phone, Mail, 
  Menu, X, ArrowUpRight
} from 'lucide-react';

export default function PublicLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // Scroll durumuna göre Navbar'a blur ve zemin ekle
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-[#0A2E26] font-sans selection:bg-[#0D9488] selection:text-white">
            
            {/* ═══════════════════════════════════════
                HEADER (Zarif & Dinamik)
            ═══════════════════════════════════════ */}
        

            {/* ═══════════════════════════════════════
                MOBİL MENÜ OVERLAY
            ═══════════════════════════════════════ */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 bg-[#F8FAF9] z-40 lg:hidden flex flex-col px-6 pt-32 pb-12"
                    >
                        <div className="flex flex-col gap-8">
                            <Link to="/uzmanlar" className="text-4xl font-black tracking-tighter text-[#0A2E26] hover:text-[#0D9488] transition-colors">Uzman Bul.</Link>
                            <Link to="/nasil-calisir" className="text-4xl font-black tracking-tighter text-[#0A2E26] hover:text-[#0D9488] transition-colors">Sistem.</Link>
                            <Link to="/articles" className="text-4xl font-black tracking-tighter text-[#0A2E26] hover:text-[#0D9488] transition-colors">Blog.</Link>
                        </div>
                        
                        <div className="mt-auto border-t border-black/10 pt-8 flex flex-col gap-6">
                            <Link to="/login" className="text-lg font-bold text-[#0A2E26]">Giriş Yap</Link>
                            <Link to="/register" className="px-8 py-4 bg-[#0D9488] text-white rounded-full text-center text-sm font-bold tracking-wide">
                                Ücretsiz Hesap Oluştur
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════
                MAIN CONTENT (OUTLET)
            ═══════════════════════════════════════ */}
            <main className="flex-grow w-full flex flex-col">
                <Outlet />
            </main>

            {/* ═══════════════════════════════════════
                FOOTER (Derin & Güven Veren)
            ═══════════════════════════════════════ */}
            <footer className="bg-[#0A2E26] text-[#F8FAF9] pt-24 pb-12 mt-auto relative overflow-hidden rounded-t-[2.5rem] md:rounded-t-[4rem] z-10">
                {/* Organik Işık Yansımaları */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#0D9488] rounded-full blur-[150px] opacity-20 pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#CCFBF1] rounded-full blur-[120px] opacity-10 pointer-events-none" />

                <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                    
                    {/* Üst Kısım: Sütunlar */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 mb-20">
                        
                        {/* 1. Marka Sütunu */}
                        <div className="md:col-span-4 flex flex-col">
                            <div className="flex items-center gap-2 mb-6">
                                <HeartPulse size={24} className="text-[#0D9488]" />
                                <span className="text-2xl font-black tracking-tight">MyFlexio</span>
                            </div>
                            <p className="text-white/60 font-medium leading-relaxed text-sm mb-2">
                                <span className="font-serif italic text-white/90 text-lg">"Esnekliğin, senin elinde."</span><br />
                                Uzman fizyoterapistlerle buluşmanın en doğal ve kolay yolu.
                            </p>
                            
                            {/* Sosyal Medya */}
                            <div className="mt-8">
                                <a
                                    href="https://instagram.com/myflexio"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#0D9488] hover:border-[#0D9488] transition-all duration-300 group"
                                    aria-label="Instagram"
                                >
                                    <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                            </div>
                        </div>

                        {/* 2. Navigasyon Sütunu */}
                        <div className="md:col-span-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0D9488] mb-8">Platform</h4>
                            <ul className="space-y-4">
                                {[
                                    { label: 'Uzman Bul', to: '/uzmanlar' },
                                    { label: 'Makaleler', to: '/articles' },
                                    { label: 'Giriş Yap', to: '/login' },
                                    { label: 'Kayıt Ol', to: '/register' },
                                ].map((item) => (
                                    <li key={item.to}>
                                        <Link
                                            to={item.to}
                                            className="text-sm font-medium text-white/50 hover:text-white hover:translate-x-1 transition-all inline-block"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 3. Hizmetler Sütunu */}
                        <div className="md:col-span-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0D9488] mb-8">Odak Alanları</h4>
                            <ul className="space-y-4 text-sm font-medium text-white/50">
                                <li className="hover:text-white hover:translate-x-1 transition-all cursor-pointer">Omurga Sağlığı</li>
                                <li className="hover:text-white hover:translate-x-1 transition-all cursor-pointer">Sporcu Rehab.</li>
                                <li className="hover:text-white hover:translate-x-1 transition-all cursor-pointer">Postür Düzeltme</li>
                                <li className="hover:text-white hover:translate-x-1 transition-all cursor-pointer">Ofis Ergonomisi</li>
                            </ul>
                        </div>

                        {/* 4. İletişim & Güvenlik Sütunu */}
                        <div className="md:col-span-4 flex flex-col gap-6">
                            {/* İletişim Kartı */}
                            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0D9488] mb-6">İletişim</h4>
                                <div className="space-y-5">
                                    <a href="tel:+908501234567" className="flex items-center gap-4 text-white/70 hover:text-white transition-colors group">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#0D9488]/20 transition-colors">
                                            <Phone size={16} className="text-[#0D9488]" />
                                        </div>
                                        <span className="text-sm font-medium">0850 123 45 67</span>
                                    </a>
                                    <a href="mailto:destek@myflexio.com" className="flex items-center gap-4 text-white/70 hover:text-white transition-colors group">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#0D9488]/20 transition-colors">
                                            <Mail size={16} className="text-[#0D9488]" />
                                        </div>
                                        <span className="text-sm font-medium">destek@myflexio.com</span>
                                    </a>
                                </div>
                            </div>

                            {/* Güvenlik Kartı */}
                            <div className="p-6 bg-[#0D9488]/10 rounded-3xl border border-[#0D9488]/20 flex items-start gap-4">
                                <ShieldCheck size={24} className="text-[#CCFBF1] flex-shrink-0 mt-1" strokeWidth={1.5} />
                                <div>
                                    <p className="text-[10px] font-bold text-[#CCFBF1] uppercase tracking-[0.2em] mb-1.5">Klinik Güvenlik</p>
                                    <p className="text-xs text-white/60 font-medium leading-relaxed">
                                        Tüm tıbbi verileriniz uçtan uca 256-bit AES şifreleme protokolü ile korunmaktadır.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alt Bar: Telif & Hukuki */}
                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-center md:text-left">
                            © 2026 MyFlexio. Tüm hakları saklıdır.
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-6">
                            <a href="#" className="text-[10px] font-bold text-white/40 hover:text-[#CCFBF1] uppercase tracking-widest transition-colors">KVKK</a>
                            <a href="#" className="text-[10px] font-bold text-white/40 hover:text-[#CCFBF1] uppercase tracking-widest transition-colors">Gizlilik Politikası</a>
                            <a href="#" className="text-[10px] font-bold text-white/40 hover:text-[#CCFBF1] uppercase tracking-widest transition-colors">Kullanım Şartları</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
