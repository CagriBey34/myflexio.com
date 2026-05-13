import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';
import { 
  LogOut, User, FileText, Star, 
  ChevronRight, LayoutDashboard, BookSearch, 
  Search, ShieldCheck, HeartPulse, Calendar, Users
} from 'lucide-react';

export default function DashboardLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavItems = () => {
        if (user?.role === 'uzman') {
            return [
                { to: '/uzman/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { to: '/uzman/profile', icon: User, label: 'Profilim' },
                { to: '/uzman/randevular', icon: Calendar, label: 'Randevularım' },
                { to: '/uzman/articles', icon: FileText, label: 'Makalelerim' },
                { to: '/uzman/reviews', icon: Star, label: 'Değerlendirmeler' }
            ];
        } else if (user?.role === 'hasta') {
            return [
                { to: '/hasta/dashboard', icon: LayoutDashboard, label: 'Genel Bakış' },
                { to: '/hasta/profile', icon: User, label: 'Sağlık Profilim' },
                { to: '/hasta/randevular', icon: Calendar, label: 'Randevularım' },
                { to: '/hasta/uzmanlar', icon: Search, label: 'Uzman Bul' },
                { to: '/articles', icon: BookSearch, label: 'Makaleler' }
            ];
        } else if (user?.role === 'admin') {
            return [
                { to: '/admin/dashboard',        icon: LayoutDashboard, label: 'Yönetim' },
                { to: '/admin/kullanicilar',     icon: ShieldCheck,     label: 'Uzman Onayları' },
                { to: '/admin/randevular',       icon: Calendar,        label: 'Randevular' },
                { to: '/admin/profiller',        icon: Users,           label: 'Profiller' },
                { to: '/admin/yorumlar',         icon: Star,            label: 'Yorumlar' },
                { to: '/admin/sorular',          icon: FileText,        label: 'Assessment Soruları' },
            ];
        }
        return [];
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans relative overflow-hidden">
            
            {/* --- MAIN CONTENT ARKA PLAN DEKORU --- */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#4ade80] blur-[150px] opacity-[0.03]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#0f4c35] blur-[150px] opacity-[0.02]" />
            </div>

            {/* --- MODERN SIDEBAR --- */}
            <aside className="fixed left-0 top-0 h-full w-72 bg-[#0a2e1a] text-white z-50 shadow-2xl overflow-hidden hidden lg:block border-r border-[#0f4c35]">
                
                {/* Logo & Brand */}
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-2 cursor-pointer transition-transform hover:scale-105" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-[#4ade80] rounded-xl flex items-center justify-center shadow-lg shadow-green-900/50">
                            <HeartPulse size={24} className="text-[#0a2e1a]" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">MyFlexio</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="mt-2 px-4 space-y-2 relative z-10">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center justify-between group px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                                    isActive 
                                    ? 'bg-[#16a34a] text-white shadow-lg shadow-green-900/40' 
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon 
                                        size={20} 
                                        className={`transition-colors ${isActive ? 'text-white' : 'text-white/40 group-hover:text-[#4ade80]'}`} 
                                    />
                                    <span className="font-bold text-sm tracking-wide">{item.label}</span>
                                </div>
                                {isActive && <ChevronRight size={16} className="text-[#4ade80]" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Arka Plan Işıltısı (Sidebar İçi) */}
                <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#4ade80]/10 to-transparent pointer-events-none opacity-50" />

                {/* User Card & Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/5 bg-[#0a2e1a]/80 backdrop-blur-md z-20">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-rose-400 font-bold hover:bg-rose-500/10 transition-all w-full group border border-transparent hover:border-rose-500/20"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm">Güvenli Çıkış</span>
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 lg:ml-72 min-h-screen flex flex-col relative z-10">
                {/* Dashboard Page Content */}
                <main className="p-6 md:p-10 flex-1">
                    {/* Bento Grid Wrapper for Outlet Content */}
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}