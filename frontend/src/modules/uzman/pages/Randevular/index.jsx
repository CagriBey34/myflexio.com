import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, CheckCircle, XCircle,
    ChevronDown, User, Phone, Mail, AlertCircle,
    Video, Edit3, Loader2
} from 'lucide-react';
import { getUzmanRandevular } from '../../services/uzmanService';
import api from '../../../../shared/services/api';

const DURUM_CONFIG = {
    beklemede:  { label: 'Beklemede',  color: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400' },
    onaylandi:  { label: 'Onaylandı',  color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
    reddedildi: { label: 'Reddedildi', color: 'bg-red-100 text-red-700',      dot: 'bg-red-400' },
    tamamlandi: { label: 'Tamamlandı', color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
    iptal:      { label: 'İptal',      color: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400' },
};

const TUR_CONFIG = {
    online: { label: 'Online',   emoji: '💻' },
    evde:   { label: 'Evde',     emoji: '🏠' },
    klinik: { label: 'Klinikte', emoji: '🏥' },
};

const FILTRELER = [
    { key: 'hepsi',      label: 'Tümü' },
    { key: 'beklemede',  label: 'Bekleyenler' },
    { key: 'onaylandi',  label: 'Onaylananlar' },
    { key: 'reddedildi', label: 'Reddedilenler' },
    { key: 'tamamlandi', label: 'Tamamlananlar' },
];

function KesinTarihForm({ randevuId, mevcutTarih, onSaved }) {
    const [tarih, setTarih] = useState('');
    const [saat, setSaat] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    // Mevcut kesin tarih varsa doldur
    useEffect(() => {
        if (mevcutTarih) {
            const d = new Date(mevcutTarih);
            setTarih(d.toISOString().split('T')[0]);
            setSaat(d.toTimeString().slice(0, 5));
        }
    }, [mevcutTarih]);

    const handleSave = async () => {
        if (!tarih || !saat) {
            setError('Lütfen tarih ve saat girin.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.patch(`/uzman/randevular/${randevuId}/kesin-tarih`, {
                kesin_tarih: `${tarih} ${saat}:00`,
            });
            setSaved(true);
            onSaved?.();
        } catch (e) {
            setError(e.response?.data?.message || 'Kaydedilemedi, tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    if (saved) {
        return (
            <div className="flex items-center gap-2 text-green-600 text-xs font-black">
                <CheckCircle size={14} /> Tarih kaydedildi!
            </div>
        );
    }

    return (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                <Edit3 size={10} /> Kesin Tarih & Saat Belirle
            </p>
            <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Tarih</label>
                    <input
                        type="date"
                        value={tarih}
                        onChange={e => setTarih(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="text-sm font-bold text-slate-800 border-2 border-blue-100 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 transition-colors bg-white"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Saat</label>
                    <input
                        type="time"
                        value={saat}
                        onChange={e => setSaat(e.target.value)}
                        className="text-sm font-bold text-slate-800 border-2 border-blue-100 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 transition-colors bg-white"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-widest transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                        Kaydet
                    </button>
                </div>
            </div>
            {error && (
                <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                    <XCircle size={12} /> {error}
                </p>
            )}
        </div>
    );
}

function RandevuCard({ randevu, onRefresh }) {
    const [expanded, setExpanded] = useState(false);

    const isOnGorusme = randevu.randevu_tipi === 'on_gorusme';
    const durum = DURUM_CONFIG[randevu.durum] || DURUM_CONFIG.beklemede;
    const tur = TUR_CONFIG[randevu.talep_turu] || {};
    const tarih = randevu.talep_tarihi ? new Date(randevu.talep_tarihi) : null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[1.75rem] border-2 border-slate-100 overflow-hidden shadow-sm"
        >
            <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Tarih / Ön Görüşme kutusu */}
                {isOnGorusme ? (
                    <div className="flex-shrink-0 bg-blue-600 text-white rounded-2xl px-3 py-3 text-center min-w-[60px] flex flex-col items-center gap-1">
                        <Video size={16} className="opacity-80" />
                        <div className="text-[8px] font-black uppercase tracking-wide opacity-80 leading-tight">Ön Görüşme</div>
                    </div>
                ) : (
                    <div className="flex-shrink-0 bg-slate-900 text-white rounded-2xl px-3 py-3 text-center min-w-[60px]">
                        <div className="text-xl font-black leading-none">{tarih?.getDate()}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mt-1">
                            {tarih?.toLocaleDateString('tr-TR', { month: 'short' })}
                        </div>
                        <div className="text-[9px] opacity-50 mt-0.5">
                            {tarih?.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                )}

                {/* Hasta bilgisi */}
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                        <User size={9} /> Hasta
                    </div>
                    <div className="font-black text-slate-900 truncate">
                        {randevu.hasta_ad} {randevu.hasta_soyad}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                        {isOnGorusme
                            ? <span className="text-xs text-blue-600 font-black">Ücretsiz Ön Görüşme · 15 dk</span>
                            : <><span className="text-xs">{tur.emoji}</span><span className="text-xs text-gray-500 font-semibold">{tur.label}</span></>
                        }
                    </div>
                </div>

                {/* Durum + chevron */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${durum.color}`}>
                        {durum.label}
                    </span>
                    <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {/* Detay */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-gray-100"
                    >
                        <div className="p-5 space-y-4 bg-gray-50">

                            {/* Talep tarihi (sadece normal randevularda) */}
                            {!isOnGorusme && tarih && (
                                <div className="bg-white rounded-2xl p-4 border border-gray-100">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <Calendar size={9} /> Talep Edilen Tarih
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {tarih.toLocaleDateString('tr-TR', {
                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                        {' · '}
                                        {tarih.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            )}

                            {/* Kesin tarih göster (herhangi bir durumda) */}
                            {randevu.kesin_tarih && (
                                <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                                    <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <CheckCircle size={9} /> Belirlenen Tarih & Saat
                                    </div>
                                    <p className="text-sm font-bold text-green-800">
                                        {new Date(randevu.kesin_tarih).toLocaleDateString('tr-TR', {
                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                        {' · '}
                                        {new Date(randevu.kesin_tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {randevu.durum === 'beklemede' && (
                                        <p className="text-[10px] text-amber-600 font-bold mt-1.5">
                                            ⏳ Admin onayı bekleniyor — Hasta bildirim almadı
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Tarih belirleme formu: beklemede veya onaylandi durumunda */}
                            {(randevu.durum === 'beklemede' || randevu.durum === 'onaylandi') && (
                                <KesinTarihForm
                                    randevuId={randevu.id}
                                    mevcutTarih={randevu.kesin_tarih}
                                    onSaved={onRefresh}
                                />
                            )}

                            {/* İletişim bilgileri */}
                            <div className="bg-white rounded-2xl p-4 border border-gray-100">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                                    <User size={9} /> Hasta İletişim
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {randevu.hasta_telefon && (
                                        <a href={`tel:${randevu.hasta_telefon}`}
                                            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
                                            <Phone size={14} /> {randevu.hasta_telefon}
                                        </a>
                                    )}
                                    {randevu.hasta_email && (
                                        <a href={`mailto:${randevu.hasta_email}`}
                                            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
                                            <Mail size={14} /> {randevu.hasta_email}
                                        </a>
                                    )}
                                    {(randevu.hasta_sehir || randevu.hasta_ilce) && (
                                        <span className="flex items-center gap-1 text-sm text-gray-500">
                                            📍 {[randevu.hasta_ilce, randevu.hasta_sehir].filter(Boolean).join(', ')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Hasta tıbbi profili */}
                            {(randevu.hasta_dogum_tarihi || randevu.hasta_cinsiyet || randevu.hasta_agri_bolgesi ||
                              randevu.hasta_agri_seviyesi || randevu.hasta_kronik_hastalik || randevu.hasta_ameliyat_gecmisi ||
                              randevu.hasta_surekli_ilac || randevu.hasta_alerjiler) && (
                                <div className="bg-white rounded-2xl p-4 border border-gray-100">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                        Tıbbi Profil
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                        {randevu.hasta_dogum_tarihi && (
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold block">Doğum Tarihi</span>
                                                <span className="font-semibold">{new Date(randevu.hasta_dogum_tarihi).toLocaleDateString('tr-TR')}</span>
                                            </div>
                                        )}
                                        {randevu.hasta_cinsiyet && (
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold block">Cinsiyet</span>
                                                <span className="font-semibold capitalize">{randevu.hasta_cinsiyet}</span>
                                            </div>
                                        )}
                                        {randevu.hasta_agri_bolgesi && (
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold block">Ağrı Bölgesi</span>
                                                <span className="font-semibold">{randevu.hasta_agri_bolgesi}</span>
                                            </div>
                                        )}
                                        {randevu.hasta_agri_seviyesi != null && (
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold block">Ağrı Şiddeti</span>
                                                <span className="font-semibold">{randevu.hasta_agri_seviyesi} / 10</span>
                                            </div>
                                        )}
                                        {randevu.hasta_tedavi_tercihi && (
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold block">Tedavi Tercihi</span>
                                                <span className="font-semibold capitalize">{randevu.hasta_tedavi_tercihi}</span>
                                            </div>
                                        )}
                                    </div>
                                    {randevu.hasta_kronik_hastalik === 1 && (
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold block">Kronik Hastalık</span>
                                            <span className="text-sm font-semibold">{randevu.hasta_kronik_hastalik_detay || 'Var'}</span>
                                        </div>
                                    )}
                                    {randevu.hasta_ameliyat_gecmisi === 1 && (
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold block">Ameliyat Geçmişi</span>
                                            <span className="text-sm font-semibold">{randevu.hasta_ameliyat_detay || 'Var'}</span>
                                        </div>
                                    )}
                                    {randevu.hasta_surekli_ilac === 1 && randevu.hasta_ilac_listesi && (
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold block">Sürekli İlaçlar</span>
                                            <span className="text-sm font-semibold">{randevu.hasta_ilac_listesi}</span>
                                        </div>
                                    )}
                                    {randevu.hasta_alerjiler && (
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold block">Alerjiler</span>
                                            <span className="text-sm font-semibold">{randevu.hasta_alerjiler}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Hasta notu */}
                            {randevu.hasta_notu && (
                                <div className="bg-white rounded-2xl p-4 border border-gray-100">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                        Hasta Notu
                                    </div>
                                    <p className="text-sm text-gray-700 italic">"{randevu.hasta_notu}"</p>
                                </div>
                            )}

                            {/* Red notu */}
                            {randevu.red_notu && (
                                <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                                    <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">
                                        Red Açıklaması
                                    </div>
                                    <p className="text-sm text-red-700">{randevu.red_notu}</p>
                                </div>
                            )}

                            <p className="text-[10px] text-gray-400 text-right font-semibold">
                                Talep: {new Date(randevu.created_at).toLocaleDateString('tr-TR')}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function UzmanRandevular() {
    const [randevular, setRandevular] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtre, setFiltre] = useState('hepsi');

    useEffect(() => { fetchRandevular(); }, []);

    const fetchRandevular = async () => {
        setLoading(true);
        try {
            const res = await getUzmanRandevular();
            setRandevular(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = filtre === 'hepsi'
        ? randevular
        : randevular.filter(r => r.durum === filtre);

    const bekleyenSayisi = randevular.filter(r => r.durum === 'beklemede').length;
    const onGorusmeSayisi = randevular.filter(r => r.randevu_tipi === 'on_gorusme' && r.durum === 'onaylandi' && !r.kesin_tarih).length;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
                    <Calendar className="text-blue-600" size={36} />
                    Randevularım
                </h1>
                <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
                    Hastalarınızdan gelen randevu taleplerini takip edin
                </p>
            </div>

            {/* Bekleyen uyarısı */}
            <AnimatePresence>
                {bekleyenSayisi > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center gap-3"
                    >
                        <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                        <p className="text-sm font-bold text-amber-800">
                            {bekleyenSayisi} yeni randevu talebi var — Lütfen tarih ve saat belirleyin.
                        </p>
                    </motion.div>
                )}
                {onGorusmeSayisi > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center gap-3"
                    >
                        <Video className="text-blue-600 flex-shrink-0" size={20} />
                        <p className="text-sm font-bold text-blue-800">
                            {onGorusmeSayisi} onaylı ön görüşme için tarih/saat belirlemeniz gerekiyor.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filtreler */}
            <div className="flex flex-wrap gap-2">
                {FILTRELER.map(f => {
                    const count = f.key === 'hepsi'
                        ? randevular.length
                        : randevular.filter(r => r.durum === f.key).length;
                    return (
                        <button
                            key={f.key}
                            onClick={() => setFiltre(f.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${
                                filtre === f.key
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                            }`}
                        >
                            {f.label}
                            {count > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                                    filtre === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Liste */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-white rounded-[1.75rem] animate-pulse border-2 border-slate-100" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-[1.75rem] border-2 border-slate-100 p-16 text-center">
                    <Calendar className="mx-auto mb-3 text-gray-200" size={48} />
                    <p className="font-black text-gray-400 uppercase tracking-widest text-xs">
                        {filtre === 'hepsi' ? 'Henüz randevu talebiniz yok' : 'Bu kategoride randevu yok'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {filtered.map(r => (
                            <RandevuCard key={r.id} randevu={r} onRefresh={fetchRandevular} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
