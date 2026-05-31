import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Edit, MapPin, GraduationCap, Award, Star,
  FileText, Calendar, ShieldCheck, ExternalLink, Activity, User, ArrowRight, HeartPulse,
  CreditCard, Check, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateIban } from '../../services/uzmanService';
import Button from '../../../../shared/components/ui/Button';

export default function UzmanProfileView() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ibanInput, setIbanInput] = useState('');
  const [ibanSaving, setIbanSaving] = useState(false);
  const [ibanMsg, setIbanMsg] = useState(null); // { type: 'success'|'error', text: string }

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
      setIbanInput(response.data?.iban_no || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIban = async () => {
    if (!ibanInput.trim()) return;
    setIbanSaving(true);
    setIbanMsg(null);
    try {
      await updateIban(ibanInput.trim());
      setIbanMsg({ type: 'success', text: 'IBAN kaydedildi' });
    } catch {
      setIbanMsg({ type: 'error', text: 'Kaydedilemedi, tekrar deneyin' });
    } finally {
      setIbanSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#0a2e1a] font-bold text-xs uppercase tracking-widest">Profil Hazırlanıyor...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-green-900/5 mt-10">
        <HeartPulse size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-black text-[#0a2e1a] tracking-tighter">Profil bulunamadı</h2>
        <p className="text-gray-500 font-medium mt-2">Lütfen daha sonra tekrar deneyin veya desteğe başvurun.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f0fdf4] min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        
        {/* --- HEADER: ACTION BAR --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-block text-[#16a34a] text-xs font-bold uppercase tracking-widest bg-[#dcfce7] px-4 py-2 rounded-full mb-3">
              Platformdaki Görünümünüz
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-[#0a2e1a] leading-tight">Profilim</h1>
          </div>
          <Button 
            onClick={() => navigate('/uzman/profile/edit')}
            className="bg-[#0f4c35] hover:bg-[#16a34a] text-white px-8 py-4 rounded-full font-bold text-sm transition-all duration-300 shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
          >
            <Edit size={18} /> Profili Düzenle
          </Button>
        </div>

        {/* --- MAIN PROFILE CARD --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[3rem] shadow-xl shadow-green-900/5 border border-gray-100 p-8 md:p-12 relative overflow-hidden"
        >
          {/* Arka Plan Dekorasyonu */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#4ade80] rounded-full blur-[120px] opacity-10 pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 relative z-10">
            {/* Profile Photo Section */}
            <div className="relative group shrink-0">
              {profile.profil_fotograf_url ? (
                <img
                  src={profile.profil_fotograf_url}
                  alt={`${profile.ad} ${profile.soyad}`}
                  className="w-48 h-48 rounded-[2.5rem] object-cover shadow-xl ring-8 ring-[#dcfce7] group-hover:scale-105 transition-transform duration-500 bg-white"
                />
              ) : (
                <div className="w-48 h-48 rounded-[2.5rem] bg-gradient-to-br from-[#0f4c35] to-[#1a6b4a] flex items-center justify-center shadow-xl ring-8 ring-[#dcfce7] group-hover:scale-105 transition-transform duration-500">
                  <span className="text-6xl font-black text-white tracking-tighter">
                    {profile.ad?.[0]}{profile.soyad?.[0]}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-5 py-2.5 rounded-full shadow-lg border border-gray-100 flex items-center gap-2 whitespace-nowrap">
                  <ShieldCheck size={16} className="text-[#16a34a]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0a2e1a]">Onaylı Uzman</span>
              </div>
            </div>

            {/* Info & Stats Section */}
            <div className="flex-1 text-center lg:text-left space-y-6 pt-2">
              <div>
                  <h2 className="text-4xl md:text-5xl font-black text-[#0a2e1a] mb-3 tracking-tighter">
                    {profile.ad} {profile.soyad}
                  </h2>
                  <div className="inline-flex items-center gap-2 bg-[#dcfce7] text-[#16a34a] px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                      <Award size={15}/> {profile.unvan || 'Fizyoterapist'}
                  </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto lg:mx-0">
                {[
                  { icon: <Star size={18} fill="currentColor"/>, val: profile.avgRating?.toFixed(1) || '0.0', label: 'Puan', color: 'text-[#fbbf24]' },
                  { icon: <User size={18}/>, val: profile.totalReviews || 0, label: 'Yorum', color: 'text-[#0ea5e9]' },
                  { icon: <FileText size={18}/>, val: profile.makaleler?.length || profile.totalArticles || 0, label: 'Makale', color: 'text-[#16a34a]' },
                ].map((stat, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-100 p-5 rounded-[2rem] group hover:border-[#4ade80]/40 hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className={`flex items-center justify-center gap-2 mb-2 ${stat.color}`}>
                      {stat.icon}
                      <span className="text-2xl md:text-3xl font-black text-[#0a2e1a]">{stat.val}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Tags / Badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                {profile.sehir && (
                  <div className="flex items-center gap-2 text-gray-600 font-bold text-sm bg-[#f0fdf4] px-4 py-2 rounded-2xl border border-green-100">
                    <MapPin size={16} className="text-[#16a34a]" />
                    <span>{profile.sehir}{profile.ilce ? `, ${profile.ilce}` : ''}</span>
                  </div>
                )}
                {profile.mezuniyet_okul && (
                  <div className="flex items-center gap-2 text-gray-600 font-bold text-sm bg-[#f0fdf4] px-4 py-2 rounded-2xl border border-green-100">
                    <GraduationCap size={16} className="text-[#16a34a]" />
                    <span>{profile.mezuniyet_okul}</span>
                  </div>
                )}
                {profile.profile_completed_at && (
                  <div className="flex items-center gap-2 text-gray-600 font-bold text-sm bg-[#f0fdf4] px-4 py-2 rounded-2xl border border-green-100">
                    <Calendar size={16} className="text-[#16a34a]" />
                    <span>{new Date(profile.profile_completed_at).getFullYear()}'den beri</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT: BIO & EXPERTISE & MAKALELER */}
          <div className="lg:col-span-7 space-y-8">

              {/* Hakkımda */}
              {profile.biyografi && (
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm"
              >
                  <h2 className="text-xl font-black text-[#0a2e1a] mb-6 flex items-center gap-3">
                      <HeartPulse className="text-[#4ade80]" size={24}/> 
                      Hakkımda
                  </h2>
                  <p className="text-gray-500 text-base leading-relaxed">{profile.biyografi}</p>
              </motion.div>
              )}

              {/* Uzmanlık Alanları */}
              {profile.uzmanlikAlanlari && Object.values(profile.uzmanlikAlanlari).some(arr => Array.isArray(arr) && arr.length > 0) && (
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm"
              >
                  <h2 className="text-xl font-black text-[#0a2e1a] mb-8 flex items-center gap-3">
                    <Activity className="text-[#4ade80]" size={24} />
                    Uzmanlık Alanlarım
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
                                  <h3 className="text-[10px] font-black text-[#16a34a] uppercase tracking-widest px-1">
                                      {KATEGORI_ETIKETLER[kategori] || kategori}
                                  </h3>
                                  <div className="flex flex-wrap gap-2.5">
                                      {tekil.map((alan) => (
                                      <span
                                          key={alan}
                                          className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl text-sm font-bold shadow-sm hover:border-[#4ade80] hover:text-[#16a34a] transition-all cursor-default"
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

              {/* Makalelerim */}
              {profile.makaleler && profile.makaleler.length > 0 && (
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm"
              >
                  <h2 className="text-xl font-black text-[#0a2e1a] mb-6 flex items-center gap-3">
                      <FileText className="text-[#4ade80]" size={24}/> 
                      Makalelerim
                  </h2>
                  <div className="space-y-4">
                      {profile.makaleler.map((makale) => (
                          <div
                              key={makale.id}
                              onClick={() => navigate(`/articles/${makale.id}`)}
                              className="group flex items-center justify-between p-6 bg-gray-50 hover:bg-[#f0fdf4] border border-gray-100 hover:border-[#4ade80]/40 rounded-3xl cursor-pointer transition-all duration-300"
                          >
                              <div className="flex-1 min-w-0 pr-4">
                                  <p className="font-black text-[#0a2e1a] text-base truncate group-hover:text-[#16a34a] transition-colors">
                                      {makale.baslik}
                                  </p>
                                  <p className="text-xs font-bold text-gray-400 mt-2">
                                      {new Date(makale.created_at).toLocaleDateString('tr-TR')}
                                  </p>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 group-hover:border-[#4ade80] group-hover:bg-[#4ade80] transition-colors shrink-0">
                                <ArrowRight size={18} className="text-gray-400 group-hover:text-[#0a2e1a] transition-colors" />
                              </div>
                          </div>
                      ))}
                  </div>
              </motion.div>
              )}
          </div>

          {/* RIGHT: IBAN + CERTIFICATES */}
          <div className="lg:col-span-5 space-y-8">

              {/* IBAN Kartı */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm"
              >
                <h2 className="text-xl font-black text-[#0a2e1a] mb-6 flex items-center gap-3">
                  <CreditCard className="text-[#4ade80]" size={24} /> IBAN Bilgisi
                </h2>
                <p className="text-xs text-gray-400 mb-4">Hastalar tedavi bedelini bu hesaba havale yapacak.</p>
                <input
                  type="text"
                  value={ibanInput}
                  onChange={(e) => { setIbanInput(e.target.value.toUpperCase()); setIbanMsg(null); }}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  maxLength={32}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4ade80] bg-white text-sm font-bold text-[#0a2e1a] tracking-widest mb-3 transition-all"
                />
                {ibanMsg && (
                  <p className={`text-xs font-bold mb-3 flex items-center gap-1.5 ${ibanMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {ibanMsg.type === 'success' ? <Check size={13} /> : <X size={13} />}
                    {ibanMsg.text}
                  </p>
                )}
                <button
                  onClick={handleSaveIban}
                  disabled={ibanSaving || !ibanInput.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-[#0f4c35] hover:bg-[#16a34a] disabled:opacity-50 text-white text-sm font-black py-3 rounded-2xl transition-all"
                >
                  {ibanSaving
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Check size={16} />
                  }
                  {ibanSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </motion.div>

              {profile.sertifikalar && profile.sertifikalar.length > 0 && (
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #0a2e1a 0%, #0f4c35 100%)' }}
                  >
                      {/* Dekoratif blur */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#4ade80] blur-[100px] opacity-10 rounded-full pointer-events-none" />

                      <h2 className="text-xl font-black mb-8 flex items-center gap-3 relative z-10">
                          <Award className="text-[#4ade80]" size={24} /> 
                          Sertifikalar
                      </h2>
                      <div className="space-y-4 relative z-10">
                          {profile.sertifikalar.map((cert) => (
                          <div key={cert.id} className="group p-5 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all duration-300">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 flex items-center justify-center bg-[#4ade80]/20 text-[#4ade80] rounded-xl">
                                    <FileText size={18}/>
                                  </div>
                                  <span className="font-bold text-sm text-white/90 leading-snug">{cert.adi}</span>
                              </div>
                              <a
                                href={cert.dosya_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 flex items-center justify-center bg-white/10 text-white/70 hover:text-[#0a2e1a] hover:bg-[#4ade80] rounded-xl transition-all duration-300 shrink-0"
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
      </div>
    </div>
  );
}