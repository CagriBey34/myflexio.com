import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, CheckCircle, XCircle,
    Phone, Mail, ChevronDown, User, Stethoscope, Video,
    FileText, ExternalLink, PlayCircle, ClipboardList, Loader2,
    CreditCard, Save, Edit3, Activity, Users
} from 'lucide-react';
import { getRandevular, updateRandevuDurum, getTedaviPlanlari, aktiveTedaviPlaniAdmin, getSistemIban, setSistemIban, getAktifEslesmeler, getAdminEslesmeSeanslari } from '../../services/adminService';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');

function SistemIbanSection() {
    const [iban, setIban] = useState({ sistem_iban: '', iban_ad_soyad: '', iban_banka_adi: '' });
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        getSistemIban().then(r => {
            if (r.data) setIban({ sistem_iban: r.data.sistem_iban || '', iban_ad_soyad: r.data.iban_ad_soyad || '', iban_banka_adi: r.data.iban_banka_adi || '' });
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMsg('');
        try {
            await setSistemIban(iban);
            setMsg('Sistem IBAN kaydedildi.');
            setEditing(false);
        } catch {
            setMsg('Kaydetme başarısız.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CreditCard className="text-blue-600" size={20} />
                    <div>
                        <h2 className="text-sm font-black text-gray-900">Sistem IBAN</h2>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Hastalar bu IBAN&apos;a ödeme yapacak</p>
                    </div>
                </div>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors"
                    >
                        <Edit3 size={12} /> Düzenle
                    </button>
                )}
            </div>

            {editing ? (
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">IBAN Numarası</label>
                        <input
                            type="text"
                            value={iban.sistem_iban}
                            onChange={e => setIban(p => ({ ...p, sistem_iban: e.target.value.toUpperCase() }))}
                            placeholder="TR00 0000 0000 0000 0000 0000 00"
                            className="w-full text-sm font-bold border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 tracking-wider"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Ad Soyad</label>
                            <input
                                type="text"
                                value={iban.iban_ad_soyad}
                                onChange={e => setIban(p => ({ ...p, iban_ad_soyad: e.target.value }))}
                                placeholder="Hesap sahibi adı"
                                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Banka Adı</label>
                            <input
                                type="text"
                                value={iban.iban_banka_adi}
                                onChange={e => setIban(p => ({ ...p, iban_banka_adi: e.target.value }))}
                                placeholder="Örn: Ziraat Bankası"
                                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-widest transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                            Kaydet
                        </button>
                        <button onClick={() => setEditing(false)} className="text-xs font-black text-gray-500 hover:text-gray-700 px-4 py-2.5 uppercase tracking-widest">
                            İptal
                        </button>
                    </div>
                    {msg && <p className={`text-xs font-bold ${msg.includes('başarısız') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}
                </div>
            ) : (
                <div className="space-y-2">
                    {iban.sistem_iban ? (
                        <>
                            <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">IBAN</div>
                                    <div className="text-sm font-black text-slate-900 tracking-wider">{iban.sistem_iban}</div>
                                </div>
                                <button
                                    onClick={() => navigator.clipboard.writeText(iban.sistem_iban)}
                                    className="text-[10px] font-black text-blue-600 hover:text-blue-800 whitespace-nowrap"
                                >
                                    Kopyala
                                </button>
                            </div>
                            {(iban.iban_ad_soyad || iban.iban_banka_adi) && (
                                <div className="text-xs text-gray-500 flex gap-3 px-1">
                                    {iban.iban_ad_soyad && <span><span className="font-black">Ad:</span> {iban.iban_ad_soyad}</span>}
                                    {iban.iban_banka_adi && <span><span className="font-black">Banka:</span> {iban.iban_banka_adi}</span>}
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-xs text-amber-600 font-bold bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
                            Sistem IBAN henüz girilmemiş. Hastalar ödeme yapamaz.
                        </p>
                    )}
                    {msg && <p className="text-xs font-bold text-green-600">{msg}</p>}
                </div>
            )}
        </div>
    );
}

const PLAN_DURUM_CONFIG = {
    beklemede_odeme: { label: 'Ödeme Bekleniyor', color: 'bg-amber-100 text-amber-700' },
    dekont_yuklendi: { label: 'Dekont Yüklendi',  color: 'bg-blue-100 text-blue-700' },
    aktif:           { label: 'Aktif',             color: 'bg-green-100 text-green-700' },
};

function TedaviPlaniRow({ plan, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const durum = PLAN_DURUM_CONFIG[plan.durum] || PLAN_DURUM_CONFIG.beklemede_odeme;

    const handleAktifet = async () => {
        setLoading(true);
        try {
            await aktiveTedaviPlaniAdmin(plan.id);
            onRefresh?.();
        } catch (e) {
            alert(e.response?.data?.message || 'Hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Hasta & Uzman */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                            <User size={8} /> Hasta
                        </p>
                        <p className="font-bold text-gray-900 text-sm">{plan.hasta_ad} {plan.hasta_soyad}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                            <Stethoscope size={8} /> Uzman
                        </p>
                        <p className="font-bold text-gray-900 text-sm">{plan.uzman_unvan} {plan.uzman_ad} {plan.uzman_soyad}</p>
                    </div>
                </div>

                {/* Plan detay */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                        {plan.tedavi_turu} · {plan.seans_sayisi} seans
                    </span>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        ₺{Number(plan.toplam_ucret).toLocaleString('tr-TR')}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${durum.color}`}>
                        {durum.label}
                    </span>
                </div>
            </div>

            {/* Dekont + aktifleştir */}
            {(plan.dekont_url || plan.durum === 'dekont_yuklendi') && (
                <div className="mt-4 flex flex-wrap gap-3 items-center border-t border-gray-50 pt-4">
                    {plan.dekont_url && (
                        <a
                            href={`${API_BASE}${plan.dekont_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs font-black text-blue-600 bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-colors"
                        >
                            <FileText size={13} /> Dekontu Görüntüle
                            <ExternalLink size={11} />
                        </a>
                    )}
                    {plan.durum === 'dekont_yuklendi' && (
                        <button
                            onClick={handleAktifet}
                            disabled={loading}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-widest transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={13} className="animate-spin" /> : <PlayCircle size={13} />}
                            Planı Aktifleştir
                        </button>
                    )}
                </div>
            )}

            <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest mt-3 text-right">
                {new Date(plan.created_at).toLocaleDateString('tr-TR')}
            </p>
        </div>
    );
}

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
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Ücretsiz Ön Görüşme — Otomatik Onaylı</p>
                                        <p className="text-xs text-blue-700">Bu randevu hasta ile uzman arasında gerçekleşir. Admin onayı gerekmez; uzman kendi panelinden kesin tarihi belirleyecektir.</p>
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

                            {/* Aksiyon butonları — sadece beklemede ve ön görüşme değilse */}
                            {randevu.durum === 'beklemede' && !isOnGorusme && (
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

                            {/* Seans onay durumu (tamamlananlar için) */}
                            {randevu.durum === 'tamamlandi' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className={`rounded-xl p-3 border text-center ${randevu.uzman_seans_onayladi ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="text-[9px] font-black uppercase tracking-widest mb-1 text-gray-400">Uzman</div>
                                        {randevu.uzman_seans_onayladi
                                            ? <span className="text-xs font-black text-green-700 flex items-center justify-center gap-1"><CheckCircle size={12} /> Seans Verdi</span>
                                            : <span className="text-xs font-bold text-gray-400">Bekliyor</span>
                                        }
                                    </div>
                                    <div className={`rounded-xl p-3 border text-center ${randevu.hasta_seans_onayladi ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="text-[9px] font-black uppercase tracking-widest mb-1 text-gray-400">Hasta</div>
                                        {randevu.hasta_seans_onayladi
                                            ? <span className="text-xs font-black text-green-700 flex items-center justify-center gap-1"><CheckCircle size={12} /> Seans Aldı</span>
                                            : <span className="text-xs font-bold text-gray-400">Bekliyor</span>
                                        }
                                    </div>
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

// ─── Admin eşleşme kartı (seansları gösterir) ────────────────────────────────

function AdminEslesmeKarti({ plan }) {
    const [expanded, setExpanded] = useState(false);
    const [seanslar, setSeanslar] = useState([]);
    const [seansLoading, setSeansLoading] = useState(false);

    const tamamlananYuzde = plan.toplam_seans > 0
        ? Math.round((plan.tamamlanan_seans / plan.toplam_seans) * 100)
        : 0;

    const handleToggle = async () => {
        if (!expanded && seanslar.length === 0) {
            setSeansLoading(true);
            try {
                const res = await getAdminEslesmeSeanslari(plan.id);
                setSeanslar(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setSeansLoading(false);
            }
        }
        setExpanded(v => !v);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
            {/* Başlık */}
            <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50/60 transition-colors"
                onClick={handleToggle}
            >
                {/* Uzman */}
                <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                <User size={8} /> Hasta
                            </p>
                            <p className="text-sm font-black text-gray-900 truncate">{plan.hasta_ad} {plan.hasta_soyad}</p>
                            {plan.hasta_telefon && (
                                <a href={`tel:${plan.hasta_telefon}`} onClick={e => e.stopPropagation()}
                                   className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-0.5">
                                    <Phone size={9} /> {plan.hasta_telefon}
                                </a>
                            )}
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                                <Stethoscope size={8} /> Uzman
                            </p>
                            <p className="text-sm font-black text-gray-900 truncate">{plan.uzman_unvan} {plan.uzman_ad} {plan.uzman_soyad}</p>
                            <p className="text-[10px] text-gray-400 capitalize mt-0.5">{plan.tedavi_turu}</p>
                        </div>
                    </div>
                    {/* İlerleme */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-400 rounded-full transition-all duration-500"
                                style={{ width: `${tamamlananYuzde}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-black text-gray-500 whitespace-nowrap">
                            {plan.tamamlanan_seans}/{plan.toplam_seans} seans
                        </span>
                    </div>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                />
            </div>

            {/* Seans listesi */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden border-t border-gray-50"
                    >
                        <div className="p-5 space-y-2 bg-gray-50">
                            {seansLoading ? (
                                <div className="flex justify-center py-6">
                                    <Loader2 className="animate-spin text-gray-400" size={22} />
                                </div>
                            ) : seanslar.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-4">Seans kaydı yok.</p>
                            ) : (
                                seanslar.map(s => {
                                    const isDone   = s.durum === 'tamamlandi';
                                    const isLocked = s.durum === 'bekliyor';
                                    const isActive = s.durum === 'aktif';
                                    return (
                                        <div key={s.id} className={`rounded-xl p-3 border flex items-center gap-3 ${
                                            isDone   ? 'bg-green-50 border-green-200' :
                                            isLocked ? 'bg-white border-gray-100 opacity-60' :
                                                       'bg-white border-blue-200'
                                        }`}>
                                            <span className="text-xs font-black text-gray-500 w-16 flex-shrink-0">
                                                Seans {s.seans_no}
                                            </span>
                                            {s.tarih && (
                                                <span className="text-xs text-gray-600 flex items-center gap-1 flex-1 min-w-0 truncate">
                                                    <Calendar size={11} className="flex-shrink-0" />
                                                    {new Date(s.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                                    {' '}
                                                    {new Date(s.tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                            {!s.tarih && isActive && (
                                                <span className="text-[10px] text-amber-500 font-bold flex-1">Tarih bekleniyor</span>
                                            )}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${s.uzman_seans_onayladi ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                                    <Stethoscope size={9} />
                                                    {s.uzman_seans_onayladi ? 'Verdi' : 'Bekliyor'}
                                                </span>
                                                <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${s.hasta_seans_onayladi ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                                    <User size={9} />
                                                    {s.hasta_seans_onayladi ? 'Aldı' : 'Bekliyor'}
                                                </span>
                                                {isDone && <CheckCircle size={14} className="text-green-500" />}
                                                {isActive && !isDone && <Activity size={14} className="text-blue-500" />}
                                                {isLocked && <span className="text-[10px] text-gray-300 font-black">Kilitli</span>}
                                            </div>
                                        </div>
                                    );
                                })
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
    const [tedaviPlanlari, setTedaviPlanlari] = useState([]);
    const [planlarLoading, setPlanlarLoading] = useState(true);
    const [eslesmeler, setEslesmeler] = useState([]);
    const [eslesmelerLoading, setEslesmelerLoading] = useState(true);

    useEffect(() => { fetchRandevular(); }, [aktifDurum]);
    useEffect(() => { fetchTedaviPlanlari(); fetchEslesmeler(); }, []);

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

    const fetchTedaviPlanlari = async () => {
        setPlanlarLoading(true);
        try {
            const res = await getTedaviPlanlari();
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
            const res = await getAktifEslesmeler();
            setEslesmeler(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setEslesmelerLoading(false);
        }
    };

    const bekleyenSayisi = aktifDurum === 'beklemede' ? total : null;

    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6 pb-24 lg:pb-6">
            {/* Sistem IBAN Yönetimi */}
            <SistemIbanSection />

            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                        <Calendar className="text-blue-600 flex-shrink-0" size={26} />
                        Randevular
                    </h1>
                    <p className="text-gray-500 mt-1 text-xs sm:text-sm">
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
                <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 md:p-16 text-center">
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

            {/* Aktif Randevular — eşleşmeler ve seans takibi */}
            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <Users className="text-green-600" size={24} />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Aktif Randevular</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Ödemesi onaylanan hasta–uzman eşleşmeleri ve seans takibi</p>
                    </div>
                </div>

                {eslesmelerLoading ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : eslesmeler.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                        <Activity className="mx-auto mb-3 text-gray-200" size={36} />
                        <p className="font-bold text-gray-400 text-sm">Henüz aktif eşleşme yok</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {eslesmeler.map(plan => (
                            <AdminEslesmeKarti key={plan.id} plan={plan} />
                        ))}
                    </div>
                )}
            </div>

            {/* Tedavi Planları */}
            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <ClipboardList className="text-blue-600" size={24} />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Tedavi Planları</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Uzmanların oluşturduğu tedavi planları ve ödeme durumları</p>
                    </div>
                </div>

                {planlarLoading ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : tedaviPlanlari.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                        <ClipboardList className="mx-auto mb-3 text-gray-200" size={36} />
                        <p className="font-bold text-gray-400 text-sm">Henüz tedavi planı yok</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tedaviPlanlari.map(plan => (
                            <TedaviPlaniRow key={plan.id} plan={plan} onRefresh={fetchTedaviPlanlari} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
