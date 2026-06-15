import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';
import {
  LogOut, User, Star,
  ChevronRight, LayoutDashboard,
  Search, ShieldCheck, Calendar, Users, Menu, X
} from 'lucide-react';

export default function DashboardLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavItems = () => {
        if (user?.role === 'uzman') {
            return [
                { to: '/uzman/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { to: '/uzman/profile', icon: User, label: 'Profilim' },
                { to: '/uzman/randevular', icon: Calendar, label: 'Randevular' },
               /*  { to: '/uzman/reviews', icon: Star, label: 'Değer.' }, */
            ];
        } else if (user?.role === 'hasta') {
            return [
                { to: '/hasta/dashboard', icon: LayoutDashboard, label: 'Genel' },
                { to: '/hasta/profile', icon: User, label: 'Profil' },
                { to: '/hasta/randevular', icon: Calendar, label: 'Randevular' },
                { to: '/hasta/uzmanlar', icon: Search, label: 'Uzman Bul' },
            ];
        } else if (user?.role === 'admin') {
            return [
                { to: '/admin/dashboard',        icon: LayoutDashboard, label: 'Yönetim' },
                { to: '/admin/kullanicilar',     icon: ShieldCheck,     label: 'Onaylar' },
                { to: '/admin/randevular',       icon: Calendar,        label: 'Randevular' },
                { to: '/admin/profiller',        icon: Users,           label: 'Profiller' },
                { to: '/admin/yorumlar',         icon: Star,            label: 'Yorumlar' },
            ];
        }
        return [];
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans relative overflow-hidden">

            {/* --- ARKA PLAN DEKORU --- */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#4ade80] blur-[150px] opacity-[0.03]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#0f4c35] blur-[150px] opacity-[0.02]" />
            </div>

            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-[#0a2e1a] text-white z-50 shadow-2xl overflow-hidden hidden lg:flex flex-col border-r border-[#0f4c35]">

                {/* Logo */}
                <div className="p-6">
                    <div className="cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="MyFlexio" className="h-16 w-auto brightness-0 invert" />
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 mt-2 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center justify-between group px-4 py-3 rounded-2xl transition-all duration-300 ${
                                    isActive
                                    ? 'bg-[#16a34a] text-white shadow-lg shadow-green-900/40'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon
                                        size={18}
                                        className={`transition-colors ${isActive ? 'text-white' : 'text-white/40 group-hover:text-[#4ade80]'}`}
                                    />
                                    <span className="font-bold text-sm tracking-wide">{item.label}</span>
                                </div>
                                {isActive && <ChevronRight size={14} className="text-[#4ade80]" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#4ade80]/10 to-transparent pointer-events-none" />

                {/* Logout */}
                <div className="p-4 border-t border-white/5 bg-[#0a2e1a]/80 backdrop-blur-md relative z-20">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-400 font-bold hover:bg-rose-500/10 transition-all w-full group border border-transparent hover:border-rose-500/20"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm">Güvenli Çıkış</span>
                    </button>
                </div>
            </aside>

            {/* --- MOBİL TOP HEADER --- */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a2e1a] text-white px-4 py-3 flex items-center justify-between shadow-lg">
                <div className="cursor-pointer" onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="MyFlexio" className="h-12 w-auto brightness-0 invert" />
                </div>
                <button
                    onClick={() => setMobileMenuOpen(v => !v)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10"
                >
                    {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </header>

            {/* --- MOBİL MENÜ OVERLAY --- */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-[#0a2e1a]/95 flex flex-col pt-16 pb-24 px-4 overflow-y-auto">
                    <nav className="space-y-2 mt-4">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.to;
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold transition-all ${
                                        isActive
                                        ? 'bg-[#16a34a] text-white'
                                        : 'text-white/60'
                                    }`}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="mt-auto pt-6 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-5 py-4 rounded-2xl text-rose-400 font-bold w-full"
                        >
                            <LogOut size={20} />
                            Güvenli Çıkış
                        </button>
                    </div>
                </div>
            )}

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 lg:ml-64 min-h-screen flex flex-col relative z-10">
                <main className="pt-14 lg:pt-0 p-3 sm:p-5 md:p-7 lg:p-8 flex-1">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* --- MOBİL BOTTOM NAV --- */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-2xl">
                <div className="flex items-center justify-around px-1 py-1">
                    {navItems.slice(0, 5).map((item) => {
                        const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-0 flex-1 ${
                                    isActive ? 'text-[#16a34a]' : 'text-gray-400'
                                }`}
                            >
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                                <span className="text-[9px] font-black uppercase tracking-tight truncate w-full text-center leading-none mt-0.5">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
                {/* Safe area for iOS */}
                <div className="h-safe-area-inset-bottom bg-white" style={{height: 'env(safe-area-inset-bottom)'}} />
            </nav>
        </div>
    );
}
