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
            
        </div>
    );
}
