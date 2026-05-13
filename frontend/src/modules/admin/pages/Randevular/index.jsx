import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, CheckCircle, XCircle,
    Phone, Mail, ChevronDown, User, Stethoscope, Video
} from 'lucide-react';
import { getRandevular, updateRandevuDurum } from '../../services/adminService';

const DURUMLAR = [
    { key: 'beklemede',   label: 'Bekleyenler',  color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { key: 'onaylandi',   label: 'Onaylananlar', color: 'bg-green-100 text-green-700 border-green-200' },
    { key: 'reddedildi',  label: 'Reddedilenler',color: 'bg-red-100 text-red-700 border-red-200' },
    { key: 'tamamlandi',  label: 'Tamamlananlar',color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { key: 'hepsi',       label: 'Tümü',         color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const TUR_LABEL = {
    online: { label: 'Online',    color: 'bg-violet-100 text-violet-700' },
    evde:   { label: 'Evde',      color: 'bg-emerald-100 text-emerald-700' },
    klinik: { label: 'Klinikte',  color: 'bg-blue-100 text-blue-700' },
};

const DURUM_BADGE = {
    beklemede:  'bg-amber-100 text-amber-700',
    onaylandi:  'bg-green-100 text-green-700',
    reddedildi: 'bg-red-100 text-red-700',
    tamamlandi: 'bg-blue-100 text-blue-700',
    iptal:      'bg-gray-100 text-gray-500',
};

const DURUM_TR = {
    beklemede: 'Beklemede', onaylandi: 'Onaylandı',
    reddedildi: 'Reddedildi', tamamlandi: 'Tamamlandı', iptal: 'İptal'
};

function RandevuRow({ randevu, onUpdate }) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [redNotu, setRedNotu] = useState('');
    const [showRedInput, setShowRedInput] = useState(false);

    const isOnGorusme = randevu.randevu_tipi === 'on_gorusme';

    const handleKarar = async (durum) => {
        if (durum === 'reddedildi' && !showRedInput) {
            setShowRedInput(true);
            return;
        }
        setLoading(true);
        try {
            await updateRandevuDurum(randevu.id, durum, redNotu);
            onUpdate();
        } catch (e) {
            alert('Hata oluştu');
        } finally {
            setLoading(false);
            setShowRedInput(false);
        }
    };

    const tarih = randevu.talep_tarihi ? new Date(randevu.talep_tarihi) : null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
            {/* Ana satır */}
            <div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Tarih / Ön Görüşme kutusu */}
                {isOnGorusme ? (
                    <div className="flex-shrink-0 bg-blue-600 text-white rounded-xl px-4 py-3 text-center min-w-[72px] flex flex-col items-center justify-center gap-1">
                        <Video size={18} className="opacity-80" />
                        <div className="text-[9px] font-black uppercase tracking-wider opacity-80 leading-tight">Ön Görüşme</div>
                        <div className="text-[8px] font-bold opacity-60">15 dk</div>
                    </div>
                ) : (
                    <div className="flex-shrink-0 bg-slate-900 text-white rounded-xl px-4 py-3 text-center min-w-[72px]">
                        <div className="text-2xl font-black leading-none">{tarih?.getDate()}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-1">
                            {tarih?.toLocaleDateString('tr-TR', { month: 'short' })}
                        </div>
                        <div className="text-[10px] opacity-50 mt-0.5">
                            {tarih?.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                )}

                {/* Hasta & Uzman */}
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <User size={9} /> Hasta
                        </div>
                        <div className="font-bold text-gray-900 text-sm truncate">
                            {randevu.hasta_ad} {randevu.hasta_soyad}
                        </div>
                        <div className="text-xs text-gray-400 truncate">{randevu.hasta_email}</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Stethoscope size={9} /> Uzman
                        </div>
                        <div className="font-bold text-gray-900 text-sm truncate">
                            {randevu.unvan} {randevu.uzman_ad} {randevu.uzman_soyad}
                        </div>
                        <div className="text-xs text-gray-400 truncate">{randevu.uzmanlik_alani}</div>
                    </div>
                </div>

                {/* Sağ: tipler + durum + chevron */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {isOnGorusme && (
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                            Ön Görüşme
                        </span>
                    )}
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${TUR_LABEL[randevu.talep_turu]?.color}`}>
                        {TUR_LABEL[randevu.talep_turu]?.label}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${DURUM_BADGE[randevu.durum]}`}>
                        {DURUM_TR[randevu.durum]}
                    </span>
                    <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {/* Detay paneli */}
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

                            {/* Ön Görüşme bilgi notu */}
                            {isOnGorusme && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                    <Video size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Ücretsiz Ön Görüşme Talebi — 15 Dakika</p>
                                        <p className="text-xs text-blue-700">Hasta tarih/saat seçmedi. Onayladıktan sonra uzman kendi panelinden kesin tarihi belirleyecektir.</p>
                                    </div>
                                </div>
                            )}

                            {/* Tarih bilgisi — onaylı ön görüşmede kesin_tarih göster */}
                            {randevu.kesin_tarih && (
                                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Kesin Görüşme Tarihi</p>
                                    <p className="text-sm font-bold text-green-800">
                                        {new Date(randevu.kesin_tarih).toLocaleDateString('tr-TR', {
                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                        {' · '}
                                        {new Date(randevu.kesin_tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            )}

                            {/* İletişim — hasta + uzman telefon/mail */}
                            <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">İletişim Bilgileri</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                            <User size={8} /> Hasta
                                        </p>
                                        <div className="space-y-1.5">
                                            {randevu.hasta_telefon && (
                                                <a href={`tel:${randevu.hasta_telefon}`}
                                                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
                                                    <Phone size={13} /> {randevu.hasta_telefon}
                                                </a>
                                            )}
                                            {randevu.hasta_email && (
                                                <a href={`mailto:${randevu.hasta_email}`}
                                                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
                                                    <Mail size={13} /> {randevu.hasta_email}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                            <Stethoscope size={8} /> Uzman
                                        </p>
                                        <div className="space-y-1.5">
                                            {randevu.uzman_telefon && (
                                                <a href={`tel:${randevu.uzman_telefon}`}
                                                    className="flex items-center gap-2 text-sm font-semibold text-violet-600 hover:underline">
                                                    <Phone size={13} /> {randevu.uzman_telefon}
                                                </a>
                                            )}
                                            {randevu.uzman_email && (
                                                <a href={`mailto:${randevu.uzman_email}`}
                                                    className="flex items-center gap-2 text-sm font-semibold text-violet-600 hover:underline">
                                                    <Mail size={13} /> {randevu.uzman_email}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hasta notu */}
                            {randevu.hasta_notu && (
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                        Hasta Notu
                                    </div>
                                    <p className="text-sm text-gray-700">{randevu.hasta_notu}</p>
                                </div>
                            )}

                            {/* Red notu */}
                            {randevu.red_notu && (
                                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                    <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">
                                        Red Notu
                                    </div>
                                    <p className="text-sm text-red-700">{randevu.red_notu}</p>
                                </div>
                            )}

                            {/* Red notu input */}
                            {showRedInput && (
                                <div className="bg-white rounded-xl p-4 border border-red-200">
                                    <label className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 block">
                                        Red Nedeni (opsiyonel)
                                    </label>
                                    <textarea
                                        value={redNotu}
                                        onChange={(e) => setRedNotu(e.target.value)}
                                        rows={2}
                                        placeholder="Hastaya gösterilecek red açıklaması..."
                                        className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:border-red-300"
                                    />
                                </div>
                            )}

                            {/* Aksiyon butonları — sadece beklemede ise */}
                            {randevu.durum === 'beklemede' && (
                                <div className="flex flex-wrap gap-3">
                                    {!showRedInput ? (
                                        <>
                                            <button
                                                onClick={() => handleKarar('onaylandi')}
                                                disabled={loading}
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700
                                                    text-white text-xs font-black px-5 py-2.5 rounded-xl
                                                    uppercase tracking-widest transition-colors disabled:opacity-50"
                                            >
                                                <CheckCircle size={14} />
                                                Onayla
                                            </button>
                                            <button
                                                onClick={() => setShowRedInput(true)}
                                                disabled={loading}
                                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700
                                                    text-white text-xs font-black px-5 py-2.5 rounded-xl
                                                    uppercase tracking-widest transition-colors disabled:opacity-50"
                                            >
                                                <XCircle size={14} />
                                                Reddet
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleKarar('reddedildi')}
                                                disabled={loading}
                                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700
                                                    text-white text-xs font-black px-5 py-2.5 rounded-xl
                                                    uppercase tracking-widest transition-colors disabled:opacity-50"
                                            >
                                                <XCircle size={14} />
                                                {loading ? 'İşleniyor...' : 'Reddi Onayla'}
                                            </button>
                                            <button
                                                onClick={() => setShowRedInput(false)}
                                                className="text-xs font-black text-gray-500 px-4 py-2.5
                                                    hover:text-gray-700 uppercase tracking-widest"
                                            >
                                                İptal
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Onaylıysa tamamla butonu */}
                            {randevu.durum === 'onaylandi' && (
                                <button
                                    onClick={() => handleKarar('tamamlandi')}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                                        text-white text-xs font-black px-5 py-2.5 rounded-xl
                                        uppercase tracking-widest transition-colors disabled:opacity-50"
                                >
                                    <CheckCircle size={14} />
                                    Tamamlandı Olarak İşaretle
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function AdminRandevular() {
    const [randevular, setRandevular] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aktifDurum, setAktifDurum] = useState('beklemede');
    const [total, setTotal] = useState(0);

    useEffect(() => { fetchRandevular(); }, [aktifDurum]);

    const fetchRandevular = async () => {
        setLoading(true);
        try {
            const res = await getRandevular({ durum: aktifDurum });
            setRandevular(res.data.randevular);
            setTotal(res.data.total);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const bekleyenSayisi = aktifDurum === 'beklemede' ? total : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Calendar className="text-blue-600" size={32} />
                        Randevular
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Hasta randevu ve ön görüşme taleplerini buradan yönetin
                    </p>
                </div>
                {bekleyenSayisi > 0 && (
                    <div className="bg-amber-100 text-amber-700 font-black text-sm
                        px-4 py-2 rounded-xl border border-amber-200 flex items-center gap-2">
                        <Clock size={16} />
                        {bekleyenSayisi} bekleyen talep
                    </div>
                )}
            </div>

            {/* Durum filtreleri */}
            <div className="flex flex-wrap gap-2">
                {DURUMLAR.map(d => (
                    <button
                        key={d.key}
                        onClick={() => setAktifDurum(d.key)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest
                            border transition-all ${aktifDurum === d.key
                                ? d.color + ' shadow-sm'
                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                    >
                        {d.label}
                    </button>
                ))}
            </div>

            {/* Liste */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : randevular.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                    <Calendar className="mx-auto mb-3 text-gray-200" size={48} />
                    <p className="font-bold text-gray-400">Bu kategoride randevu yok</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {randevular.map(r => (
                        <RandevuRow key={r.id} randevu={r} onUpdate={fetchRandevular} />
                    ))}
                </div>
            )}
        </div>
    );
}
