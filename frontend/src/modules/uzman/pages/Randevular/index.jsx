import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, CheckCircle, XCircle,
    ChevronDown, User, AlertCircle,
    Video, Edit3, Loader2, Activity,
    ClipboardList, MapPin, FileText, ExternalLink, PlayCircle,
    Phone, Mail, CheckSquare
} from 'lucide-react';
import { getUzmanRandevular, createTedaviPlani, getUzmanTedaviPlanlari, aktiveTedaviPlani, uzmanSeansVer, getUzmanEslesmeler, getEslesmeSeanslari, setSeansTargihi, uzmanSeansOnay } from '../../services/uzmanService';
import api from '../../../../shared/services/api';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');

const PLAN_DURUM_CONFIG = {
    beklemede_odeme: { label: 'Ödeme Bekleniyor', color: 'bg-amber-100 text-amber-700' },
    dekont_yuklendi: { label: 'Dekont Yüklendi', color: 'bg-blue-100 text-blue-700' },
    aktif:           { label: 'Aktif', color: 'bg-green-100 text-green-700' },
};

function TedaviPlaniKarti({ plan, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const durum = PLAN_DURUM_CONFIG[plan.durum] || PLAN_DURUM_CONFIG.beklemede_odeme;

    const handleAktifet = async () => {
        setLoading(true);
        setMsg('');
        try {
            await aktiveTedaviPlani(plan.id);
            setMsg('Tedavi planı aktifleştirildi.');
            onRefresh?.();
        } catch (e) {
            setMsg(e.response?.data?.message || 'Hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-5 space-y-4">
            {/* Başlık */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                        <User size={10} /> Hasta
                    </p>
                    <p className="text-base font-black text-[#0a2e1a]">{plan.hasta_ad} {plan.hasta_soyad}</p>
                </div>
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${durum.color}`}>
                    {durum.label}
                </span>
            </div>

            {/* Plan detayları */}
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tür</p>
                    <p className="text-sm font-black text-[#0a2e1a] capitalize">{plan.tedavi_turu}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Seans</p>
                    <p className="text-sm font-black text-[#0a2e1a]">{plan.seans_sayisi}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Toplam</p>
                    <p className="text-sm font-black text-[#0a2e1a]">₺{Number(plan.toplam_ucret).toLocaleString('tr-TR')}</p>
                </div>
            </div>

            {/* Dekont göster (dekont_yuklendi veya aktif) */}
            {plan.dekont_url && (
                <a
                    href={`${API_BASE}${plan.dekont_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-black text-blue-600 bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl hover:bg-blue-100 transition-colors"
                >
                    <FileText size={14} /> Yüklenen Dekontu Görüntüle
                    <ExternalLink size={12} className="ml-auto" />
                </a>
            )}

            {/* Aktifleştir butonu (sadece dekont_yuklendi ise) */}
            {plan.durum === 'dekont_yuklendi' && (
                <button
                    onClick={handleAktifet}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-[#4ade80] hover:bg-[#22c55e] text-[#0a2e1a] text-xs font-black px-5 py-3 rounded-xl uppercase tracking-widest transition-all w-full disabled:opacity-50"
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
                    Planı Aktifleştir
                </button>
            )}

            {msg && (
                <p className={`text-xs font-bold ${msg.includes('Hata') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>
            )}

            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest text-right">
                {new Date(plan.created_at).toLocaleDateString('tr-TR')}
            </p>
        </div>
    );
}

const DURUM_CONFIG = {
    beklemede:  { label: 'Beklemede',  color: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400' },
    onaylandi:  { label: 'Onaylandı',  color: 'bg-[#dcfce7] text-[#16a34a]',  dot: 'bg-[#4ade80]' },
    reddedildi: { label: 'Reddedildi', color: 'bg-red-100 text-red-700',      dot: 'bg-red-400' },
    tamamlandi: { label: 'Tamamlandı', color: 'bg-[#0f4c35] text-white',      dot: 'bg-white' },
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

function TedaviPlaniForm({ randevu, onSaved }) {
    const [tedaviTuru, setTedaviTuru] = useState('online');
    const [seansSayisi, setSeansSayisi] = useState('');
    const [notlar, setNotlar] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    const handleSubmit = async () => {
        if (!seansSayisi || parseInt(seansSayisi) < 1) {
            setError('Lütfen geçerli bir seans sayısı girin.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await createTedaviPlani({
                hastaProfileId: randevu.hasta_profile_id,
                randevuId: randevu.id,
                tedaviTuru,
                seansSayisi: parseInt(seansSayisi),
                notlar,
            });
            setSaved(true);
            onSaved?.();
        } catch (e) {
            setError(e.response?.data?.message || 'Tedavi planı oluşturulamadı.');
        } finally {
            setLoading(false);
        }
    };

    if (saved) {
        return (
            <div className="flex items-center gap-2 text-[#16a34a] bg-[#dcfce7] px-4 py-3 rounded-2xl text-xs font-black">
                <CheckCircle size={16} /> Tedavi planı hastaya iletildi!
            </div>
        );
    }

    return (
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[1.5rem] p-5 space-y-4">
            <p className="text-[10px] font-black text-[#16a34a] uppercase tracking-widest flex items-center gap-1.5">
                <ClipboardList size={12} /> Tedavi Planı Oluştur
            </p>

            {/* Tedavi türü */}
            <div className="flex gap-3">
                {[
                    { value: 'online', label: '💻 Online Tedavi' },
                    { value: 'evde',   label: '🏠 Evde Tedavi' },
                ].map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTedaviTuru(opt.value)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${
                            tedaviTuru === opt.value
                                ? 'bg-[#0f4c35] text-white border-[#0f4c35]'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-[#4ade80]'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Seans sayısı */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Seans Sayısı</label>
                <input
                    type="number"
                    min="1"
                    max="50"
                    value={seansSayisi}
                    onChange={e => setSeansSayisi(e.target.value)}
                    placeholder="Örn: 10"
                    className="text-sm font-bold text-[#0a2e1a] border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent transition-all bg-white w-32"
                />
            </div>

            {/* Notlar */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Notlar (Opsiyonel)</label>
                <textarea
                    value={notlar}
                    onChange={e => setNotlar(e.target.value)}
                    placeholder="Tedavi hakkında hasta için not..."
                    rows={2}
                    className="text-sm text-[#0a2e1a] border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent transition-all bg-white resize-none"
                />
            </div>

            <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-[#4ade80] hover:bg-[#22c55e] text-[#0a2e1a] text-xs font-black px-6 py-3 rounded-xl uppercase tracking-widest transition-all shadow-md shadow-green-500/20 disabled:opacity-50 w-full"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ClipboardList size={16} />}
                Tedavi Planını Gönder
            </button>

            {error && (
                <p className="text-xs text-red-500 font-bold flex items-center gap-1.5 bg-red-50 p-2 rounded-lg">
                    <XCircle size={14} /> {error}
                </p>
            )}
        </div>
    );
}

function KesinTarihForm({ randevuId, mevcutTarih, onSaved }) {
    const [tarih, setTarih] = useState('');
    const [saat, setSaat] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

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
            <div className="flex items-center gap-2 text-[#16a34a] bg-[#dcfce7] px-4 py-3 rounded-2xl text-xs font-black">
                <CheckCircle size={16} /> Tarih ve saat başarıyla kaydedildi!
            </div>
        );
    }

    return (
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[1.5rem] p-5 space-y-4">
            <p className="text-[10px] font-black text-[#16a34a] uppercase tracking-widest flex items-center gap-1.5">
                <Edit3 size={12} /> Kesin Tarih & Saat Belirle
            </p>
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tarih</label>
                    <input
                        type="date"
                        value={tarih}
                        onChange={e => setTarih(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="text-sm font-bold text-[#0a2e1a] border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent transition-all bg-white"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Saat</label>
                    <input
                        type="time"
                        value={saat}
                        onChange={e => setSaat(e.target.value)}
                        className="text-sm font-bold text-[#0a2e1a] border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent transition-all bg-white"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-[#4ade80] hover:bg-[#22c55e] text-[#0a2e1a] text-xs font-black px-6 py-3 rounded-xl uppercase tracking-widest transition-all shadow-md shadow-green-500/20 disabled:opacity-50 min-w-[120px]"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        Kaydet
                    </button>
                </div>
            </div>
            {error && (
                <p className="text-xs text-red-500 font-bold flex items-center gap-1.5 bg-red-50 p-2 rounded-lg">
                    <XCircle size={14} /> {error}
                </p>
            )}
        </div>
    );
}

function RandevuCard({ randevu, onRefresh }) {
    const [expanded, setExpanded] = useState(false);
    const [seansLoading, setSeansLoading] = useState(false);

    const isOnGorusme = randevu.randevu_tipi === 'on_gorusme';
    const eslesme = randevu.eslesme_var == 1;
    const seansVerildi = !!randevu.uzman_seans_onayladi;

    const handleSeansVer = async () => {
        setSeansLoading(true);
        try {
            await uzmanSeansVer(randevu.id);
            onRefresh?.();
        } catch (e) {
            console.error(e);
        } finally {
            setSeansLoading(false);
        }
    };
    const durum = DURUM_CONFIG[randevu.durum] || DURUM_CONFIG.beklemede;
    const tur = TUR_CONFIG[randevu.talep_turu] || {};
    const tarih = randevu.talep_tarihi ? new Date(randevu.talep_tarihi) : null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:border-[#4ade80]/40 transition-colors duration-300 group"
        >
            <div
                className="flex items-center gap-4 p-5 md:p-6 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Tarih / Ön Görüşme kutusu */}
                {isOnGorusme ? (
                    <div className="flex-shrink-0 bg-[#4ade80] text-[#0a2e1a] rounded-2xl px-3 py-3 text-center min-w-[70px] flex flex-col items-center gap-1.5 shadow-sm">
                        <Video size={20} />
                        <div className="text-[8px] font-black uppercase tracking-widest leading-tight">Ön Görüşme</div>
                    </div>
                ) : (
                    <div className="flex-shrink-0 bg-[#0f4c35] text-white rounded-2xl px-3 py-3 text-center min-w-[70px] shadow-sm">
                        <div className="text-2xl font-black leading-none">{tarih?.getDate()}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">
                            {tarih?.toLocaleDateString('tr-TR', { month: 'short' })}
                        </div>
                        <div className="text-[10px] font-medium opacity-60 mt-0.5">
                            {tarih?.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                )}

                {/* Hasta bilgisi */}
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black text-[#16a34a] uppercase tracking-widest mb-1 flex items-center gap-1">
                        <User size={10} /> Hasta
                    </div>
                    <div className="text-lg font-black text-[#0a2e1a] truncate">
                        {randevu.hasta_ad} {randevu.hasta_soyad}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        {isOnGorusme
                            ? <span className="text-xs text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded-lg">Ücretsiz Ön Görüşme · 15 dk</span>
                            : <span className="text-xs text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-1.5">{tur.emoji} {tur.label}</span>
                        }
                    </div>
                </div>

                {/* Durum + chevron */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 ${durum.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${durum.dot}`} />
                        <span className="hidden sm:inline">{durum.label}</span>
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${expanded ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                        />
                    </div>
                </div>
            </div>

            {/* Detay */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-gray-50"
                    >
                        <div className="p-5 md:p-6 space-y-5 bg-[#f8fafc]">

                            {/* Talep tarihi (sadece normal randevularda) */}
                            {!isOnGorusme && tarih && (
                                <div className="bg-white rounded-[1.5rem] p-5 border border-gray-100">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <Calendar size={12} className="text-[#16a34a]"/> Talep Edilen Tarih
                                    </div>
                                    <p className="text-sm font-black text-[#0a2e1a]">
                                        {tarih.toLocaleDateString('tr-TR', {
                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                        <span className="text-gray-300 mx-2">|</span>
                                        {tarih.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            )}

                            {/* Kesin tarih göster (herhangi bir durumda) */}
                            {randevu.kesin_tarih && (
                                <div className="bg-[#f0fdf4] rounded-[1.5rem] p-5 border border-[#bbf7d0]">
                                    <div className="text-[10px] font-black text-[#16a34a] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <CheckCircle size={12} /> Belirlenen Tarih & Saat
                                    </div>
                                    <p className="text-sm font-black text-[#0f4c35]">
                                        {new Date(randevu.kesin_tarih).toLocaleDateString('tr-TR', {
                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                        <span className="text-[#4ade80] mx-2">|</span>
                                        {new Date(randevu.kesin_tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {randevu.durum === 'beklemede' && (
                                        <p className="text-[10px] text-amber-600 font-bold mt-2 flex items-center gap-1">
                                            <AlertCircle size={12}/> Admin onayı bekleniyor — Hasta bildirim almadı
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
                            <div className="bg-white rounded-[1.5rem] p-5 border border-gray-100">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                    <User size={12} className="text-[#16a34a]"/> Hasta İletişim
                                </div>
                                {!eslesme && (
                                    <p className="text-xs text-amber-600 font-bold bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
                                        İletişim bilgileri yalnızca aktif tedavi planı olan hastalarda görünür.
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-4 mt-3">
                                    {eslesme && randevu.hasta_telefon && (
                                        <a href={`tel:${randevu.hasta_telefon}`}
                                            className="flex items-center gap-2 text-sm font-bold text-[#0a2e1a] hover:text-[#16a34a] transition-colors bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                            <Phone size={14} className="text-gray-400" /> {randevu.hasta_telefon}
                                        </a>
                                    )}
                                    {eslesme && randevu.hasta_email && (
                                        <a href={`mailto:${randevu.hasta_email}`}
                                            className="flex items-center gap-2 text-sm font-bold text-[#0a2e1a] hover:text-[#16a34a] transition-colors bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                            <Mail size={14} className="text-gray-400" /> {randevu.hasta_email}
                                        </a>
                                    )}
                                    {(randevu.hasta_sehir || randevu.hasta_ilce) && (
                                        <span className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                            <MapPin size={14} className="text-gray-400" /> {[randevu.hasta_ilce, randevu.hasta_sehir].filter(Boolean).join(', ')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Seans Verdim butonu — onaylı randevularda */}
                            {randevu.durum === 'onaylandi' && (
                                seansVerildi ? (
                                    <div className="flex items-center gap-2 bg-gray-100 text-gray-400 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed">
                                        <CheckSquare size={14} /> Seans Verildi — Onaylandı
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleSeansVer}
                                        disabled={seansLoading}
                                        className="flex items-center justify-center gap-2 bg-[#0f4c35] hover:bg-[#0a3325] text-white text-xs font-black px-6 py-3 rounded-xl uppercase tracking-widest transition-all shadow-md disabled:opacity-50 w-full sm:w-auto"
                                    >
                                        {seansLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckSquare size={14} />}
                                        Seans Verdim
                                    </button>
                                )
                            )}

                            {/* Hasta tıbbi profili */}
                            {(randevu.hasta_dogum_tarihi || randevu.hasta_cinsiyet || randevu.hasta_agri_bolgesi ||
                              randevu.hasta_agri_seviyesi || randevu.hasta_kronik_hastalik || randevu.hasta_ameliyat_gecmisi ||
                              randevu.hasta_surekli_ilac || randevu.hasta_alerjiler) && (
                                <div className="bg-white rounded-[1.5rem] p-5 border border-gray-100">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                        <Activity size={12} className="text-[#16a34a]"/> Tıbbi Profil
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4 text-sm">
                                        {randevu.hasta_dogum_tarihi && (
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-0.5">Doğum Tarihi</span>
                                                <span className="font-black text-[#0a2e1a]">{new Date(randevu.hasta_dogum_tarihi).toLocaleDateString('tr-TR')}</span>
                                            </div>
                                        )}
                                        {randevu.hasta_cinsiyet && (
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-0.5">Cinsiyet</span>
                                                <span className="font-black text-[#0a2e1a] capitalize">{randevu.hasta_cinsiyet}</span>
                                            </div>
                                        )}
                                        {randevu.hasta_agri_bolgesi && (
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-0.5">Ağrı Bölgesi</span>
                                                <span className="font-black text-[#0a2e1a]">{randevu.hasta_agri_bolgesi}</span>
                                            </div>
                                        )}
                                        {randevu.hasta_agri_seviyesi != null && (
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-0.5">Ağrı Şiddeti</span>
                                                <span className="font-black text-[#0a2e1a]">{randevu.hasta_agri_seviyesi} / 10</span>
                                            </div>
                                        )}
                                        {randevu.hasta_tedavi_tercihi && (
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-0.5">Tedavi Tercihi</span>
                                                <span className="font-black text-[#0a2e1a] capitalize">{randevu.hasta_tedavi_tercihi}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Alt detaylar */}
                                    <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
                                        {randevu.hasta_kronik_hastalik === 1 && (
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-0.5">Kronik Hastalık</span>
                                                <span className="text-sm font-black text-red-500">{randevu.hasta_kronik_hastalik_detay || 'Var'}</span>
                                            </div>
                                        )}
                                        {randevu.hasta_ameliyat_gecmisi === 1 && (
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-0.5">Ameliyat Geçmişi</span>
                                                <span className="text-sm font-black text-[#0a2e1a]">{randevu.hasta_ameliyat_detay || 'Var'}</span>
                                            </div>
                                        )}
                                        {randevu.hasta_surekli_ilac === 1 && randevu.hasta_ilac_listesi && (
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-0.5">Sürekli İlaçlar</span>
                                                <span className="text-sm font-black text-[#0a2e1a]">{randevu.hasta_ilac_listesi}</span>
                                            </div>
                                        )}
                                        {randevu.hasta_alerjiler && (
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-0.5">Alerjiler</span>
                                                <span className="text-sm font-black text-red-500">{randevu.hasta_alerjiler}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tedavi planı oluştur — onaylı veya tamamlanan ön görüşmelerde */}
                            {isOnGorusme && (randevu.durum === 'onaylandi' || randevu.durum === 'tamamlandi') && (
                                <TedaviPlaniForm randevu={randevu} onSaved={onRefresh} />
                            )}

                            {/* Hasta notu */}
                            {randevu.hasta_notu && (
                                <div className="bg-[#f8fafc] rounded-[1.5rem] p-5 border border-gray-200">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Edit3 size={12}/> Hasta Notu
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium italic">"{randevu.hasta_notu}"</p>
                                </div>
                            )}

                            {/* Red notu */}
                            {randevu.red_notu && (
                                <div className="bg-red-50 rounded-[1.5rem] p-5 border border-red-100">
                                    <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <XCircle size={12}/> Red Açıklaması
                                    </div>
                                    <p className="text-sm font-bold text-red-700">{randevu.red_notu}</p>
                                </div>
                            )}

                            <p className="text-[10px] text-gray-400 text-right font-black uppercase tracking-widest">
                                Talep Oluşturulma: {new Date(randevu.created_at).toLocaleDateString('tr-TR')}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Seans kartı (aktif hasta detay sayfasında) ──────────────────────────────

function SeansKarti({ seans, onRefresh }) {
    const [tarih, setTarih] = useState(seans.tarih ? new Date(seans.tarih).toISOString().slice(0, 16) : '');
    const [tarihLoading, setTarihLoading] = useState(false);
    const [tarihMsg, setTarihMsg] = useState('');
    const [seansLoading, setSeansLoading] = useState(false);

    const isDone = seans.durum === 'tamamlandi';
    const isLocked = seans.durum === 'bekliyor';
    const isActive = seans.durum === 'aktif';
    const seansVerildi = !!seans.uzman_seans_onayladi;

    const handleTarihKaydet = async () => {
        if (!tarih) return;
        setTarihLoading(true);
        setTarihMsg('');
        try {
            await setSeansTargihi(seans.id, tarih.replace('T', ' ') + ':00');
            setTarihMsg('Kaydedildi');
            onRefresh?.();
        } catch {
            setTarihMsg('Hata');
        } finally {
            setTarihLoading(false);
        }
    };

    const handleSeansVer = async () => {
        setSeansLoading(true);
        try {
            await uzmanSeansOnay(seans.id);
            onRefresh?.();
        } catch (e) {
            console.error(e);
        } finally {
            setSeansLoading(false);
        }
    };

    return (
        <div className={`rounded-2xl border p-4 space-y-3 transition-all ${
            isDone ? 'bg-[#f0fdf4] border-[#bbf7d0]' :
            isLocked ? 'bg-gray-50 border-gray-100 opacity-60' :
            'bg-white border-[#4ade80]/40 shadow-sm'
        }`}>
            {/* Seans no + durum */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                    Seans {seans.seans_no}
                </span>
                {isDone && <span className="text-[10px] font-black text-[#16a34a] bg-[#dcfce7] px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10} /> Tamamlandı</span>}
                {isLocked && <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full uppercase tracking-widest">Kilitli</span>}
                {isActive && <span className="text-[10px] font-black text-[#0f4c35] bg-[#dcfce7] px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1"><Activity size={10} /> Aktif</span>}
            </div>

            {/* Tarih göster veya belirle */}
            {seans.tarih && (
                <p className="text-sm font-black text-[#0a2e1a] flex items-center gap-2">
                    <Calendar size={14} className="text-[#16a34a]" />
                    {new Date(seans.tarih).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    <span className="text-gray-300">|</span>
                    {new Date(seans.tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </p>
            )}

            {/* Tarih belirleme — sadece aktif seansta */}
            {isActive && (
                <div className="flex items-center gap-2 flex-wrap">
                    <input
                        type="datetime-local"
                        value={tarih}
                        onChange={e => setTarih(e.target.value)}
                        className="text-xs font-bold text-[#0a2e1a] border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4ade80] bg-white"
                    />
                    <button
                        onClick={handleTarihKaydet}
                        disabled={tarihLoading || !tarih}
                        className="flex items-center gap-1.5 bg-gray-100 hover:bg-[#dcfce7] text-[#0a2e1a] text-[10px] font-black px-3 py-2 rounded-xl uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                        {tarihLoading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                        Kaydet
                    </button>
                    {tarihMsg && <span className="text-[10px] font-bold text-[#16a34a]">{tarihMsg}</span>}
                </div>
            )}

            {/* Seans Verdim butonu */}
            {isActive && (
                seansVerildi ? (
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-black bg-gray-50 px-3 py-2 rounded-xl cursor-not-allowed">
                        <CheckSquare size={13} /> Seans Verildi — Hasta onayı bekleniyor
                    </div>
                ) : (
                    <button
                        onClick={handleSeansVer}
                        disabled={seansLoading}
                        className="flex items-center gap-2 bg-[#0f4c35] hover:bg-[#0a3325] text-white text-xs font-black px-4 py-2.5 rounded-xl uppercase tracking-widest transition-all disabled:opacity-50 w-full justify-center"
                    >
                        {seansLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckSquare size={13} />}
                        Seans Verdim
                    </button>
                )
            )}

            {/* Tamamlanmış seans — her iki onay */}
            {isDone && (
                <div className="grid grid-cols-2 gap-2 text-[10px] font-black">
                    <div className="flex items-center gap-1 text-[#16a34a]"><CheckCircle size={11} /> Uzman onayladı</div>
                    <div className="flex items-center gap-1 text-[#16a34a]"><CheckCircle size={11} /> Hasta onayladı</div>
                </div>
            )}
        </div>
    );
}

// ─── Aktif eşleşme kartı ──────────────────────────────────────────────────────

function EslesmeKarti({ plan }) {
    const [expanded, setExpanded] = useState(false);
    const [seanslar, setSeanslar] = useState([]);
    const [seansLoading, setSeansLoading] = useState(false);

    const tamamlananYuzde = plan.toplam_seans > 0
        ? Math.round((plan.tamamlanan_seans / plan.toplam_seans) * 100)
        : 0;

    const fetchSeanslar = async () => {
        setSeansLoading(true);
        try {
            const res = await getEslesmeSeanslari(plan.id);
            setSeanslar(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setSeansLoading(false);
        }
    };

    const handleToggle = () => {
        if (!expanded && seanslar.length === 0) fetchSeanslar();
        setExpanded(v => !v);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] border border-[#bbf7d0] overflow-hidden shadow-sm"
        >
            {/* Kart başlık */}
            <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[#f0fdf4]/60 transition-colors"
                onClick={handleToggle}
            >
                <div className="w-12 h-12 rounded-2xl bg-[#dcfce7] flex items-center justify-center flex-shrink-0">
                    <User size={22} className="text-[#16a34a]" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-base font-black text-[#0a2e1a] truncate">
                        {plan.hasta_ad} {plan.hasta_soyad}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs font-bold text-gray-500 capitalize">{plan.tedavi_turu}</span>
                        <span className="text-[10px] font-black text-[#16a34a] bg-[#dcfce7] px-2 py-0.5 rounded-full">
                            {plan.tamamlanan_seans}/{plan.toplam_seans} seans
                        </span>
                        {plan.hasta_telefon && (
                            <a href={`tel:${plan.hasta_telefon}`} onClick={e => e.stopPropagation()}
                               className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors">
                                <Phone size={9} /> {plan.hasta_telefon}
                            </a>
                        )}
                    </div>
                    {/* İlerleme çubuğu */}
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#4ade80] rounded-full transition-all duration-500"
                            style={{ width: `${tamamlananYuzde}%` }}
                        />
                    </div>
                </div>
                <ChevronDown
                    size={18}
                    className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                />
            </div>

            {/* Seanslar */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden border-t border-[#dcfce7]"
                    >
                        <div className="p-5 space-y-3 bg-[#f8fffe]">
                            {seansLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="animate-spin text-[#16a34a]" size={24} />
                                </div>
                            ) : seanslar.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">Henüz seans kaydı yok.</p>
                            ) : (
                                seanslar.map(s => (
                                    <SeansKarti key={s.id} seans={s} onRefresh={fetchSeanslar} />
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Ana sayfa bileşeni ────────────────────────────────────────────────────────

export default function UzmanRandevular() {
    const [randevular, setRandevular] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtre, setFiltre] = useState('hepsi');
    const [tedaviPlanlari, setTedaviPlanlari] = useState([]);
    const [planlarLoading, setPlanlarLoading] = useState(true);
    const [eslesmeler, setEslesmeler] = useState([]);
    const [eslesmelerLoading, setEslesmelerLoading] = useState(true);

    useEffect(() => {
        fetchRandevular();
        fetchTedaviPlanlari();
        fetchEslesmeler();
    }, []);

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

    const fetchTedaviPlanlari = async () => {
        setPlanlarLoading(true);
        try {
            const res = await getUzmanTedaviPlanlari();
            setTedaviPlanlari(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setPlanlarLoading(false);
        }
    };

    const fetchEslesmeler = async () => {
        setEslesmelerLoading(true);
        try {
            const res = await getUzmanEslesmeler();
            setEslesmeler(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setEslesmelerLoading(false);
        }
    };

    const filtered = filtre === 'hepsi'
        ? randevular
        : randevular.filter(r => r.durum === filtre);

    const bekleyenSayisi = randevular.filter(r => r.durum === 'beklemede').length;
    const onGorusmeSayisi = randevular.filter(r => r.randevu_tipi === 'on_gorusme' && r.durum === 'onaylandi' && !r.kesin_tarih).length;

    return (
        <div className="bg-[#f0fdf4] min-h-screen py-12 px-4 md:px-8">
            <div className="max-w-3xl mx-auto space-y-8 pb-20">
                {/* Header */}
                <div>
                    <span className="inline-block text-[#16a34a] text-xs font-bold uppercase tracking-widest bg-[#dcfce7] px-4 py-2 rounded-full mb-3">
                        Randevu Yönetimi
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-[#0a2e1a] leading-tight">
                        Randevularım
                    </h1>
                    <p className="text-gray-500 font-medium mt-3 text-sm max-w-md">
                        Hastalarınızdan gelen randevu taleplerini inceleyin ve yönetin.
                    </p>
                </div>

                {/* Bekleyen uyarısı */}
                <AnimatePresence>
                    {bekleyenSayisi > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-amber-50 border border-amber-200/50 rounded-3xl p-5 flex items-center gap-4 shadow-sm"
                        >
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <AlertCircle className="text-amber-500" size={20} />
                            </div>
                            <p className="text-sm font-bold text-amber-800 leading-snug">
                                <span className="text-amber-600">{bekleyenSayisi} yeni randevu talebi var.</span> Lütfen tarih ve saat belirleyerek işlemi tamamlayın.
                            </p>
                        </motion.div>
                    )}
                    {onGorusmeSayisi > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#dcfce7] border border-[#4ade80]/30 rounded-3xl p-5 flex items-center gap-4 shadow-sm"
                        >
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                                <Video className="text-[#16a34a]" size={20} />
                            </div>
                            <p className="text-sm font-bold text-[#0f4c35] leading-snug">
                                <span className="text-[#16a34a]">{onGorusmeSayisi} onaylı ön görüşme</span> için kesin tarih ve saat belirlemeniz gerekiyor.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filtreler */}
                <div className="flex flex-wrap gap-3">
                    {FILTRELER.map(f => {
                        const count = f.key === 'hepsi'
                            ? randevular.length
                            : randevular.filter(r => r.durum === f.key).length;
                        return (
                            <button
                                key={f.key}
                                onClick={() => setFiltre(f.key)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all duration-300 ${
                                    filtre === f.key
                                        ? 'bg-[#0f4c35] text-white border-[#0f4c35] shadow-lg shadow-green-900/20'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-[#4ade80] hover:text-[#16a34a]'
                                }`}
                            >
                                {f.label}
                                {count > 0 && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
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
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-28 bg-white rounded-[2rem] animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-[3rem] border border-gray-100 p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="text-gray-300" size={32} />
                        </div>
                        <p className="font-black text-[#0a2e1a] text-lg mb-1">
                            {filtre === 'hepsi' ? 'Henüz randevu talebiniz yok' : 'Sonuç bulunamadı'}
                        </p>
                        <p className="text-sm font-medium text-gray-500">
                            {filtre === 'hepsi' ? 'Yeni talepler geldiğinde burada listelenecektir.' : 'Bu filtreye uygun bir randevunuz bulunmuyor.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filtered.map(r => (
                                <RandevuCard key={r.id} randevu={r} onRefresh={fetchRandevular} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Aktif Hastalarım — eşleşmeler ve seans takibi */}
                <div className="pt-6 border-t border-[#bbf7d0]">
                    <div className="mb-4">
                        <span className="inline-block text-[#16a34a] text-xs font-bold uppercase tracking-widest bg-[#dcfce7] px-4 py-2 rounded-full mb-2">
                            Aktif Hastalarım
                        </span>
                        <h2 className="text-xl font-black text-[#0a2e1a]">Seans Takibi</h2>
                        <p className="text-gray-500 text-sm mt-1">Ödeme tamamlanan hastalarınız ve seans planlaması.</p>
                    </div>

                    {eslesmelerLoading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="h-24 bg-white rounded-[2rem] animate-pulse border border-gray-100" />
                            ))}
                        </div>
                    ) : eslesmeler.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-10 text-center">
                            <User className="mx-auto mb-3 text-gray-200" size={32} />
                            <p className="font-black text-gray-400 text-sm">Henüz aktif hasta eşleşmesi yok</p>
                            <p className="text-xs text-gray-300 mt-1">Tedavi planı ödeme onaylandıktan sonra burada görünür.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {eslesmeler.map(plan => (
                                <EslesmeKarti key={plan.id} plan={plan} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Tedavi Planları */}
                <div className="pt-6 border-t border-gray-100">
                    <div className="mb-4">
                        <span className="inline-block text-[#16a34a] text-xs font-bold uppercase tracking-widest bg-[#dcfce7] px-4 py-2 rounded-full mb-2">
                            Tedavi Planları
                        </span>
                        <h2 className="text-xl font-black text-[#0a2e1a]">Ödeme Takibi</h2>
                        <p className="text-gray-500 text-sm mt-1">Hastalarınıza gönderdiğiniz tedavi planları ve ödeme durumları.</p>
                    </div>

                    {planlarLoading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="h-40 bg-white rounded-[2rem] animate-pulse border border-gray-100" />
                            ))}
                        </div>
                    ) : tedaviPlanlari.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-10 text-center">
                            <ClipboardList className="mx-auto mb-3 text-gray-200" size={32} />
                            <p className="font-black text-gray-400 text-sm">Henüz tedavi planı oluşturulmadı</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tedaviPlanlari.map(plan => (
                                <TedaviPlaniKarti key={plan.id} plan={plan} onRefresh={fetchTedaviPlanlari} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}