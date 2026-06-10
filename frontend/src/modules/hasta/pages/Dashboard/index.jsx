import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle, CheckCircle, Calendar, FileText,
  Activity, MapPin, Heart, Search, ClipboardCheck,
  User, ChevronRight
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
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Veriler Yükleniyor...</p>
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

  const isProfileComplete = !!profile?.profile_completed_at;

  const renderStatusAlert = () => {
    // 1. PROFİL EKSİK DURUMU
    if (!isProfileComplete) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600 rounded-[2rem] p-4 sm:p-6 md:p-8 lg:p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group"
        >
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Activity size={240} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md"><AlertCircle size={20}/></div>
              <span className="font-black uppercase tracking-widest text-xs">Harekete Geç</span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter mb-3">Profilinizi Tamamlayın!</h3>
            <p className="text-blue-100 font-medium text-sm sm:text-base lg:text-lg max-w-2xl mb-5 sm:mb-8 leading-relaxed">
              Size en uygun uzmanları yapay zeka ile eşleştirebilmemiz için ağrı bölgesi ve tıbbi geçmişinizi eklemelisiniz.
            </p>
            <Button
              onClick={() => navigate('/hasta/profile/complete')}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-2xl font-black text-sm uppercase flex items-center gap-2 shadow-xl shadow-blue-900/20"
            >
              Hemen Tamamla <ChevronRight size={18} />
            </Button>
          </div>
        </motion.div>
      );
    }

    // 2. PROFİL TAMAMLANMIŞ / AKTİF DURUMU
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] p-6 flex items-center gap-4 text-emerald-900"
      >
        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
          <CheckCircle size={24} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest opacity-60">Profil Durumu</p>
          <p className="font-bold">Profiliniz Tamamlandı. Uzman arayabilir ve randevu alabilirsiniz.</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 pb-24 lg:pb-8">

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter italic">
            Hoş Geldin, {profile?.ad} ✨
          </h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
            Sağlık Yolculuğun Burada Başlıyor | MyFlexio Hasta Paneli
          </p>
        </div>
      </div>

      {/* --- STATUS ALERT BÖLÜMÜ --- */}
      {renderStatusAlert()}

      {/* --- QUICK STATS (BENTO STYLE) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {[
          { label: 'Aktif Randevular', val: '0', icon: <Calendar size={22}/>, color: 'blue' },
          { label: 'Tıbbi Raporlar', val: profile?.medicalReports?.length || 0, icon: <FileText size={22}/>, color: 'indigo' },
          { label: 'Ağrı Seviyesi', val: isProfileComplete ? (profile?.agri_seviyesi || '-') : '-', icon: <Activity size={22}/>, color: 'emerald' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -3 }}
            className="bg-white border border-slate-100 p-4 sm:p-5 rounded-[1.5rem] shadow-sm flex items-center gap-4"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 leading-none">{stat.val}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- ANA İÇERİK: SAĞLIK ÖZETİ (BENTO) --- */}
      <div className="grid lg:grid-cols-12 gap-3 sm:gap-4 md:gap-5 lg:gap-6">

        {/* Sol Taraf: Sağlık Detayları */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white border border-slate-100 rounded-[2rem] p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Heart className="text-blue-600" /> Sağlık Özeti
            </h2>
            {isProfileComplete && (
              <button onClick={() => navigate('/hasta/profile')} className="text-xs font-black text-blue-600 hover:underline uppercase">Düzenle</button>
            )}
          </div>

          {isProfileComplete ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div className="flex gap-4">
                <div className="p-3 bg-slate-50 rounded-xl h-fit text-slate-400"><MapPin size={20}/></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Şehir / Lokasyon</p>
                  <p className="font-bold text-slate-700">{profile?.sehir || 'Belirtilmemiş'}, {profile?.ilce || ''}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-3 bg-slate-50 rounded-xl h-fit text-slate-400"><Heart size={20}/></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Ağrı Bölgesi</p>
                  <p className="font-bold text-slate-700">{profile?.agri_bolgesi || '-'}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-3 bg-slate-50 rounded-xl h-fit text-slate-400"><Search size={20}/></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tedavi Tercihi</p>
                  <p className="font-bold text-slate-700">
                    {profile?.tedavi_tercihi === 'online' ? 'Görüntülü Görüşme' :
                     profile?.tedavi_tercihi === 'evde' ? 'Yerinde Tedavi' : 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-3 bg-slate-50 rounded-xl h-fit text-slate-400"><Activity size={20}/></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Ağrı Seviyesi</p>
                  <p className="font-black text-slate-900 text-xl">{profile?.agri_seviyesi || '-'}<span className="text-slate-400 text-sm">/10</span></p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 md:py-16">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Activity size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Profil Bilgileri Eksik</h3>
              <p className="text-slate-400 text-sm font-bold mt-2">Özetinizi görmek için profilinizi tamamlayın.</p>
            </div>
          )}
        </motion.div>

        {/* Sağ Taraf: Durum Kartı + Hızlı İşlemler */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 space-y-6"
        >
          {/* Hesap Durumu */}
          <div className="bg-slate-900 rounded-[2rem] p-4 sm:p-6 md:p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20">
              <Activity size={80} />
            </div>
            <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-2">Profil Durumu</h4>
            <div className="flex items-center gap-3 mb-6">
              <span className={`w-3 h-3 rounded-full animate-pulse ${
                isProfileComplete ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
              <span className="text-2xl font-bold">
                {isProfileComplete ? 'Tamamlandı' : 'Eksik Bilgi'}
              </span>
            </div>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              {isProfileComplete
                ? 'Profiliniz uzmanlar tarafından görüntülenebilir durumda ve randevu alabilirsiniz.'
                : 'Uzman eşleşmesi ve sistem kullanımı için profil bilgilerinizi tamamlamanız gerekmektedir.'}
            </p>
          </div>

          {/* Hızlı İşlemler */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-4 sm:mb-6 uppercase tracking-tighter italic">Hızlı İşlemler</h2>
            <div className="space-y-3">
              {[
                { label: 'Uzman Ara', to: '/hasta/uzmanlar', icon: <Search size={18}/>, disabled: !isProfileComplete, primary: true },
                { label: 'Değerlendirme Yap', to: '/hasta/assessment', icon: <ClipboardCheck size={18}/>, disabled: !isProfileComplete, primary: false },
                { label: 'Profilimi Gör', to: '/hasta/profile', icon: <User size={18}/>, disabled: false, primary: false },
              ].map((action, i) => (
                <button
                  key={i}
                  disabled={action.disabled}
                  onClick={() => navigate(action.to)}
                  className={`w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
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

          {/* Hızlı Yardım / Destek */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6">
            <p className="text-xs font-black text-slate-900 uppercase mb-4 tracking-tighter">Yardıma mı ihtiyacınız var?</p>
            <a
              href="https://wa.me/905464509274"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full py-3 bg-slate-50 rounded-xl text-slate-600 text-xs font-bold hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              Destek Merkezi'ne Bağlan
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
}