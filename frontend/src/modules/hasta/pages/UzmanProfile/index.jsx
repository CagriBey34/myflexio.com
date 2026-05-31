import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, GraduationCap, Award, Star,
  FileText, Calendar, ShieldCheck, ExternalLink,
  Activity, User, ChevronLeft, ArrowRight
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getUzmanProfile } from "../../services/uzmanService";
import RandevuModal from '../../components/RandevuModal';
import OnGorusmeModal from '../../components/OnGorusmeModal';

export default function HastaUzmanProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRandevuModal, setShowRandevuModal] = useState(false);
  const [showOnGorusmeModal, setShowOnGorusmeModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchProfile = async () => {
      try {
        const response = await getUzmanProfile(id);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (location.state?.openRandevu) {
      setShowRandevuModal(true);
    }
  }, [location.state]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Profil Yükleniyor...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
        <Activity size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Profil bulunamadı</h2>
        <p className="text-slate-500 font-medium">Lütfen daha sonra tekrar deneyin.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">

      {/* Geri Butonu */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors"
      >
        <ChevronLeft size={18} /> Geri Dön
      </button>

      {/* --- MAIN PROFILE CARD --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl shadow-blue-100/50 border border-slate-100 p-8 md:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Activity size={300} className="text-blue-600" />
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 relative z-10">
          {/* Profil Fotoğrafı */}
          <div className="relative group">
            {profile.profil_fotograf_url ? (
              <img
                src={profile.profil_fotograf_url}
                alt={`${profile.ad} ${profile.soyad}`}
                className="w-48 h-48 rounded-[2.5rem] object-cover shadow-2xl ring-8 ring-blue-50 group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-48 h-48 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl ring-8 ring-blue-50">
                <span className="text-6xl font-black text-white italic tracking-tighter">
                  {profile.ad?.[0]}{profile.soyad?.[0]}
                </span>
              </div>
            )}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-100 flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Onaylı Uzman</span>
            </div>
          </div>

          {/* Bilgiler */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tighter">
                {profile.ad} {profile.soyad}
              </h2>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                <Award size={14} /> {profile.unvan}
              </div>
            </div>

            {/* Metrikler */}
            <div className="grid grid-cols-3 gap-3 md:gap-6">
              {[
                { icon: <Star size={18} fill="currentColor" />, val: profile.avgRating?.toFixed(1) || '0.0', label: 'Puan', color: 'text-yellow-500' },
                { icon: <User size={18} />, val: profile.totalReviews || 0, label: 'Yorum', color: 'text-blue-600' },
                { icon: <FileText size={18} />, val: profile.totalArticles || 0, label: 'Makale', color: 'text-indigo-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                  <div className={`flex items-center justify-center gap-1.5 mb-1 ${stat.color}`}>
                    {stat.icon}
                    <span className="text-xl md:text-2xl font-black text-slate-900">{stat.val}</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Konum & Okul */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
              {profile.sehir && (
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm bg-slate-50 px-4 py-2 rounded-2xl">
                  <MapPin size={18} className="text-blue-500" />
                  <span>{profile.sehir}{profile.ilce ? `, ${profile.ilce}` : ''}</span>
                </div>
              )}
              {profile.mezuniyet_okul && (
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm bg-slate-50 px-4 py-2 rounded-2xl">
                  <GraduationCap size={18} className="text-blue-500" />
                  <span>{profile.mezuniyet_okul}</span>
                </div>
              )}
              {profile.profile_completed_at && (
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm bg-slate-50 px-4 py-2 rounded-2xl">
                  <Calendar size={18} className="text-blue-500" />
                  <span>{new Date(profile.profile_completed_at).getFullYear()}'den beri</span>
                </div>
              )}
            </div>

            {/* Butonlar */}
            <div className="pt-4 flex flex-wrap gap-3">
              <button
                onClick={() => setShowOnGorusmeModal(true)}
                className="flex items-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
              >
                <Calendar size={18} /> Ücretsiz Ön Görüşme
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <RandevuModal
        isOpen={showRandevuModal}
        onClose={() => setShowRandevuModal(false)}
        uzmanProfileId={profile.id}
        uzmanAd={`${profile.unvan || ''} ${profile.ad} ${profile.soyad}`}
      />
      <OnGorusmeModal
        isOpen={showOnGorusmeModal}
        onClose={() => setShowOnGorusmeModal(false)}
        uzmanProfileId={profile.id}
        uzmanAd={`${profile.unvan || ''} ${profile.ad} ${profile.soyad}`}
      />

      <div className="grid lg:grid-cols-12 gap-8">
        {/* SOL: Bio & Uzmanlık */}
        <div className="lg:col-span-7 space-y-8">

          {/* Hakkımda */}
          {profile.biyografi && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm"
            >
              <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tighter flex items-center gap-3">
                <Activity className="text-blue-600" size={20} /> Hakkında
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed text-lg italic">"{profile.biyografi}"</p>
            </motion.div>
          )}

          {/* Uzmanlık Alanları */}
          {profile.uzmanlikAlanlari && Object.keys(profile.uzmanlikAlanlari).length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm"
            >
              <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tighter flex items-center gap-3">
                <Award className="text-blue-600" size={20} /> Uzmanlık Alanları
              </h2>
              <div className="grid sm:grid-cols-2 gap-8">
                {Object.entries(profile.uzmanlikAlanlari).map(([kategori, alanlar]) => (
                  Array.isArray(alanlar) && alanlar.length > 0 && (
                    <div key={kategori} className="space-y-3">
                      <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-1">
                        {kategori.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {/* Verideki tekrar eden uzmanlık alanlarını engellemek için Set kullanıldı */}
                        {[...new Set(alanlar)].map((alan, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl text-xs font-black border border-blue-100 shadow-sm"
                          >
                            {alan}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </motion.div>
          )}

          {/* Makaleler */}
          {profile.makaleler && profile.makaleler.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm"
            >
              <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tighter flex items-center gap-3">
                <FileText className="text-blue-600" size={20} /> Makaleleri
              </h2>
              <div className="space-y-4">
                {profile.makaleler.map((makale) => (
                  <div
                    key={makale.id}
                    onClick={() => navigate(`/articles/${makale.id}`)}
                    className="group flex items-center justify-between p-5 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl cursor-pointer transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-sm truncate group-hover:text-blue-700 transition-colors">
                        {makale.baslik}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(makale.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-4" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* SAĞ: Sertifikalar */}
        <div className="lg:col-span-5 space-y-8">
          {profile.sertifikalar && profile.sertifikalar.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl"
            >
              <h2 className="text-xl font-black mb-8 uppercase tracking-tighter flex items-center gap-3">
                <FileText className="text-blue-400" size={20} /> Sertifikalar
              </h2>
              <div className="space-y-4">
                {profile.sertifikalar.map((cert) => (
                  <div
                    key={cert.id}
                    className="group p-5 bg-slate-800/50 border border-slate-700/50 rounded-3xl flex items-center justify-between hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                        <Award size={20} />
                      </div>
                      <span className="font-bold text-sm text-slate-100 tracking-tight">{cert.adi}</span>
                    </div>
                    {cert.dosya_url && (
                      <a
                        href={cert.dosya_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-700 text-slate-300 hover:text-white hover:bg-blue-600 rounded-xl transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}