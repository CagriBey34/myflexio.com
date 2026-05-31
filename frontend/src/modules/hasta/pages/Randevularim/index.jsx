import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, CheckCircle, XCircle,
    AlertCircle, ChevronDown, Stethoscope,
    RefreshCw, Video, ClipboardList, MessageCircle,
    Monitor, Home, CreditCard, AlertTriangle
} from 'lucide-react';
import { getHastaRandevular, hastaKarar } from '../../services/randevuService';
import { getHastaTedaviPlani, uploadDekont, hastaSeansAl, getHastaSeanslari, hastaSeansOnay } from '../../services/hastaService';

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

const PLAN_DURUM_CONFIG = {
    beklemede_odeme:  { label: 'Ödeme Bekleniyor', color: 'bg-amber-100 text-amber-700' },
    dekont_yuklendi:  { label: 'Dekont Yüklendi',  color: 'bg-blue-100 text-blue-700'  },
    aktif:            { label: 'Aktif',             color: 'bg-green-100 text-green-700' },
};

function TedaviPlanCard({ plan, onRefresh }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const isOnline = plan.tedavi_turu === 'online';
    const durum = PLAN_DURUM_CONFIG[plan.durum] || PLAN_DURUM_CONFIG.beklemede_odeme;

    const handleFileChange = (e) => {
        setUploadError('');
        setSelectedFile(e.target.files[0] || null);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setUploadError('');
        try {
            await uploadDekont(plan.id, selectedFile);
            onRefresh();
        } catch {
            setUploadError('Yükleme başarısız. Lütfen tekrar deneyin.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[1.75rem] border-2 border-green-200 overflow-hidden shadow-sm"
        >
            {/* Header */}
            <div className="bg-green-50 border-b border-green-100 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ClipboardList size={14} className="text-green-600 flex-shrink-0" />
                    <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Tedavi Planı</p>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${durum.color}`}>
                    {durum.label}
                </span>
            </div>

            <div className="p-5 space-y-4">
                {/* Uzman */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Stethoscope size={18} className="text-green-600" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Uzman</div>
                        <div className="font-black text-slate-900 text-sm">
                            {plan.uzman_unvan} {plan.uzman_ad} {plan.uzman_soyad}
                        </div>
                    </div>
                </div>

                {/* Detaylar grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-2.5">
                        {isOnline
                            ? <Monitor size={16} className="text-blue-500 flex-shrink-0" />
                            : <Home size={16} className="text-orange-500 flex-shrink-0" />
                        }
                        <div>
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Tedavi Türü</div>
                            <div className="text-xs font-black text-slate-900">{isOnline ? 'Online' : 'Evde Tedavi'}</div>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-2.5">
                        <Calendar size={16} className="text-purple-500 flex-shrink-0" />
                        <div>
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Seans Sayısı</div>
                            <div className="text-xs font-black text-slate-900">{plan.seans_sayisi} Seans</div>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-2.5">
                        <CreditCard size={16} className="text-green-500 flex-shrink-0" />
                        <div>
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Seans Ücreti</div>
                            <div className="text-xs font-black text-slate-900">{Number(plan.seans_ucreti).toLocaleString('tr-TR')} ₺</div>
                        </div>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-3 flex items-center gap-2.5 border border-green-100">
                        <CreditCard size={16} className="text-green-600 flex-shrink-0" />
                        <div>
                            <div className="text-[9px] font-black text-green-600 uppercase tracking-wider">Toplam Ücret</div>
                            <div className="text-sm font-black text-green-700">{Number(plan.toplam_ucret).toLocaleString('tr-TR')} ₺</div>
                        </div>
                    </div>
                </div>

                {/* Notlar */}
                {plan.notlar && (
                    <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100">
                        <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Uzman Notu</div>
                        <p className="text-xs text-amber-800 italic">&ldquo;{plan.notlar}&rdquo;</p>
                    </div>
                )}

                {/* Ödeme Bekleniyor: IBAN + dekont yükleme */}
                {(!plan.durum || plan.durum === 'beklemede_odeme') && (
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 space-y-3">
                        <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                            <CreditCard size={12} /> Ödeme Talimatı
                        </div>
                        <p className="text-xs text-amber-800">
                            Toplam <span className="font-black">{Number(plan.toplam_ucret).toLocaleString('tr-TR')} ₺</span> tutarını aşağıdaki IBAN&apos;a havale yapın, ardından dekontunuzu yükleyin.
                        </p>
                        {plan.sistem_iban ? (
                            <div className="bg-white rounded-xl px-4 py-3 border border-amber-200 space-y-1">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">IBAN</div>
                                        <div className="text-sm font-black text-slate-900 tracking-wider">{plan.sistem_iban}</div>
                                    </div>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(plan.sistem_iban)}
                                        className="text-[10px] font-black text-amber-600 hover:text-amber-800 whitespace-nowrap transition-colors"
                                    >
                                        Kopyala
                                    </button>
                                </div>
                                {(plan.iban_ad_soyad || plan.iban_banka_adi) && (
                                    <div className="text-[10px] text-gray-500 flex gap-3">
                                        {plan.iban_ad_soyad && <span><b>Ad:</b> {plan.iban_ad_soyad}</span>}
                                        {plan.iban_banka_adi && <span><b>Banka:</b> {plan.iban_banka_adi}</span>}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-amber-600 italic">Ödeme bilgileri henüz girilmemiş, lütfen bizimle iletişime geçin.</p>
                        )}

                        {/* Dekont yükleme */}
                        <div className="pt-1 space-y-2">
                            <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Dekont Yükle</div>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                            />
                            {uploadError && (
                                <p className="text-[10px] text-red-600 font-bold">{uploadError}</p>
                            )}
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-black py-3 rounded-2xl uppercase tracking-widest transition-colors"
                            >
                                {uploading
                                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <MessageCircle size={13} />
                                }
                                {uploading ? 'Yükleniyor...' : 'Dekontu Gönder'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Dekont yüklendi */}
                {plan.durum === 'dekont_yuklendi' && (
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 flex items-start gap-3">
                        <CheckCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Dekont İletildi</div>
                            <p className="text-xs text-blue-700">Ödeme dekontu uzmanınıza iletildi. Onay bekleniyor.</p>
                        </div>
                    </div>
                )}

                {/* Aktif */}
                {plan.durum === 'aktif' && (
                    <div className="bg-green-50 rounded-2xl p-4 border border-green-200 flex items-start gap-3">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Tedavi Planı Aktif</div>
                            <p className="text-xs text-green-700">Ödemeniz onaylandı. Tedavi planınız başlamıştır.</p>
                        </div>
                    </div>
                )}

                <p className="text-[9px] text-gray-400 text-right font-semibold">
                    {new Date(plan.created_at).toLocaleDateString('tr-TR')}
                </p>
            </div>
        </motion.div>
    );
}

function SeansAlimOnayModal({ onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2rem] shadow-2xl p-6 max-w-sm w-full space-y-4"
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={22} className="text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 text-base">Seans Onayı</h3>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Bu işlem geri alınamaz</p>
                    </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                    Bu randevuya ait seansı aldığınızı onaylıyorsunuz. Bu seçim <span className="font-black text-red-600">geri alınamaz</span> ve seans tamamlanmış sayılacaktır.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onConfirm}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-black py-3 rounded-2xl uppercase tracking-widest transition-colors"
                    >
                        Onaylıyorum
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black py-3 rounded-2xl uppercase tracking-widest transition-colors"
                    >
                        Vazgeç
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function RandevuCard({ randevu, onUpdate }) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSeansOnay, setShowSeansOnay] = useState(false);
    const [seansLoading, setSeansLoading] = useState(false);

    const durum = DURUM_CONFIG[randevu.durum] || DURUM_CONFIG.beklemede;
    const tur = TUR_CONFIG[randevu.talep_turu] || {};
    const isOnGorusme = randevu.randevu_tipi === 'on_gorusme';
    const tarih = randevu.talep_tarihi ? new Date(randevu.talep_tarihi) : null;
    const kesinTarih = randevu.kesin_tarih ? new Date(randevu.kesin_tarih) : null;

    // Uzman alternatif tarih önermiş mi?
    const hasAlternatif = randevu.durum === 'reddedildi' && randevu.alternatif_tarih;
    const alternatifTarih = hasAlternatif ? new Date(randevu.alternatif_tarih) : null;

    // Seans aldım butonu: onaylı randevularda ve henüz onaylanmamışsa göster
    const showSeansAl = randevu.durum === 'onaylandi' && !randevu.hasta_seans_onayladi;
    const seansAlindi = !!randevu.hasta_seans_onayladi;

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

    const handleSeansAl = async () => {
        setSeansLoading(true);
        setShowSeansOnay(false);
        try {
            await hastaSeansAl(randevu.id);
            onUpdate();
        } catch (e) {
            alert('Bir hata oluştu, lütfen tekrar deneyin.');
        } finally {
            setSeansLoading(false);
        }
    };

    return (
        <>
        {showSeansOnay && (
            <SeansAlimOnayModal
                onConfirm={handleSeansAl}
                onCancel={() => setShowSeansOnay(false)}
            />
        )}
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

                            {/* Seans Aldım butonu */}
                            {showSeansAl && (
                                <button
                                    onClick={() => setShowSeansOnay(true)}
                                    disabled={seansLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-black py-3 rounded-2xl uppercase tracking-widest transition-colors"
                                >
                                    {seansLoading
                                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        : <CheckCircle size={14} />
                                    }
                                    Seans Aldım
                                </button>
                            )}

                            {/* Seans alındı (gri / pasif) */}
                            {seansAlindi && (
                                <div className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 text-xs font-black py-3 rounded-2xl uppercase tracking-widest opacity-60 cursor-not-allowed select-none">
                                    <CheckCircle size={14} />
                                    Seans Alındı — Onaylandı
                                </div>
                            )}

                            {/* Oluşturuldu */}
                            <p className="text-[10px] text-gray-400 text-right font-semibold">
                                Oluşturuldu: {new Date(randevu.created_at).toLocaleDateString('tr-TR')}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
        </>
    );
}

function HastaSeansKarti({ seans, onRefresh }) {
    const [showOnay, setShowOnay] = useState(false);
    const [loading, setLoading] = useState(false);

    const isDone     = seans.durum === 'tamamlandi';
    const isLocked   = seans.durum === 'bekliyor';
    const isActive   = seans.durum === 'aktif';
    const hastaOnay  = !!seans.hasta_seans_onayladi;
    const uzmanOnay  = !!seans.uzman_seans_onayladi;

    const handleOnay = async () => {
        setLoading(true);
        setShowOnay(false);
        try {
            await hastaSeansOnay(seans.id);
            onRefresh?.();
        } catch {
            alert('Hata oluştu, lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {showOnay && (
                <SeansAlimOnayModal onConfirm={handleOnay} onCancel={() => setShowOnay(false)} />
            )}
            <div className={`rounded-2xl border p-4 space-y-3 transition-all ${
                isDone   ? 'bg-green-50 border-green-200' :
                isLocked ? 'bg-gray-50 border-gray-100 opacity-55' :
                           'bg-white border-green-300 shadow-sm'
            }`}>
                {/* Başlık satırı */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                        Seans {seans.seans_no}
                    </span>
                    {isDone   && <span className="text-[10px] font-black text-green-700 bg-green-100 px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10} /> Tamamlandı</span>}
                    {isLocked && <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full uppercase tracking-widest">Kilitli</span>}
                    {isActive && !hastaOnay && <span className="text-[10px] font-black text-green-700 bg-green-100 px-2.5 py-1 rounded-full uppercase tracking-widest">Aktif</span>}
                    {isActive && hastaOnay  && <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-widest">Uzman Onayı Bekleniyor</span>}
                </div>

                {/* Tarih */}
                {seans.tarih && (
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Calendar size={13} className="text-green-600" />
                        {new Date(seans.tarih).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        <span className="text-gray-300">·</span>
                        {new Date(seans.tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
                {isActive && !seans.tarih && (
                    <p className="text-xs text-amber-600 font-bold">Uzman henüz tarih belirlemedi.</p>
                )}

                {/* Tamamlanmış onay durumu */}
                {isDone && (
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-black">
                        <div className="flex items-center gap-1 text-green-600"><CheckCircle size={11} /> Uzman onayladı</div>
                        <div className="flex items-center gap-1 text-green-600"><CheckCircle size={11} /> Siz onayladınız</div>
                    </div>
                )}

                {/* Uzman onayladı ama hasta onaylamadı */}
                {isActive && uzmanOnay && !hastaOnay && (
                    <p className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl">
                        Uzman seansı onayladı — sizin onayınız bekleniyor
                    </p>
                )}

                {/* Seans Aldım butonu */}
                {isActive && !hastaOnay && (
                    <button
                        onClick={() => setShowOnay(true)}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-black py-3 rounded-2xl uppercase tracking-widest transition-colors disabled:opacity-50"
                    >
                        {loading
                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <CheckCircle size={14} />
                        }
                        Seans Aldım
                    </button>
                )}

                {/* Hasta zaten onayladı ama seans henüz tamamlanmadı */}
                {isActive && hastaOnay && (
                    <div className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 text-xs font-black py-3 rounded-2xl uppercase tracking-widest cursor-not-allowed">
                        <CheckCircle size={14} /> Seans Alındı — Onaylandı
                    </div>
                )}
            </div>
        </>
    );
}

export default function Randevularim() {
    const [randevular, setRandevular] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtre, setFiltre] = useState('hepsi');
    const [tedaviPlanlari, setTedaviPlanlari] = useState([]);
    const [seanslar, setSeanslar] = useState([]);
    const [seanslarLoading, setSeanslarLoading] = useState(true);

    useEffect(() => {
        fetchRandevular();
        fetchTedaviPlanlari();
        fetchSeanslar();
    }, []);

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

    const fetchTedaviPlanlari = async () => {
        try {
            const res = await getHastaTedaviPlani();
            setTedaviPlanlari(res.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchSeanslar = async () => {
        setSeanslarLoading(true);
        try {
            const res = await getHastaSeanslari();
            setSeanslar(res.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setSeanslarLoading(false);
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

            {/* Seanslarım */}
            {(seanslarLoading || seanslar.length > 0) && (
                <div className="space-y-3">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle size={13} /> Seanslarım
                    </h2>
                    {seanslarLoading ? (
                        <div className="space-y-2">
                            {[1, 2].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {seanslar.map(s => (
                                <HastaSeansKarti key={s.id} seans={s} onRefresh={fetchSeanslar} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tedavi Planları */}
            {tedaviPlanlari.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ClipboardList size={13} /> Tedavi Planlarım
                    </h2>
                    {tedaviPlanlari.map(plan => (
                        <TedaviPlanCard key={plan.id} plan={plan} onRefresh={fetchTedaviPlanlari} />
                    ))}
                </div>
            )}

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
