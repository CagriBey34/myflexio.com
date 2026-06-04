import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AlertCircle, CheckCircle, Clock, FileText, 
  Users, Calendar, ChevronRight, Activity, 
  ShieldCheck, MapPin, GraduationCap, Mail, Phone 
} from 'lucide-react';
import { getProfile } from '../../services/uzmanService';
import Button from '../../../../shared/components/ui/Button';

export default function UzmanDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
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

  const renderStatusAlert = () => {
    // 1. ONAY BEKLİYOR (Pending)
    if (profile?.status === 'pending_approval') {
      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white border-2 border-amber-100 rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-xl shadow-amber-100/20"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Clock size={120} className="text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
              <Clock size={32} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Başvurunuz İnceleniyor</h3>
              <p className="text-slate-500 font-semibold max-w-xl mt-1">
                Kaydınız ekibimize ulaştı. Diplomalarınız manuel olarak doğrulanıyor. Bu süreç genellikle 24-48 saat sürer.
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs font-black text-amber-700 uppercase tracking-widest">
                <span className="bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1">
                   <Calendar size={14} /> Kayıt: {new Date(profile.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    // 2. ONAYLANDI AMA PROFİL EKSİK (Approved)
    if (profile?.status === 'active' && !profile?.profile_completed_at) {
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
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter mb-3">Harika Haber! Başvurunuz Onaylandı.</h3>
            <p className="text-blue-100 font-medium text-sm sm:text-base lg:text-lg max-w-2xl mb-5 sm:mb-8">
              Sistemi aktif olarak kullanmaya ve hasta kabul etmeye başlamak için profil bilgilerinizi tamamlamanız gerekiyor.
            </p>
            <Button
              onClick={() => navigate('/uzman/profile/complete')}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-2xl font-black text-sm uppercase flex items-center gap-2 shadow-xl shadow-blue-900/20"
            >
              Profilimi Tamamla <ChevronRight size={18} />
            </Button>
          </div>
        </motion.div>
      );
    }

    // 3. AKTİF (Active)
    if (profile?.status === 'active' && profile?.profile_completed_at) {
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
            <p className="text-xs font-black uppercase tracking-widest opacity-60">Sistem Durumu</p>
            <p className="font-bold">Profiliniz Aktif ve Yayında. Yeni hastalar sizi görebilir.</p>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 pb-24 lg:pb-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter italic">
            Merhaba, {profile?.ad} 👋
          </h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
            {profile?.unvan} | MyFlexio Uzman Paneli
          </p>
        </div>
        {/* <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-400 uppercase">Son Giriş</p>
                <p className="text-xs font-bold text-slate-700">Bugün, 09:42</p>
            </div>
            <div className="w-12 h-12 bg-slate-200 rounded-2xl border-2 border-white shadow-sm overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${profile?.ad}+${profile?.soyad}&background=random`} alt="profil" />
            </div>
        </div> */}
      </div>

      {/* Status Alert Bölümü */}
      {renderStatusAlert()}

      {/* --- QUICK STATS (BENTO STYLE) --- */}
      {profile?.status === 'active' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {[
            { label: 'Toplam Hasta', val: '0', icon: <Users size={22}/>, color: 'blue' },
            { label: 'Randevular', val: '0', icon: <Calendar size={22}/>, color: 'indigo' },
            { label: 'Makaleler', val: '0', icon: <FileText size={22}/>, color: 'emerald' },
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
      )}

      {/* --- ANA İÇERİK: PROFİL ÖZETİ (BENTO) --- */}
      <div className="grid lg:grid-cols-12 gap-3 sm:gap-4 md:gap-5 lg:gap-6">

        {/* Sol Taraf: Profil Detayları */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white border border-slate-100 rounded-[2rem] p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="text-blue-600" /> Profil Bilgileri
            </h2>
            {profile?.status === 'active' && (
                <button onClick={() => navigate('/uzman/profile')} className="text-xs font-black text-blue-600 hover:underline uppercase">Düzenle</button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div className="flex gap-4">
              <div className="p-3 bg-slate-50 rounded-xl h-fit text-slate-400"><Mail size={20}/></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">E-Posta Adresi</p>
                <p className="font-bold text-slate-700">{profile.email}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-3 bg-slate-50 rounded-xl h-fit text-slate-400"><Phone size={20}/></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Telefon</p>
                <p className="font-bold text-slate-700">{profile.telefon}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-3 bg-slate-50 rounded-xl h-fit text-slate-400"><MapPin size={20}/></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Şehir / Lokasyon</p>
                <p className="font-bold text-slate-700">{profile.sehir || 'Belirtilmemiş'}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-3 bg-slate-50 rounded-xl h-fit text-slate-400"><GraduationCap size={20}/></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Mezuniyet Bilgisi</p>
                <p className="font-bold text-slate-700">
                   {profile.mezuniyet_okul || 'Bilgi girilmedi'} 
                   {profile.mezuniyet_yili && <span className="text-slate-400 ml-2 italic">({profile.mezuniyet_yili})</span>}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sağ Taraf: Durum Kartı veya Küçük Aksiyonlar */}
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="lg:col-span-4 space-y-6"
        >
            <div className="bg-slate-900 rounded-[2rem] p-4 sm:p-6 md:p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-20">
                    <Activity size={80} />
                </div>
                <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-2">Hesap Durumu</h4>
                <div className="flex items-center gap-3 mb-6">
                    <span className={`w-3 h-3 rounded-full animate-pulse ${
                        profile.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <span className="text-2xl font-bold">
                        {profile.status === 'active' ? 'Aktif' : 'Beklemede'}
                    </span>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    {profile.status === 'active' 
                        ? 'Profiliniz hastalar tarafından görüntülenebilir durumda.' 
                        : 'Onay süreciniz devam ederken profil bilgilerinizi eksiksiz doldurmanızı öneririz.'}
                </p>
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
