import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit, Activity, User, ShieldAlert } from 'lucide-react';
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
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Profil Yükleniyor...</p>
      </div>
    );
  }

  const isProfileComplete = profile?.profile_completed_at;

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 pb-28 lg:pb-8">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic">Profil Detaylarım</h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
            Sağlık Verileriniz ve Kişisel Bilgileriniz
          </p>
        </div>
        {isProfileComplete && (
          <Button
            onClick={() => navigate('/hasta/profile/complete')}
            className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center gap-2"
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
          className="bg-blue-600 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <ShieldAlert size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black tracking-tighter mb-1">Profiliniz Henüz Tamamlanmadı</h3>
              <p className="text-blue-100 font-bold opacity-80">Uzman eşleşmesi ve randevular için eksik bilgileri tamamlayın.</p>
            </div>
            <Button
              onClick={() => navigate('/hasta/profile/complete')}
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black"
            >
              Şimdi Tamamla
            </Button>
          </div>
        </motion.div>
      )}

      {/* --- GRID LAYOUT --- */}
      <div className="grid lg:grid-cols-12 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
        {/* Sol Sütun: Temel & Tedavi */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 md:space-y-8">
          <BasicInfoCard profile={profile} />
          {isProfileComplete && <TreatmentCard profile={profile} />}
        </div>

        {/* Sağ Sütun: Tıbbi Geçmiş & Raporlar */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6 md:space-y-8">
          {isProfileComplete && (
            <>
              <MedicalHistoryCard profile={profile} />
              <MedicalReportsCard reports={reports} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}