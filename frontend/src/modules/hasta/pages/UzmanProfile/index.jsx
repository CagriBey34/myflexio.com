import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, GraduationCap, Award, Star,
  FileText, Calendar, ShieldCheck, ExternalLink,
  Activity, User, ChevronLeft, MessageSquare, Quote,
  HeartPulse, CalendarPlus, Video
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getUzmanProfile } from "../../services/uzmanService";

import RandevuModal from '../../components/RandevuModal';
import OnGorusmeModal from '../../components/OnGorusmeModal';

const anonymize = str => str ? str[0] + '*'.repeat(Math.max(str.length - 1, 1)) : '?';

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
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-800 font-bold text-xs uppercase tracking-widest">Uzman Profili Yükleniyor...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 mt-10">
        <HeartPulse size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Profil bulunamadı</h2>
        <p className="text-slate-500 font-medium mt-2">Aradığınız uzman profili mevcut değil veya yayından kaldırılmış olabilir.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
        >
          <ChevronLeft size={18} /> Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen py-6 sm:py-10 md:py-12 px-3 sm:px-5 md:px-8">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6 md:space-y-8 pb-28 lg:pb-8">

        {/* --- HEADER: ACTION BAR --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div>
            <span className="inline-block text-blue-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-2 sm:mb-3">
              Uzman Detayları
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tighter italic">
              Uzman Profili
            </h1>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
          >
            <ChevronLeft size={18} /> Geri Dön
          </button>
        </div>

        {/* --- MAIN PROFILE CARD --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-xl shadow-slate-900/5 border border-slate-100 p-5 sm:p-8 md:p-10 lg:p-12 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-[120px] opacity-10 pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 sm:gap-8 lg:gap-10 relative z-10">
            {/* Profile Photo Section */}
            <div className="relative group shrink-0">
              {profile.profil_fotograf_url ? (
                <img
                  src={profile.profil_fotograf_url}
                  alt={`${profile.ad} ${profile.soyad}`}
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-[2rem] object-cover shadow-xl ring-4 sm:ring-8 ring-blue-50 group-hover:scale-105 transition-transform duration-500 bg-white"
                />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl ring-4 sm:ring-8 ring-blue-50 group-hover:scale-105 transition-transform duration-500">
                  <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter">
                    {profile.ad?.[0]}{profile.soyad?.[0]}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-5 py-2.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 whitespace-nowrap">
                  <ShieldCheck size={16} className="text-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Onaylı Uzman</span>
              </div>
            </div>

            {/* Info & Stats Section */}
            <div className="flex-1 text-center lg:text-left space-y-6 pt-2">
              <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tighter">
                    {profile.ad} {profile.soyad}
                  </h2>
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                      <Award size={15}/> {profile.unvan || 'Fizyoterapist'}
                  </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6 max-w-2xl mx-auto lg:mx-0">
                {[
                  { icon: <Star size={18} fill="currentColor"/>, val: profile.reviews?.avgRating?.toFixed(1) || '0.0', label: 'Puan', color: 'text-yellow-500' },
                  { icon: <User size={18}/>, val: profile.reviews?.totalReviews || 0, label: 'Yorum', color: 'text-blue-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 p-3 sm:p-4 md:p-5 rounded-[1.5rem] sm:rounded-[2rem] group hover:border-blue-400/30 hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className={`flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2 ${stat.color}`}>
                      {stat.icon}
                      <span className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900">{stat.val}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Tags / Badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                {profile.sehir && (
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                    <MapPin size={16} className="text-blue-600" />
                    <span>{profile.sehir}{profile.ilce ? `, ${profile.ilce}` : ''}</span>
                  </div>
                )}
                {profile.mezuniyet_okul && (
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                    <GraduationCap size={16} className="text-blue-600" />
                    <span>{profile.mezuniyet_okul}</span>
                  </div>
                )}
                {profile.profile_completed_at && (
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                    <Calendar size={16} className="text-blue-600" />
                    <span>{new Date(profile.profile_completed_at).getFullYear()}'den beri</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT: BIO & EXPERTISE */}
          <div className="lg:col-span-7 space-y-8">

              {/* Hakkımda */}
              {profile.biyografi && (
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm"
              >
                  <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                      <HeartPulse className="text-blue-400" size={24}/> 
                      Hakkında
                  </h2>
                  <p className="text-slate-500 text-base leading-relaxed italic">"{profile.biyografi}"</p>
              </motion.div>
              )}

              {/* Uzmanlık Alanları */}
              {profile.uzmanlikAlanlari && Object.values(profile.uzmanlikAlanlari).some(arr => Array.isArray(arr) && arr.length > 0) && (
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm"
              >
                  <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <Activity className="text-blue-400" size={24} />
                    Uzmanlık Alanları
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-8">
                  {Object.entries(profile.uzmanlikAlanlari)
                      .filter(([, alanlar]) => Array.isArray(alanlar) && alanlar.length > 0)
                      .map(([kategori, alanlar]) => {
                          const KATEGORI_ETIKETLER = {
                              vucutBolgesi: 'Vücut Bölgesi',
                              tedaviYontemleri: 'Tedavi Yöntemleri',
                              ozelAlanlar: 'Özel Alanlar',
                              hastaliklar: 'Hastalıklar',
                          };
                          const tekil = [...new Set(alanlar)];
                          return (
                              <div key={kategori} className="space-y-4">
                                  <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-1">
                                      {KATEGORI_ETIKETLER[kategori] || kategori.replace(/([A-Z])/g, ' $1').trim()}
                                  </h3>
                                  <div className="flex flex-wrap gap-2.5">
                                      {tekil.map((alan) => (
                                      <span
                                          key={alan}
                                          className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:border-blue-400 hover:text-blue-600 transition-all cursor-default"
                                      >
                                          {alan}
                                      </span>
                                      ))}
                                  </div>
                              </div>
                          );
                      })
                  }
                  </div>
              </motion.div>
              )}

          </div>

          {/* RIGHT: RANDEVU AKSİYONLARI + CERTIFICATES */}
          <div className="lg:col-span-5 space-y-8">

              {/* Randevu / İletişim Kartı */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm"
              >
                <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
                  <CalendarPlus className="text-blue-400" size={24} /> Randevu İşlemleri
                </h2>
                <p className="text-xs text-slate-500 font-bold mb-6 leading-relaxed">
                  Uzmanımız ile iletişime geçmek için hemen ücretsiz bir ön görüşme planlayabilirsiniz.
                </p>
                
                <div className="space-y-3">
               {/*    <button
                    onClick={() => setShowRandevuModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                  >
                    <CalendarPlus size={18} /> Randevu Talep Et
                  </button> */}
                  <button
                    onClick={() => setShowOnGorusmeModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-black py-4 rounded-2xl transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                  >
                    <Video size={18} /> Ücretsiz Ön Görüşme
                  </button>
                </div>
              </motion.div>

              {/* Sertifikalar */}
              {profile.sertifikalar && profile.sertifikalar.length > 0 && (
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' }}
                  >
                      {/* Dekoratif blur */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 blur-[100px] opacity-20 rounded-full pointer-events-none" />

                      <h2 className="text-xl font-black mb-8 flex items-center gap-3 relative z-10">
                          <Award className="text-blue-400" size={24} /> 
                          Sertifikalar
                      </h2>
                      <div className="space-y-4 relative z-10">
                          {profile.sertifikalar.map((cert) => (
                          <div key={cert.id} className="group p-5 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all duration-300">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 flex items-center justify-center bg-blue-400/20 text-blue-400 rounded-xl">
                                    <FileText size={18}/>
                                  </div>
                                  <span className="font-bold text-sm text-white/90 leading-snug">{cert.adi}</span>
                              </div>
                              <a
                                href={cert.dosya_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center bg-white/10 text-white/70 hover:text-slate-900 hover:bg-blue-400 rounded-xl transition-all duration-300 shrink-0"
                              >
                                <ExternalLink size={18} />
                              </a>
                          </div>
                          ))}
                      </div>
                  </motion.div>
              )}
          </div>
        </div>

        {/* Modals */}
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

        {/* Reviews */}
        {profile.reviews?.reviews?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <MessageSquare className="text-blue-400" size={24} />
                Hasta Değerlendirmeleri
              </h2>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <Star size={15} className="text-yellow-500" fill="currentColor" />
                <span className="font-black text-slate-900 text-sm">{profile.reviews?.avgRating?.toFixed(1)}</span>
                <span className="text-blue-600 text-xs font-bold">({profile.reviews?.totalReviews} yorum)</span>
              </div>
            </div>
            <div className="space-y-4">
              {profile.reviews.reviews.map((review, idx) => {
                return (
                  <div key={review.id || idx} className="bg-slate-50 rounded-[1.5rem] p-5 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-sm font-black">
                          {anonymize(review.hastaAd)[0]}
                        </div>
                        <span className="text-sm font-black text-slate-900">
                          {anonymize(review.hastaAd)} {anonymize(review.hastaSoyad)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={13} className={s <= review.rating ? 'text-yellow-500' : 'text-slate-200'} fill={s <= review.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <div className="flex gap-2">
                        <Quote size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-600 italic leading-relaxed">{review.comment}</p>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 font-bold text-right mt-2">
                      {new Date(review.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}