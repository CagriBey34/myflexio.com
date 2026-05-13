import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, Star, MapPin, ArrowRight,
    ChevronLeft, Stethoscope, Zap, Award, AlertCircle
} from 'lucide-react';
import api from '../../../../shared/services/api';

// ─── Küçük yardımcılar ───────────────────────────────────────────────
const ScoreRing = ({ score, size = 64 }) => {
    const r = (size / 2) - 6;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke="#e5e7eb" strokeWidth="5" />
            <motion.circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke="#2563eb" strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ - dash }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
            />
        </svg>
    );
};

const UzmanCard = ({ uzman, index, onViewProfile }) => {
    const isTop = index === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * index, duration: 0.4 }}
            className={`relative bg-white rounded-2xl border overflow-hidden
                ${isTop
                    ? 'border-blue-300 shadow-lg shadow-blue-100'
                    : 'border-gray-200 shadow-sm'}`}
        >
            {/* En uygun rozeti */}
            {isTop && (
                <div className="absolute top-3 right-3 flex items-center gap-1
                    bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    <Award size={11} />
                    En Uygun
                </div>
            )}

            <div className="p-5 flex gap-4">
                {/* Fotoğraf */}
                <div className="relative flex-shrink-0">
                    {uzman.profil_fotograf_url ? (
                        <img
                            src={uzman.profil_fotograf_url}
                            alt={`${uzman.ad} ${uzman.soyad}`}
                            className="w-16 h-16 rounded-xl object-cover"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-xl bg-blue-50
                            flex items-center justify-center text-blue-600 font-bold text-xl">
                            {uzman.ad?.[0]}{uzman.soyad?.[0]}
                        </div>
                    )}
                    {/* Match score ring */}
                    <div className="absolute -bottom-3 -right-3">
                        <div className="relative w-10 h-10">
                            <ScoreRing score={uzman.match_score} size={40} />
                            <span className="absolute inset-0 flex items-center justify-center
                                text-[9px] font-bold text-blue-700 rotate-90">
                                %{uzman.match_score}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bilgiler */}
                <div className="flex-1 min-w-0 ml-2">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">
                                {uzman.uzmanlik_alani}
                            </p>
                            <h3 className="font-bold text-gray-900 text-base leading-tight">
                                {uzman.unvan} {uzman.ad} {uzman.soyad}
                            </h3>
                        </div>
                    </div>

                    {/* Rating & Lokasyon */}
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        {uzman.ortalama_rating > 0 && (
                            <div className="flex items-center gap-1">
                                <Star size={13} className="text-amber-400 fill-amber-400" />
                                <span className="text-sm font-semibold text-gray-700">
                                    {Number(uzman.ortalama_rating).toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-400">
                                    ({uzman.toplam_yorum_sayisi})
                                </span>
                            </div>
                        )}
                        {uzman.sehir && (
                            <div className="flex items-center gap-1 text-gray-500">
                                <MapPin size={12} />
                                <span className="text-xs">
                                    {uzman.ilce ? `${uzman.ilce}, ` : ''}{uzman.sehir}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Hizmet tipleri */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {uzman.online_hizmet === 1 && (
                            <span className="text-xs bg-green-50 text-green-700
                                border border-green-200 px-2 py-0.5 rounded-full">
                                Online
                            </span>
                        )}
                        {uzman.evde_hizmet === 1 && (
                            <span className="text-xs bg-purple-50 text-purple-700
                                border border-purple-200 px-2 py-0.5 rounded-full">
                                Evde
                            </span>
                        )}
                        {uzman.klinik_hizmet === 1 && (
                            <span className="text-xs bg-blue-50 text-blue-700
                                border border-blue-200 px-2 py-0.5 rounded-full">
                                Klinikte
                            </span>
                        )}
                    </div>

                    {/* Match reasons */}
                    {uzman.match_reasons?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {uzman.match_reasons.map((reason, i) => (
                                <span key={i} className="flex items-center gap-1
                                    text-[11px] text-gray-500">
                                    <Zap size={9} className="text-blue-400" />
                                    {reason}
                                    {i < uzman.match_reasons.length - 1 && (
                                        <span className="text-gray-300 ml-0.5">·</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Ücret & Profil butonu */}
                    <div className="flex items-center justify-between mt-3">
                        {uzman.seans_ucreti_min ? (
                            <span className="text-sm font-semibold text-gray-700">
                                {uzman.seans_ucreti_min}₺
                                {uzman.seans_ucreti_max && uzman.seans_ucreti_max !== uzman.seans_ucreti_min
                                    ? ` – ${uzman.seans_ucreti_max}₺`
                                    : ''
                                }
                                <span className="text-xs font-normal text-gray-400"> /seans</span>
                            </span>
                        ) : (
                            <span />
                        )}

                        <button
                            onClick={() => onViewProfile(uzman.user_id)}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700
                                text-white text-sm font-semibold px-4 py-1.5 rounded-lg
                                transition-colors"
                        >
                            Profili Gör
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ─── Ana Sayfa ────────────────────────────────────────────────────────
export default function AssessmentResult() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null); // { recommended_types, uzmanlar }

    useEffect(() => {
        if (!id) {
            setError('Geçersiz değerlendirme.');
            setLoading(false);
            return;
        }

        const fetchRecommendations = async () => {
            try {
                const res = await api.get(`/hasta/assessment/${id}/recommendations`);
                if (res.data.success) {
                    setData(res.data.data);
                } else {
                    setError('Öneriler alınamadı.');
                }
            } catch (err) {
                console.error(err);
                setError('Sunucu hatası. Lütfen tekrar deneyin.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [id]);

    const handleViewProfile = (userId) => {
        navigate(`/hasta/uzman/${userId}`);
    };

    // ── Loading ──
    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    className="w-10 h-10 border-4 border-blue-600 border-t-transparent
                        rounded-full mx-auto mb-4"
                />
                <p className="text-gray-500 text-sm">Uzmanlar belirleniyor…</p>
            </div>
        </div>
    );

    // ── Hata ──
    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
                <AlertCircle className="mx-auto mb-3 text-red-400" size={40} />
                <p className="text-gray-700 mb-4">{error}</p>
                <button
                    onClick={() => navigate('/hasta/dashboard')}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold"
                >
                    Dashboard'a Dön
                </button>
            </div>
        </div>
    );

    const { recommended_types = [], uzmanlar = [] } = data || {};

    // ── Boş sonuç ──
    if (uzmanlar.length === 0) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
                <Stethoscope className="mx-auto mb-3 text-blue-300" size={40} />
                <h2 className="font-bold text-gray-900 mb-2">
                    Şu an uygun uzman bulunamadı
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                    Kriterlerinize uyan aktif uzman henüz sistemde kayıtlı değil.
                    Tüm uzmanlarımıza göz atabilirsiniz.
                </p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => navigate('/hasta/uzmanlar')}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg
                            text-sm font-semibold"
                    >
                        Tüm Uzmanları Gör
                    </button>
                    <button
                        onClick={() => navigate('/hasta/dashboard')}
                        className="text-gray-500 text-sm py-2"
                    >
                        Dashboard'a Dön
                    </button>
                </div>
            </div>
        </div>
    );

    // ── Ana render ──
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Geri butonu */}
                <button
                    onClick={() => navigate('/hasta/assessment')}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700
                        text-sm mb-6 transition-colors"
                >
                    <ChevronLeft size={16} />
                    Değerlendirmelerim
                </button>

                {/* Başarı başlığı */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-green-200
                        shadow-sm p-6 mb-6 flex items-center gap-4"
                >
                    <div className="w-12 h-12 bg-green-100 rounded-xl
                        flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="text-green-600" size={26} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">
                            Değerlendirmeniz Tamamlandı
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Profilinize göre{' '}
                            <span className="font-semibold text-blue-600">
                                {uzmanlar.length} uzman
                            </span>{' '}
                            önerildi.
                        </p>
                    </div>
                </motion.div>

                {/* Önerilen uzman tipleri */}
                {recommended_types.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-5"
                    >
                        <p className="text-xs font-semibold text-gray-400 uppercase
                            tracking-widest mb-2">
                            Uygun Uzman Türleri
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {recommended_types.map((t, i) => (
                                <span key={i}
                                    className="flex items-center gap-1.5 bg-white border
                                        border-blue-200 text-blue-700 text-xs font-semibold
                                        px-3 py-1.5 rounded-full shadow-sm">
                                    <Stethoscope size={11} />
                                    {t.type}
                                    <span className="text-blue-400 font-normal">
                                        %{t.score}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Uzman kartları */}
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase
                        tracking-widest mb-1">
                        Size Önerilen Uzmanlar
                    </p>
                    <AnimatePresence>
                        {uzmanlar.map((uzman, index) => (
                            <UzmanCard
                                key={uzman.user_id}
                                uzman={uzman}
                                index={index}
                                onViewProfile={handleViewProfile}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Alt butonlar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 flex flex-col sm:flex-row gap-2"
                >
                    <button
                        onClick={() => navigate('/hasta/uzmanlar')}
                        className="flex-1 flex items-center justify-center gap-2
                            border border-blue-200 text-blue-600 hover:bg-blue-50
                            text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                    >
                        Tüm Uzmanları Ara
                        <ArrowRight size={15} />
                    </button>
                    <button
                        onClick={() => navigate('/hasta/dashboard')}
                        className="flex-1 flex items-center justify-center
                            bg-gray-100 hover:bg-gray-200 text-gray-600
                            text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                    >
                        Dashboard'a Dön
                    </button>
                </motion.div>

                {/* Uyarı notu */}
                <p className="text-center text-xs text-gray-400 mt-5 px-4">
                    Bu öneriler değerlendirme verilerinize göre oluşturulmuştur.
                    Kesin tanı için mutlaka bir sağlık uzmanına başvurun.
                </p>
            </div>
        </div>
    );
}