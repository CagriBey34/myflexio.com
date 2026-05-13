import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, GraduationCap, Award, Star, MessageSquare, 
  Calendar, FileText, Activity, ShieldCheck, Mail, MessageCircle, ArrowRight
} from 'lucide-react';

import { getUzmanProfile } from '../../services/uzmanService';
import { deleteReview } from '../../services/uzmanService';
import Button from '../../../../shared/components/ui/Button';
import ReviewModal from '../../components/ReviewModal';
import RandevuModal from '../../components/RandevuModal';
import OnGorusmeModal from '../../components/OnGorusmeModal';


// Alt Bileşenler
import RatingSummary from './components/RatingSummary';
import ReviewItem from './components/ReviewItem';
import InfoSection from './components/InfoSection';

export default function UzmanProfileDetail() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [showRandevuModal, setShowRandevuModal] = useState(false);
    const [showOnGorusmeModal, setShowOnGorusmeModal] = useState(false);


    useEffect(() => { fetchProfile(); }, [id]);

    const fetchProfile = async () => {
        try {
            const response = await getUzmanProfile(id);
            setProfile(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await deleteReview(reviewId);
            await fetchProfile();
        } catch (error) {
            console.error('Review delete error:', error);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Profil Hazırlanıyor...</p>
        </div>
    );

    if (!profile) return <div className="text-center py-20 font-black text-slate-400">UZMAN BULUNAMADI</div>;

    const { reviews } = profile;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* --- HERO HEADER CARD --- */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] shadow-2xl shadow-blue-100/50 border border-slate-100 p-8 md:p-12 relative overflow-hidden"
            >
                <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start relative z-10">
                    {/* Photo */}
                    <div className="relative shrink-0">
                        {profile.profil_fotograf_url ? (
                            <img src={profile.profil_fotograf_url} className="w-40 h-40 md:w-52 md:h-52 rounded-[2.5rem] object-cover shadow-2xl ring-8 ring-blue-50" />
                        ) : (
                            <div className="w-40 h-40 md:w-52 md:h-52 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl ring-8 ring-blue-50">
                                <span className="text-6xl font-black text-white italic">{profile.ad?.[0]}{profile.soyad?.[0]}</span>
                            </div>
                        )}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Müsait
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100">
                            <ShieldCheck size={14}/> Onaylı Uzman
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic mb-2">
                            {profile.ad} {profile.soyad}
                        </h1>
                        <p className="text-xl text-blue-600 font-bold mb-6 tracking-tight uppercase">{profile.unvan}</p>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-slate-500 font-bold text-sm mb-8">
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                <MapPin size={18} className="text-blue-500" />
                                <span>{profile.sehir}, {profile.ilce}</span>
                            </div>
                            {profile.mezuniyet_okul && (
                                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                    <GraduationCap size={18} className="text-blue-500" />
                                    <span>{profile.mezuniyet_okul}</span>
                                </div>
                            )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button onClick={() => setShowOnGorusmeModal(true)}
                                className="bg-slate-900 hover:bg-blue-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg">
                                <Calendar size={20} /> Ücretsiz Ön Görüşme
                            </Button>
                            <Button onClick={() => setShowRandevuModal(true)}>
                                <Calendar size={20} /> Randevu Oluştur
                            </Button>
                            <Button 
                                variant="outline"
                                className="bg-white border-2 border-slate-100 text-slate-600 hover:bg-slate-50 px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all"
                            >
                                <MessageCircle size={20} /> Mesaj Gönder
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Sol Taraf: İçerikler */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Biyografi */}
                    {profile.biyografi && (
                        <InfoSection title="Uzman Hakkında" icon={<Activity className="text-blue-600" />}>
                            <p className="text-slate-600 font-medium leading-relaxed italic text-lg">"{profile.biyografi}"</p>
                        </InfoSection>
                    )}

                    {/* Uzmanlık Alanları */}
                    {profile.uzmanlikAlanlari && (
                        <InfoSection title="Uzmanlık Alanları" icon={<Award className="text-blue-600" />}>
                             <div className="space-y-6">
                                {Object.entries(profile.uzmanlikAlanlari).map(([kategori, alanlar]) => (
                                    <div key={kategori}>
                                        <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3 px-1">
                                            {kategori.replace(/([A-Z])/g, ' $1').trim()}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {alanlar.map((alan, idx) => (
                                                <span key={idx} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl text-xs font-black border border-blue-100">
                                                    {alan}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </InfoSection>
                    )}
                </div>

                {/* Sağ Taraf: Değerlendirmeler */}
                <div className="lg:col-span-5 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                                <Star className="text-yellow-500" size={24} /> Değerlendirmeler
                            </h2>
                            <button 
                                onClick={() => setShowReviewModal(true)}
                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                            >
                                Yorum Yaz
                            </button>
                        </div>

                        <RatingSummary reviews={reviews} />

                        <div className="space-y-6 mt-10">
                            {reviews.reviews.length === 0 ? (
                                <p className="text-center text-slate-400 font-bold py-8 text-sm italic">Henüz bir değerlendirme yapılmamış.</p>
                            ) : (
                                reviews.reviews.map((review) => (
                                    <ReviewItem 
                                        key={review.id} 
                                        review={review} 
                                        onEdit={() => { setEditingReview(review); setShowReviewModal(true); }}
                                        onDelete={() => handleDeleteReview(review.id)}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Sertifikalar - Mini Bento */}
                    {profile.sertifikalar?.length > 0 && (
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                             <h2 className="text-xl font-black mb-6 uppercase tracking-tighter flex items-center gap-3">
                                <FileText className="text-blue-400" /> Sertifikalar
                            </h2>
                            <div className="space-y-3">
                                {profile.sertifikalar.map(cert => (
                                    <a key={cert.id} href={cert.dosya_url} target="_blank" className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700/50">
                                        <span className="font-bold text-xs">{cert.adi}</span>
                                        <ArrowRight size={16} className="text-blue-400" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ReviewModal 
                isOpen={showReviewModal} 
                onClose={() => { setShowReviewModal(false); setEditingReview(null); }}
                uzmanId={id} 
                existingReview={editingReview} 
                onSuccess={fetchProfile} 
            />
            <RandevuModal
                isOpen={showRandevuModal}
                onClose={() => setShowRandevuModal(false)}
                uzmanProfileId={profile.id}
                uzmanAd={`${profile.unvan} ${profile.ad} ${profile.soyad}`}
            />
            <OnGorusmeModal
                isOpen={showOnGorusmeModal}
                onClose={() => setShowOnGorusmeModal(false)}
                uzmanProfileId={profile.id}
                uzmanAd={`${profile.unvan} ${profile.ad} ${profile.soyad}`}
            />
        </div>
    );
}
