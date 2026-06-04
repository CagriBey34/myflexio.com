import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AlertCircle, CheckCircle, User, Calendar, 
  FileText, MapPin, Activity, ArrowRight, 
  Search, ClipboardCheck, Heart, ChevronRight 
} from 'lucide-react';
import { getProfile } from '../../services/hastaService';
import Button from '../../../../shared/components/ui/Button';

export default function HastaDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Profil yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Veriler Getiriliyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-10 bg-white border-2 border-red-100 rounded-[2.5rem] shadow-2xl shadow-red-100/50">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">Bir Hata Oluştu</h2>
        <p className="text-slate-500 font-medium mb-8">{error}</p>
        <Button onClick={fetchProfile} className="w-full bg-slate-900 py-4 rounded-2xl font-black uppercase text-sm">
          Tekrar Dene
        </Button>
      </div>
    );
  }

  const isProfileComplete = profile?.profile_completed_at;

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 pb-24 lg:pb-12">

      {/* --- HEADER: KARŞILAMA --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter italic">
            Hoş Geldin, {profile?.ad} ✨
          </h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
             Sağlık Yolculuğun Burada Başlıyor
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 bg-white p-2 pr-4 sm:pr-6 rounded-3xl border border-slate-100 shadow-sm w-fit">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black italic">
                {profile?.ad?.[0]}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Profil Durumu</p>
                <p className={`text-xs font-black uppercase mt-1 ${isProfileComplete ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {isProfileComplete ? '● Tamamlandı' : '● Eksik Bilgi'}
                </p>
            </div>
        </div>
      </div>

      {/* --- UYARI: PROFİL TAMAMLA --- */}
      {!isProfileComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-600 rounded-[2rem] p-4 sm:p-6 md:p-8 lg:p-12 text-white shadow-2xl shadow-blue-200 relative overflow-hidden"
        >
          <Activity size={200} className="absolute -right-10 -bottom-10 text-white opacity-10" />
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter mb-3 italic">
              Profilinizi Tamamlayın!
            </h3>
            <p className="text-blue-100 font-bold text-sm sm:text-base lg:text-lg mb-5 sm:mb-8 leading-relaxed">
              Size en uygun uzmanları yapay zeka ile eşleştirebilmemiz için ağrı bölgesi ve tıbbi geçmişinizi eklemelisiniz.
            </p>
            <Button
              onClick={() => navigate('/hasta/profile/complete')}
              className="bg-white text-blue-600 hover:bg-slate-50 px-10 py-4 rounded-2xl font-black text-sm uppercase flex items-center gap-2 shadow-xl shadow-blue-900/20 transition-all active:scale-95"
            >
              Hemen Tamamla <ArrowRight size={18} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* --- QUICK STATS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
        {[
          { label: 'Aktif Randevular', val: '0', icon: <Calendar size={20}/>, bg: 'bg-white', text: 'text-blue-600' },
          { label: 'Tıbbi Raporlar', val: profile?.medicalReports?.length || 0, icon: <FileText size={20}/>, bg: 'bg-white', text: 'text-indigo-600' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -3 }}
            className="bg-white border border-slate-100 p-4 sm:p-5 md:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm flex items-center justify-between"
          >
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">
                    {stat.label}
                </p>
                <p className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900">
                    {stat.val}
                </p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 ${stat.text}`}>
                {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6 lg:gap-8">

        {/* --- LOKASYON & ÖZET (BENTO) --- */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-5 md:space-y-6">
            {isProfileComplete ? (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm relative overflow-hidden">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 mb-4 sm:mb-6 md:mb-8 tracking-tight flex items-center gap-2">
                        <ClipboardCheck className="text-blue-600" /> Sağlık Özeti
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 relative z-10">
                        <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl">
                            <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm"><MapPin size={20}/></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lokasyon</p>
                                <p className="font-bold text-slate-900">{profile?.sehir}, {profile?.ilce}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl">
                            <div className="p-3 bg-white rounded-xl text-red-500 shadow-sm"><Heart size={20}/></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ağrı Bölgesi</p>
                                <p className="font-bold text-slate-900">{profile?.agri_bolgesi}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl">
                            <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm"><Search size={20}/></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tercih</p>
                                <p className="font-bold text-slate-900">
                                    {profile?.tedavi_tercihi === 'online' ? 'Görüntülü Görüşme' : 
                                     profile?.tedavi_tercihi === 'evde' ? 'Yerinde Tedavi' : 'Klinik Ziyareti'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl">
                            <div className="p-3 bg-white rounded-xl text-amber-500 shadow-sm"><Activity size={20}/></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ağrı Seviyesi</p>
                                <p className="font-black text-slate-900 text-xl">{profile?.agri_seviyesi}<span className="text-slate-400 text-sm">/10</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-12 text-center">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-sm">
                        <Activity size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Profil Bilgileri Eksik</h3>
                    <p className="text-slate-400 text-sm font-bold mt-2">Özetinizi görmek için profilinizi tamamlayın.</p>
                </div>
            )}
        </div>

        {/* --- HIZLI İŞLEMLER --- */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[2rem] p-4 sm:p-5 md:p-6 lg:p-8 shadow-sm h-fit">
            <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 mb-4 sm:mb-5 md:mb-6 lg:mb-8 uppercase tracking-tighter italic">Hızlı İşlemler</h2>
            <div className="space-y-3">
                {[
                    { label: 'Uzman Ara', to: '/hasta/uzmanlar', icon: <Search size={18}/>, disabled: !isProfileComplete, primary: true },
                    { label: 'Değerlendirme Yap', to: '/hasta/assessment', icon: <ClipboardCheck size={18}/>, disabled: !isProfileComplete, primary: false },
                    { label: 'Profilimi Gör', to: '/hasta/profile', icon: <User size={18}/>, disabled: false, primary: false },
        {/*             { label: 'Blogu İncele', to: '/articles', icon: <FileText size={18}/>, disabled: false, primary: false }, */}
                ].map((action, i) => (
                    <button
                        key={i}
                        disabled={action.disabled}
                        onClick={() => navigate(action.to)}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                        ${action.disabled ? 'opacity-30 cursor-not-allowed bg-slate-50 text-slate-400' : 
                          action.primary ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 hover:bg-blue-700' : 
                          'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                    >
                        <span className="flex items-center gap-3">{action.icon} {action.label}</span>
                        <ChevronRight size={16} />
                    </button>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}
