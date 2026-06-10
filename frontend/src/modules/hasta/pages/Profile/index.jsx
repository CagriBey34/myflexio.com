import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Edit, Activity, User, ShieldAlert, MapPin, 
  FileText, ShieldCheck, HeartPulse, Sparkles 
} from 'lucide-react';
import { getProfile, getMedicalReports } from '../../services/hastaService';
import Button from '../../../../shared/components/ui/Button';

// Alt Bileşenler
import BasicInfoCard from './components/BasicInfoCard';
import TreatmentCard from './components/TreatmentCard';
import MedicalHistoryCard from './components/MedicalHistoryCard';
import MedicalReportsCard from './components/MedicalReportsCard';

export default function HastaProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, reportsRes] = await Promise.all([
        getProfile(),
        getMedicalReports(),
      ]);
      setProfile(profileRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
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
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Profil Hazırlanıyor...</p>
      </div>
    );
  }

  const isProfileComplete = profile?.profile_completed_at;

  return (
    <div className="bg-slate-50/50 min-h-screen py-6 sm:py-10 md:py-12 px-3 sm:px-5 md:px-8">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6 md:space-y-8 pb-28 lg:pb-8">

        {/* --- HEADER: ACTION BAR --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div>
            <span className="inline-block text-blue-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full mb-2 sm:mb-3">
              Sağlık Profiliniz
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tighter italic">Profil Detaylarım</h1>
          </div>
          {isProfileComplete && (
            <Button
              onClick={() => navigate('/hasta/profile/edit')}
              className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-sm transition-all duration-300 shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
            >
              <Edit size={18} /> Profili Düzenle
            </Button>
          )}
        </div>

        {/* --- UYARI: EKSİK PROFİL --- */}
        {!isProfileComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-600 rounded-[2rem] p-6 md:p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group"
          >
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Activity size={240} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldAlert size={32} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tighter mb-1">Profiliniz Henüz Tamamlanmadı</h3>
                  <p className="text-blue-100 font-medium text-sm sm:text-base">Uzman eşleşmesi ve randevular için eksik bilgileri tamamlayın.</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/hasta/profile/complete')}
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shrink-0"
              >
                Şimdi Tamamla
              </Button>
            </div>
          </motion.div>
        )}

        {/* --- MAIN PROFILE HERO CARD --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-xl shadow-slate-900/5 border border-slate-100 p-5 sm:p-8 md:p-10 lg:p-12 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-[120px] opacity-10 pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 sm:gap-8 lg:gap-10 relative z-10">
            {/* Profil Fotoğrafı / Baş Harfler Bölümü */}
            <div className="relative group shrink-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-xl ring-4 sm:ring-8 ring-blue-50 group-hover:scale-105 transition-transform duration-500">
                <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter">
                  {profile?.ad?.[0]}{profile?.soyad?.[0] || 'H'}
                </span>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-5 py-2.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 whitespace-nowrap">
                <ShieldCheck size={16} className="text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Kayıtlı Üye</span>
              </div>
            </div>

            {/* İsim & Hızlı Metrikler */}
            <div className="flex-1 text-center lg:text-left space-y-6 pt-2">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tighter italic">
                  {profile?.ad} {profile?.soyad}
                </h2>
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                  <HeartPulse size={15}/> Hasta Hesabı
                </div>
              </div>

              {/* Hızlı Metrik Kartları (Bento) */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6 max-w-2xl mx-auto lg:mx-0">
                {[
                  { icon: <Activity size={18} />, val: isProfileComplete ? (profile?.agri_seviyesi || '-') : '-', label: 'Ağrı Seviyesi', color: 'text-amber-500' },
                  { icon: <FileText size={18} />, val: reports?.length || 0, label: 'Yüklenen Rapor', color: 'text-blue-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 p-3 sm:p-4 md:p-5 rounded-[1.5rem] sm:rounded-[2rem] group hover:border-blue-400/40 hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className={`flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2 ${stat.color}`}>
                      {stat.icon}
                      <span className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900">{stat.val}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Konum / Bilgi Etiketleri */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                {profile?.sehir && (
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                    <MapPin size={16} className="text-blue-600" />
                    <span>{profile.sehir}{profile.ilce ? `, ${profile.ilce}` : ''}</span>
                  </div>
                )}
                {profile?.tedavi_tercihi && (
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                    <Sparkles size={16} className="text-blue-600" />
                    <span>{profile.tedavi_tercihi === 'online' ? 'Görüntülü Görüşme' : 'Yerinde Tedavi'} Tercihi</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- GRID LAYOUT (BENTO CARDS) --- */}
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Sol Sütun: Temel Bilgiler & Tedavi Detayları */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <BasicInfoCard profile={profile} />
            {isProfileComplete && <TreatmentCard profile={profile} />}
          </div>

          {/* Sağ Sütun: Tıbbi Geçmiş & Sağlık Raporları */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            {isProfileComplete && (
              <>
                <MedicalHistoryCard profile={profile} />
                <MedicalReportsCard reports={reports} />
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}