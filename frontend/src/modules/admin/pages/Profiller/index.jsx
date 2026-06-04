import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Stethoscope, Search, ChevronRight,
    Star, MapPin, FileText, Calendar, Activity, ArrowRight
} from 'lucide-react';

import {
    getHastalar, getHastaDetail,
    getAdminUzmanlar, getUzmanDetail
} from '../../services/adminService';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');

const TABS = [
    { key: 'hastalar', label: 'Hastalar', icon: Users },
    { key: 'uzmanlar', label: 'Uzmanlar', icon: Stethoscope },
];

// --- ALT BİLEŞENLER (ROW) ---

function HastaRow({ hasta, onSelect }) {
    return (
        <motion.div
            layout
            className="bg-white rounded-2xl border border-gray-100 shadow-sm
                p-4 flex items-center gap-4 cursor-pointer hover:border-blue-200
                transition-colors"
            onClick={() => onSelect(hasta.user_id)}
        >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center
                justify-center font-black text-blue-600 flex-shrink-0">
                {hasta.ad?.[0]}{hasta.soyad?.[0]}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">
                    {hasta.ad} {hasta.soyad}
                </p>
                <p className="text-xs text-gray-400 truncate">{hasta.email}</p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0 text-xs text-gray-400">
                {hasta.sehir && (
                    <span className="flex items-center gap-1">
                        <MapPin size={11} /> {hasta.sehir}
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <Activity size={11} /> {hasta.assessment_sayisi || 0} değ.
                </span>
                <span className="flex items-center gap-1">
                    <Calendar size={11} /> {hasta.randevu_sayisi || 0} ran.
                </span>
                <ChevronRight size={14} className="text-gray-300" />
            </div>
        </motion.div>
    );
}

function UzmanRow({ uzman, onSelect }) {
    const STATUS_COLOR = {
        active: 'bg-green-100 text-green-700',
        pending_approval: 'bg-amber-100 text-amber-700',
        rejected: 'bg-red-100 text-red-700',
    };

    return (
        <motion.div
            layout
            className="bg-white rounded-2xl border border-gray-100 shadow-sm
                p-4 flex items-center gap-4 cursor-pointer hover:border-blue-200
                transition-colors"
            onClick={() => onSelect(uzman.user_id)}
        >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center
                justify-center font-black text-indigo-600 flex-shrink-0">
                {uzman.ad?.[0]}{uzman.soyad?.[0]}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">
                    {uzman.unvan} {uzman.ad} {uzman.soyad}
                </p>
                <p className="text-xs text-gray-400 truncate">
                    {uzman.uzmanlik_alani} · {uzman.email}
                </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                {uzman.ortalama_rating > 0 && (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                        <Star size={11} className="fill-amber-400" />
                        {Number(uzman.ortalama_rating).toFixed(1)}
                    </span>
                )}
                <span className={`text-[10px] font-black px-2 py-1 rounded-full
                    ${STATUS_COLOR[uzman.status] || 'bg-gray-100 text-gray-500'}`}>
                    {uzman.status === 'active' ? 'Aktif'
                        : uzman.status === 'pending_approval' ? 'Bekliyor'
                        : 'Reddedildi'}
                </span>
                <ChevronRight size={14} className="text-gray-300" />
            </div>
        </motion.div>
    );
}

// --- DETAY PANELİ ---

function DetailPanel({ type, id, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('genel');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = type === 'hasta'
                    ? await getHastaDetail(id)
                    : await getUzmanDetail(id);
                setData(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id, type]);

    if (loading) return (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white
            shadow-2xl z-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600
                border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!data) return null;

    const HASTA_TABS = [
        { key: 'genel', label: 'Genel' },
        { key: 'tibbi', label: 'Tıbbi' },
        { key: 'assessments', label: `Değerlendirmeler (${data.assessments?.length || 0})` },
        { key: 'randevular', label: `Randevular (${data.randevular?.length || 0})` },
        { key: 'raporlar', label: `Raporlar (${data.raporlar?.length || 0})` },
    ];

    const UZMAN_TABS = [
        { key: 'genel', label: 'Genel' },
        { key: 'uzmanlik', label: 'Uzmanlık' },
        { key: 'yorumlar', label: `Yorumlar (${data.yorumlar?.length || 0})` },
        { key: 'randevular', label: `Randevular (${data.randevular?.length || 0})` },
        { key: 'belgeler', label: 'Belgeler' },
    ];

    const tabs = type === 'hasta' ? HASTA_TABS : UZMAN_TABS;

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white
                shadow-2xl z-50 flex flex-col"
        >
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="font-black text-gray-900 text-lg">
                        {type === 'hasta'
                            ? `${data.ad} ${data.soyad}`
                            : `${data.unvan} ${data.ad} ${data.soyad}`}
                    </h2>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center
                            rounded-xl bg-gray-100 hover:bg-gray-200
                            transition-colors text-gray-500 text-sm font-bold">
                        ✕
                    </button>
                </div>
                <p className="text-xs text-gray-400">{data.email}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 pt-3 pb-0 flex-shrink-0
                overflow-x-auto border-b border-gray-100">
                {tabs.map(t => (
                    <button key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`flex-shrink-0 px-3 py-2 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {/* ── GENEL ── */}
                {activeTab === 'genel' && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                            {[
                                { label: 'Email', val: data.email },
                                { label: 'Telefon', val: data.telefon },
                                { label: 'Şehir', val: data.sehir
                                    ? `${data.sehir}${data.ilce ? ', '+data.ilce : ''}`
                                    : null },
                                { label: 'Cinsiyet', val: data.cinsiyet },
                                { label: 'Doğum Tarihi', val: data.dogum_tarihi
                                    ? new Date(data.dogum_tarihi)
                                        .toLocaleDateString('tr-TR')
                                    : null },
                                { label: 'Kayıt Tarihi', val: new Date(data.created_at)
                                    .toLocaleDateString('tr-TR') },
                                { label: 'Profil Tamamlandı', val: data.profile_completed_at
                                    ? new Date(data.profile_completed_at)
                                        .toLocaleDateString('tr-TR')
                                    : 'Tamamlanmamış' },
                            ].filter(r => r.val).map(({ label, val }) => (
                                <div key={label} className="flex justify-between
                                    items-center text-sm">
                                    <span className="text-gray-400 text-xs
                                        font-semibold">{label}</span>
                                    <span className="font-bold text-gray-900
                                        text-right max-w-[280px] truncate">{val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Uzman — biyografi */}
                        {type === 'uzman' && data.biyografi && (
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-[10px] font-black text-gray-400
                                    uppercase tracking-widest mb-2">Biyografi</p>
                                <p className="text-sm text-gray-700 leading-relaxed
                                    italic">"{data.biyografi}"</p>
                            </div>
                        )}

                        {/* Uzman — istatistikler */}
                        {type === 'uzman' && (
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: 'Rating', val: Number(data.ortalama_rating).toFixed(1) },
                                    { label: 'Yorum', val: data.toplam_yorum_sayisi },
                                    { label: 'Randevu', val: data.toplam_randevu_sayisi },
                                    { label: 'Makale', val: data.makale_sayisi },
                                    { label: 'Online', val: data.online_hizmet ? '✓' : '✗' },
                                    { label: 'Evde', val: data.evde_hizmet ? '✓' : '✗' },
                                ].map(({ label, val }) => (
                                    <div key={label}
                                        className="bg-gray-50 rounded-xl p-3 text-center">
                                        <div className="text-[10px] text-gray-400 mb-1">
                                            {label}
                                        </div>
                                        <div className="text-lg font-black text-gray-900">
                                            {val}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Uzman — IBAN */}
                        {type === 'uzman' && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                                    Uzman IBAN (Gizli — Sadece Admin Görebilir)
                                </p>
                                {data.iban_no ? (
                                    <>
                                        <p className="text-sm font-black text-gray-900 tracking-widest">
                                            {data.iban_no}
                                        </p>
                                        {data.iban_ad_soyad && (
                                            <p className="text-xs font-bold text-gray-600">
                                                Hesap Adı: {data.iban_ad_soyad}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">IBAN henüz girilmemiş</p>
                                )}
                            </div>
                        )}

                        {/* Uzman — ücretler */}
                        {type === 'uzman' && (data.seans_ucreti_min || data.online_seans_ucreti) && (
                            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                                <p className="text-[10px] font-black text-gray-400
                                    uppercase tracking-widest mb-2">Ücretler</p>
                                {data.seans_ucreti_min && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Klinikte</span>
                                        <span className="font-bold">
                                            {data.seans_ucreti_min}₺
                                            {data.seans_ucreti_max !== data.seans_ucreti_min
                                                ? ` – ${data.seans_ucreti_max}₺` : ''}
                                        </span>
                                    </div>
                                )}
                                {data.online_seans_ucreti && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Online</span>
                                        <span className="font-bold">
                                            {data.online_seans_ucreti}₺
                                        </span>
                                    </div>
                                )}
                                {data.evde_seans_ucreti && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Evde</span>
                                        <span className="font-bold">
                                            {data.evde_seans_ucreti}₺
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── HASTA — TIBBİ ── */}
                {activeTab === 'tibbi' && type === 'hasta' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: 'Ameliyat', val: data.ameliyat_gecmisi ? 'Var' : 'Yok', warn: data.ameliyat_gecmisi },
                                { label: 'Kronik', val: data.kronik_hastalik ? 'Var' : 'Yok', warn: data.kronik_hastalik },
                                { label: 'İlaç', val: data.surekli_ilac ? 'Var' : 'Yok', warn: data.surekli_ilac },
                            ].map(({ label, val, warn }) => (
                                <div key={label}
                                    className={`rounded-xl p-3 text-center
                                        ${warn ? 'bg-amber-50' : 'bg-gray-50'}`}>
                                    <div className="text-[10px] text-gray-400 mb-1">{label}</div>
                                    <div className={`font-black text-sm
                                        ${warn ? 'text-amber-600' : 'text-green-600'}`}>
                                        {val}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {[
                            { label: 'Ameliyat Detayı', val: data.ameliyat_detay },
                            { label: 'Kronik Hastalık', val: data.kronik_hastalik_detay },
                            { label: 'İlaç Listesi', val: data.ilac_listesi },
                            { label: 'Alerjiler', val: data.alerjiler },
                            { label: 'Ağrı Bölgesi', val: data.agri_bolgesi },
                            { label: 'Tedavi Tercihi', val: data.tedavi_tercihi },
                            { label: 'Ağrı Seviyesi', val: data.agri_seviyesi
                                ? `${data.agri_seviyesi}/10` : null },
                        ].filter(r => r.val).map(({ label, val }) => (
                            <div key={label}
                                className="bg-gray-50 rounded-xl p-4">
                                <p className="text-[10px] font-black text-gray-400
                                    uppercase tracking-widest mb-1">{label}</p>
                                <p className="text-sm text-gray-900 font-semibold">
                                    {val}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── HASTA — ASSESSMENTs ── */}
                {activeTab === 'assessments' && type === 'hasta' && (
                    <div className="space-y-3">
                        {data.assessments?.length === 0 ? (
                            <p className="text-center text-gray-400 py-8 text-sm">
                                Değerlendirme yok
                            </p>
                        ) : data.assessments?.map(a => (
                            <div key={a.id}
                                className="bg-gray-50 rounded-2xl p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-black text-gray-900">
                                            {a.pain_region}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(a.created_at)
                                                .toLocaleDateString('tr-TR')}
                                        </p>
                                    </div>
                                    <span className="bg-red-100 text-red-700
                                        text-xs font-black px-2 py-1 rounded-full">
                                        Şiddet: {a.pain_severity}/5
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-white rounded-lg p-2">
                                        <span className="text-gray-400">Süre: </span>
                                        <span className="font-bold">{a.pain_duration}</span>
                                    </div>
                                    <div className="bg-white rounded-lg p-2">
                                        <span className="text-gray-400">Günlük etki: </span>
                                        <span className="font-bold">
                                            {a.daily_activities_impact}/5
                                        </span>
                                    </div>
                                </div>
                                {a.pain_types?.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {a.pain_types.map((t, i) => (
                                            <span key={i}
                                                className="text-[10px] bg-blue-50
                                                    text-blue-600 px-2 py-0.5
                                                    rounded-full font-bold">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {a.additional_notes && (
                                    <p className="text-xs text-gray-500 italic">
                                        "{a.additional_notes}"
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ── RANDEVULAR (her ikisi için) ── */}
                {activeTab === 'randevular' && (
                    <div className="space-y-3">
                        {data.randevular?.length === 0 ? (
                            <p className="text-center text-gray-400 py-8 text-sm">
                                Randevu yok
                            </p>
                        ) : data.randevular?.map(r => (
                            <div key={r.id}
                                className="bg-gray-50 rounded-2xl p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-black text-gray-900 text-sm">
                                            {type === 'hasta'
                                                ? `${r.unvan} ${r.uzman_ad} ${r.uzman_soyad}`
                                                : `${r.hasta_ad} ${r.hasta_soyad}`}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(r.talep_tarihi)
                                                .toLocaleDateString('tr-TR', {
                                                    day: 'numeric', month: 'long',
                                                    year: 'numeric'
                                                })}
                                            {' · '}{r.talep_turu}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-black px-2
                                        py-1 rounded-full flex-shrink-0
                                        ${r.durum === 'onaylandi'
                                            ? 'bg-green-100 text-green-700'
                                            : r.durum === 'beklemede'
                                            ? 'bg-amber-100 text-amber-700'
                                            : r.durum === 'tamamlandi'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-500'}`}>
                                        {r.durum}
                                    </span>
                                </div>
                                {r.hasta_notu && (
                                    <p className="text-xs text-gray-500 italic
                                        bg-white rounded-lg p-2">
                                        "{r.hasta_notu}"
                                    </p>
                                )}
                                {type === 'uzman' && r.hasta_telefon && (
                                    <p className="text-xs text-blue-500 mt-1">
                                        📞 {r.hasta_telefon}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ── HASTA — RAPORLAR ── */}
                {activeTab === 'raporlar' && type === 'hasta' && (
                    <div className="space-y-3">
                        {data.raporlar?.length === 0 ? (
                            <p className="text-center text-gray-400 py-8 text-sm">
                                Rapor yok
                            </p>
                        ) : data.raporlar?.map(r => (
                            <a key={r.id}
                                href={`${API_BASE}${r.dosya_url}`}
                                target="_blank"
                                className="flex items-center gap-3 bg-gray-50
                                    rounded-2xl p-4 hover:bg-blue-50
                                    transition-colors border border-gray-100
                                    hover:border-blue-200"
                            >
                                <div className="w-10 h-10 bg-blue-100 rounded-xl
                                    flex items-center justify-center flex-shrink-0">
                                    <FileText size={18} className="text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm">
                                        {r.tip.toUpperCase()}
                                    </p>
                                    {r.aciklama && (
                                        <p className="text-xs text-gray-400 truncate">
                                            {r.aciklama}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-300">
                                        {new Date(r.created_at)
                                            .toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                                <ArrowRight size={14} className="text-gray-300
                                    flex-shrink-0" />
                            </a>
                        ))}
                    </div>
                )}

                {/* ── UZMAN — UZMANLIK ── */}
                {activeTab === 'uzmanlik' && type === 'uzman' && (
                    <div className="space-y-4">
                        {Object.entries(data.uzmanlikAlanlari || {}).map(
                            ([kategori, alanlar]) => (
                                <div key={kategori}>
                                    <p className="text-[10px] font-black text-gray-400
                                        uppercase tracking-widest mb-2">
                                        {kategori}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {alanlar.map((alan, i) => (
                                            <span key={i}
                                                className="bg-blue-50 text-blue-700
                                                    text-xs font-bold px-3 py-1.5
                                                    rounded-xl border border-blue-100">
                                                {alan}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}
                        {Object.keys(data.uzmanlikAlanlari || {}).length === 0 && (
                            <p className="text-center text-gray-400 py-8 text-sm">
                                Uzmanlık alanı girilmemiş
                            </p>
                        )}
                    </div>
                )}

                {/* ── UZMAN — YORUMLAR ── */}
                {activeTab === 'yorumlar' && type === 'uzman' && (
                    <div className="space-y-3">
                        {data.yorumlar?.length === 0 ? (
                            <p className="text-center text-gray-400 py-8 text-sm">
                                Yorum yok
                            </p>
                        ) : data.yorumlar?.map(y => (
                            <div key={y.id}
                                className="bg-gray-50 rounded-2xl p-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-gray-900 text-sm">
                                        {y.anonim ? 'Anonim'
                                            : `${y.hasta_ad} ${y.hasta_soyad}`}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        {[1,2,3,4,5].map(s => (
                                            <Star key={s} size={12}
                                                className={s <= y.rating
                                                    ? 'text-amber-400 fill-amber-400'
                                                    : 'text-gray-200 fill-gray-200'}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {y.yorum && (
                                    <p className="text-xs text-gray-600 italic">
                                        "{y.yorum}"
                                    </p>
                                )}
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                    {[
                                        { l: 'Profesyonellik', v: y.profesyonellik_puan },
                                        { l: 'İletişim', v: y.iletisim_puan },
                                        { l: 'Tedavi', v: y.tedavi_etkinligi_puan },
                                        { l: 'Zamanında', v: y.zamaninda_gelme_puan },
                                    ].filter(r => r.v).map(({ l, v }) => (
                                        <div key={l}
                                            className="bg-white rounded-lg p-1.5
                                                flex justify-between">
                                            <span className="text-gray-400">{l}</span>
                                            <span className="font-bold">{v}/5</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-300 text-right">
                                    {new Date(y.created_at).toLocaleDateString('tr-TR')}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── UZMAN — BELGELER ── */}
                {activeTab === 'belgeler' && type === 'uzman' && (
                    <div className="space-y-3">
                        {/* Diploma */}
                        {data.diploma_url && (
                            <div>
                                <p className="text-[10px] font-black text-gray-400
                                    uppercase tracking-widest mb-2">Diploma</p>
                                <a href={`${API_BASE}${data.diploma_url}`}
                                    target="_blank"
                                    className="flex items-center gap-3 bg-gray-50
                                        rounded-2xl p-4 hover:bg-blue-50
                                        transition-colors border border-gray-100">
                                    <FileText size={18} className="text-blue-600" />
                                    <span className="text-sm font-bold text-gray-700">
                                        Diploma Görüntüle
                                    </span>
                                    <ArrowRight size={14}
                                        className="text-gray-300 ml-auto" />
                                </a>
                            </div>
                        )}

                        {/* Sertifikalar */}
                        {data.sertifikalar?.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black text-gray-400
                                    uppercase tracking-widest mb-2">
                                    Sertifikalar ({data.sertifikalar.length})
                                </p>
                                <div className="space-y-2">
                                    {data.sertifikalar.map(s => (
                                        <a key={s.id}
                                            href={`${API_BASE}${s.dosya_url}`}
                                            target="_blank"
                                            className="flex items-center gap-3
                                                bg-gray-50 rounded-2xl p-4
                                                hover:bg-blue-50 transition-colors
                                                border border-gray-100">
                                            <FileText size={16}
                                                className="text-blue-400 flex-shrink-0" />
                                            <span className="text-sm font-semibold
                                                text-gray-700 flex-1">{s.adi}</span>
                                            <span className="text-xs text-gray-300">
                                                {new Date(s.created_at)
                                                    .toLocaleDateString('tr-TR')}
                                            </span>
                                            <ArrowRight size={14}
                                                className="text-gray-300 flex-shrink-0" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!data.diploma_url && data.sertifikalar?.length === 0 && (
                            <p className="text-center text-gray-400 py-8 text-sm">
                                Belge yok
                            </p>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// --- ANA SAYFA BİLEŞENİ ---

export default function Profiller() {
    const [tab, setTab] = useState('hastalar');
    const [search, setSearch] = useState('');
    const [hastalar, setHastalar] = useState([]);
    const [uzmanlar, setUzmanlar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    // fetchData'yı useCallback ile sarmalıyoruz ki useEffect içinde güvenle kullanabilelim
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (tab === 'hastalar') {
                const res = await getHastalar({ page, limit: 20, search });
                setHastalar(res.data.hastalar || []);
                setTotal(res.data.total || 0);
            } else {
                const res = await getAdminUzmanlar({ page, limit: 20, search });
                setUzmanlar(res.data.uzmanlar || []);
                setTotal(res.data.total || 0);
            }
        } catch (e) {
            console.error("Liste getirme hatası:", e);
            setHastalar([]);
            setUzmanlar([]);
        } finally {
            setLoading(false);
        }
    }, [tab, page, search]);

    // Tab değişince her şeyi sıfırla
    useEffect(() => {
        setPage(1);
        setSelectedId(null);
    }, [tab]);

    // Veri çekme ve Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchData]);

    const list = tab === 'hastalar' ? hastalar : uzmanlar;

    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6 pb-24 lg:pb-6">
            <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Profiller</h1>
                <p className="text-gray-500 mt-1 text-sm">Tüm kullanıcı profillerini görüntüleyin</p>
            </div>

            <div className="flex gap-2">
                {TABS.map(t => (
                    <button key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl
                            text-xs font-black uppercase tracking-widest border-2
                            transition-all ${tab === t.key
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                    >
                        <t.icon size={14} />
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Ad, soyad veya email ara..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-100
                        rounded-2xl text-sm focus:outline-none focus:border-blue-300"
                />
            </div>

            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : list.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 md:p-16 text-center">
                    <p className="font-bold text-gray-400">Kayıt bulunamadı</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {tab === 'hastalar'
                        ? hastalar.map(h => <HastaRow key={h.user_id} hasta={h} onSelect={setSelectedId} />)
                        : uzmanlar.map(u => <UzmanRow key={u.user_id} uzman={u} onSelect={setSelectedId} />)
                    }
                </div>
            )}

            {total > 20 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                    <button disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold disabled:opacity-40">
                        Önceki
                    </button>
                    <span className="text-sm text-gray-500 font-bold">{page} / {Math.ceil(total / 20)}</span>
                    <button disabled={page >= Math.ceil(total / 20)}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold disabled:opacity-40">
                        Sonraki
                    </button>
                </div>
            )}

            <AnimatePresence>
                {selectedId && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className="fixed inset-0 bg-black/30 z-40"
                        />
                        <DetailPanel
                            type={tab === 'hastalar' ? 'hasta' : 'uzman'}
                            id={selectedId}
                            onClose={() => setSelectedId(null)}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}