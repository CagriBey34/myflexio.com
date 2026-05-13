import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, CheckCircle, XCircle,
    AlertCircle, ChevronDown, Stethoscope,
    RefreshCw, Video
} from 'lucide-react';
import { getHastaRandevular, hastaKarar } from '../../services/randevuService';

const DURUM_CONFIG = {
    beklemede:  { label: 'Beklemede',   color: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400' },
    onaylandi:  { label: 'Onaylandı',   color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
    reddedildi: { label: 'Reddedildi',  color: 'bg-red-100 text-red-700',      dot: 'bg-red-400' },
    tamamlandi: { label: 'Tamamlandı',  color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
    iptal:      { label: 'İptal',       color: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400' },
};

const TUR_CONFIG = {
    online: { label: 'Online',    emoji: '💻' },
    evde:   { label: 'Evde',      emoji: '🏠' },
    klinik: { label: 'Klinikte',  emoji: '🏥' },
};

const FILTRELER = [
    { key: 'hepsi',      label: 'Tümü' },
    { key: 'beklemede',  label: 'Bekleyenler' },
    { key: 'onaylandi',  label: 'Onaylananlar' },
    { key: 'reddedildi', label: 'Reddedilenler' },
    { key: 'tamamlandi', label: 'Tamamlananlar' },
];

function RandevuCard({ randevu, onUpdate }) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);

    const durum = DURUM_CONFIG[randevu.durum] || DURUM_CONFIG.beklemede;
    const tur = TUR_CONFIG[randevu.talep_turu] || {};
    const isOnGorusme = randevu.randevu_tipi === 'on_gorusme';
    const tarih = randevu.talep_tarihi ? new Date(randevu.talep_tarihi) : null;
    const kesinTarih = randevu.kesin_tarih ? new Date(randevu.kesin_tarih) : null;

    // Uzman alternatif tarih önermiş mi?
    const hasAlternatif = randevu.durum === 'reddedildi' && randevu.alternatif_tarih;
    const alternatifTarih = hasAlternatif ? new Date(randevu.alternatif_tarih) : null;

    const handleKarar = async (karar) => {
        setLoading(true);
        try {
            await hastaKarar(randevu.id, karar);
            onUpdate();
        } catch (e) {
            alert('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-[1.75rem] border-2 overflow-hidden shadow-sm transition-all
                ${hasAlternatif ? 'border-amber-300' : 'border-slate-100'}`}
        >
            {/* Alternatif tarih uyarı bandı */}
            {hasAlternatif && (
                <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5
                    flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
                    <p className="text-xs font-bold text-amber-700">
                        Alternatif tarih önerildi — karar vermeniz bekleniyor
                    </p>
                </div>
            )}

            {/* Ana satır */}
            <div
                className="flex items-center gap-4 p-5 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Tarih kutusu */}
                {isOnGorusme ? (
                    <div className="flex-shrink-0 bg-blue-600 text-white rounded-2xl
                        px-3 py-3 text-center min-w-[60px] flex flex-col items-center gap-1">
                        <Video size={16} className="opacity-80" />
                        <div className="text-[8px] font-black uppercase tracking-wide opacity-80 leading-tight">Ön Görüşme</div>
                    </div>
                ) : tarih ? (
                    <div className="flex-shrink-0 bg-slate-900 text-white rounded-2xl
                        px-3 py-3 text-center min-w-[60px]">
                        <div className="text-xl font-black leading-none">{tarih.getDate()}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider
                            opacity-60 mt-1">
                            {tarih.toLocaleDateString('tr-TR', { month: 'short' })}
                        </div>
                        <div className="text-[9px] opacity-50 mt-0.5">
                            {tarih.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ) : (
                    <div className="flex-shrink-0 bg-slate-200 text-slate-500 rounded-2xl
                        px-3 py-3 text-center min-w-[60px]">
                        <div className="text-[8px] font-black uppercase leading-tight">Tarih Bekleniyor</div>
                    </div>
                )}

                {/* Uzman bilgisi */}
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black text-gray-400 uppercase
                        tracking-widest mb-0.5 flex items-center gap-1">
                        <Stethoscope size={9} /> Uzman
                    </div>
                    <div className="font-black text-slate-900 truncate">
                        {randevu.unvan} {randevu.uzman_ad} {randevu.uzman_soyad}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                        {randevu.uzmanlik_alani}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs">{tur.emoji}</span>
                        <span className="text-xs text-gray-500 font-semibold">
                            {tur.label}
                        </span>
                    </div>
                </div>

                {/* Sağ: durum + chevron */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-black px-2.5 py-1
                        rounded-full ${durum.color}`}>
                        {durum.label}
                    </span>
                    <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform
                            ${expanded ? 'rotate-180' : ''}`}
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

                            {/* Ön görüşme bilgi notu */}
                            {isOnGorusme && (
                                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
                                    <Video size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Ücretsiz Ön Görüşme · 15 Dakika</p>
                                        <p className="text-xs text-blue-700">Tarih ve saat uzman tarafından belirlenerek size bildirilecektir.</p>
                                    </div>
                                </div>
                            )}

                            {/* Talep tarihi — sadece normal randevularda */}
                            {!isOnGorusme && tarih && (
                                <div className="bg-white rounded-2xl p-4 border border-gray-100">
                                    <div className="text-[10px] font-black text-gray-400 uppercase
                                        tracking-widest mb-1 flex items-center gap-1">
                                        <Calendar size={9} /> Talep Ettiğiniz Tarih
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {tarih.toLocaleDateString('tr-TR', {
                                            weekday: 'long', day: 'numeric',
                                            month: 'long', year: 'numeric'
                                        })}
                                        {' · '}
                                        {tarih.toLocaleTimeString('tr-TR', {
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            )}

                            {/* Kesin tarih — uzman tarafından belirlendiyse */}
                            {kesinTarih && (
                                <div className={`rounded-2xl p-4 border ${randevu.durum === 'onaylandi' ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                                    <div className={`text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1 ${randevu.durum === 'onaylandi' ? 'text-green-500' : 'text-amber-600'}`}>
                                        <CheckCircle size={9} />
                                        {randevu.durum === 'onaylandi' ? 'Onaylanan Randevu Tarihi' : 'Belirlenen Tarih (Admin Onayı Bekleniyor)'}
                                    </div>
                                    <p className={`text-sm font-bold ${randevu.durum === 'onaylandi' ? 'text-green-800' : 'text-amber-800'}`}>
                                        {kesinTarih.toLocaleDateString('tr-TR', {
                                            weekday: 'long', day: 'numeric',
                                            month: 'long', year: 'numeric'
                                        })}
                                        {' · '}
                                        {kesinTarih.toLocaleTimeString('tr-TR', {
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            )}

                            {/* Hasta notu */}
                            {randevu.hasta_notu && (
                                <div className="bg-white rounded-2xl p-4 border border-gray-100">
                                    <div className="text-[10px] font-black text-gray-400
                                        uppercase tracking-widest mb-1">
                                        Notunuz
                                    </div>
                                    <p className="text-sm text-gray-700 italic">
                                        "{randevu.hasta_notu}"
                                    </p>
                                </div>
                            )}

                            {/* Red notu */}
                            {randevu.red_notu && (
                                <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                                    <div className="text-[10px] font-black text-red-400
                                        uppercase tracking-widest mb-1">
                                        Açıklama
                                    </div>
                                    <p className="text-sm text-red-700">{randevu.red_notu}</p>
                                </div>
                            )}

                            {/* Alternatif tarih önerisi — karar ver */}
                            {hasAlternatif && (
                                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                                    <div className="text-[10px] font-black text-amber-600
                                        uppercase tracking-widest mb-2 flex items-center gap-1">
                                        <RefreshCw size={9} /> Önerilen Alternatif Tarih
                                    </div>
                                    <p className="text-sm font-bold text-amber-900 mb-4">
                                        {alternatifTarih.toLocaleDateString('tr-TR', {
                                            weekday: 'long', day: 'numeric',
                                            month: 'long', year: 'numeric'
                                        })}
                                        {' · '}
                                        {alternatifTarih.toLocaleTimeString('tr-TR', {
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleKarar('kabul')}
                                            disabled={loading}
                                            className="flex-1 flex items-center justify-center gap-1.5
                                                bg-green-600 hover:bg-green-700 text-white
                                                text-xs font-black py-2.5 rounded-xl
                                                uppercase tracking-widest transition-colors
                                                disabled:opacity-50"
                                        >
                                            <CheckCircle size={13} />
                                            Kabul Et
                                        </button>
                                        <button
                                            onClick={() => handleKarar('red')}
                                            disabled={loading}
                                            className="flex-1 flex items-center justify-center gap-1.5
                                                bg-white hover:bg-red-50 text-red-600 border-2
                                                border-red-200 text-xs font-black py-2.5
                                                rounded-xl uppercase tracking-widest
                                                transition-colors disabled:opacity-50"
                                        >
                                            <XCircle size={13} />
                                            Reddet
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Talep tarihi */}
                            <p className="text-[10px] text-gray-400 text-right font-semibold">
                                Oluşturuldu: {new Date(randevu.created_at).toLocaleDateString('tr-TR')}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function Randevularim() {
    const [randevular, setRandevular] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtre, setFiltre] = useState('hepsi');

    useEffect(() => { fetchRandevular(); }, []);

    const fetchRandevular = async () => {
        setLoading(true);
        try {
            const res = await getHastaRandevular();
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

    const alternatifSayisi = randevular.filter(
        r => r.durum === 'reddedildi' && r.alternatif_tarih
    ).length;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">

            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic
                    flex items-center gap-3">
                    <Calendar className="text-blue-600" size={36} />
                    Randevularım
                </h1>
                <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
                    Tüm randevu taleplerinizi buradan takip edebilirsiniz
                </p>
            </div>

            {/* Uyarı bantları */}
            <AnimatePresence>
                {alternatifSayisi > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4
                            flex items-center gap-3"
                    >
                        <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                        <p className="text-sm font-bold text-amber-800">
                            {alternatifSayisi} randevunuz için alternatif tarih önerildi.
                            Lütfen karar verin.
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
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl
                                text-xs font-black uppercase tracking-widest border-2
                                transition-all ${filtre === f.key
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                        >
                            {f.label}
                            {count > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full
                                    font-black ${filtre === f.key
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 text-gray-500'}`}>
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
                        <div key={i}
                            className="h-24 bg-white rounded-[1.75rem] animate-pulse
                                border-2 border-slate-100" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-[1.75rem] border-2 border-slate-100
                    p-16 text-center">
                    <Calendar className="mx-auto mb-3 text-gray-200" size={48} />
                    <p className="font-black text-gray-400 uppercase tracking-widest text-xs">
                        {filtre === 'hepsi'
                            ? 'Henüz randevu talebiniz yok'
                            : 'Bu kategoride randevu yok'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {filtered.map(r => (
                            <RandevuCard
                                key={r.id}
                                randevu={r}
                                onUpdate={fetchRandevular}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
