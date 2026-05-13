import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, CheckCircle, AlertCircle, Loader,
    Video, MessageCircle, Map, Clock, Star,
    ChevronRight, Users
} from 'lucide-react';
import { createRandevu } from '../services/randevuService';

const FAYDALAR = [
    {
        icon: Users,
        baslik: 'Uzmanınızla Tanışın',
        aciklama: 'Tedavinizi yönetecek fizyoterapistinizle canlı görüntülü görüşerek uyumun var olup olmadığını hissedin.',
        vurgu: null,
    },
    {
        icon: Map,
        baslik: 'Süreci Anlayın',
        aciklama: 'Online fizyoterapinin sizin özel durumunuzda nasıl işleyeceğini, ekran başında hangi hareketleri nasıl yapacağınızı öğrenin.',
        vurgu: null,
    },
    {
        icon: MessageCircle,
        baslik: 'Kişisel Sorularınızı Sorun',
        aciklama: 'Formun ötesinde aklınıza takılan her şeyi — ağrı şiddeti, çalışma saatleri, ekipman gereksinimi — doğrudan uzmana danışın.',
        vurgu: null,
    },
    {
        icon: Star,
        baslik: 'Yol Haritanızı Netleştirin',
        aciklama: 'Bu kısa seans sonunda size özel "Hareket Çizelgesi"nin ana hatları hakkında fikir sahibi olun.',
        vurgu: null,
    },
];

export default function OnGorusmeModal({ isOpen, onClose, uzmanProfileId, uzmanAd }) {
    const [not, setNot] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleClose = () => {
        if (loading) return;
        setNot('');
        setError('');
        setSuccess(false);
        onClose();
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            await createRandevu({
                uzman_profile_id: uzmanProfileId,
                talep_turu: 'online',
                hasta_notu: not || null,
                randevu_tipi: 'on_gorusme',
            });
            setSuccess(true);
        } catch (e) {
            setError(e.response?.data?.message || 'Bir hata oluştu, lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 24 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">

                            {/* ── HEADER ── */}
                            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-8 pb-6 flex-shrink-0">
                                {/* Dekoratif daire */}
                                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                <div className="absolute bottom-0 left-12 w-24 h-24 bg-blue-400/10 rounded-full translate-y-1/2 pointer-events-none" />

                                <div className="relative z-10 flex items-start justify-between gap-4">
                                    <div>
                                        {/* Ücretsiz + Süre badge */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-blue-400/30">
                                                <Clock size={10} />
                                                <span className="text-blue-200 font-black">15 DAKİKA</span>
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-green-400/30">
                                                <CheckCircle size={10} />
                                                <span className="text-green-200 font-black">ÜCRETSİZ</span>
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-black text-white tracking-tight leading-tight mb-1">
                                            Ücretsiz Ön Görüşme
                                        </h2>
                                        <p className="text-slate-400 text-sm font-medium">
                                            {uzmanAd}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
                                    >
                                        <X size={18} className="text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* ── İÇERİK ── */}
                            <div className="flex-1 overflow-y-auto">
                                <AnimatePresence mode="wait">

                                    {/* Başarı ekranı */}
                                    {success ? (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-8 text-center"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', delay: 0.1 }}
                                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"
                                            >
                                                <CheckCircle className="text-green-600" size={40} />
                                            </motion.div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                                                Talebiniz Alındı!
                                            </h3>
                                            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                                                Ön görüşme talebiniz ekibimize iletildi. En kısa sürede sizinle iletişime geçeceğiz.
                                            </p>
                                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-left max-w-sm mx-auto">
                                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Sonraki Adım</p>
                                                <div className="flex items-start gap-3 text-sm text-slate-600">
                                                    <Video size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                                    <p>Ekibimiz uygun tarih ve saati belirleyerek telefon veya e-posta ile bilgilendirme yapacaktır.</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="p-6 md:p-8 space-y-6"
                                        >
                                            {/* Önemli not banner */}
                                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                                                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                                    <span className="font-black">Önemli Not:</span> Bu görüşme bir tanı koyma seansı değil, sizinle uzmanımız arasındaki güven köprüsünü kurma ve sürecin verimliliğini artırma seansıdır.
                                                </p>
                                            </div>

                                            {/* Bu görüşme size ne sağlar */}
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <ChevronRight size={14} className="text-blue-500" />
                                                    Bu Görüşme Size Ne Sağlar?
                                                </h3>
                                                <div className="space-y-3">
                                                    {FAYDALAR.map((fayda, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, x: -12 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.07 }}
                                                            className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors group"
                                                        >
                                                            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                                                                <fayda.icon size={16} className="text-blue-600 group-hover:text-white transition-colors" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-black text-slate-900 mb-0.5">{fayda.baslik}</p>
                                                                <p className="text-xs text-slate-500 leading-relaxed">{fayda.aciklama}</p>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Not alanı */}
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                                    Kısa Not <span className="font-normal normal-case text-slate-300">(opsiyonel)</span>
                                                </label>
                                                <textarea
                                                    value={not}
                                                    onChange={(e) => setNot(e.target.value)}
                                                    rows={2}
                                                    placeholder="Görüşmeden önce paylaşmak istediğiniz kısa bir bilgi veya soru..."
                                                    className="w-full text-sm border-2 border-slate-100 rounded-2xl p-4 resize-none focus:outline-none focus:border-blue-300 transition-colors"
                                                />
                                            </div>

                                            {/* Hata */}
                                            {error && (
                                                <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm font-semibold p-4 rounded-2xl border border-red-100">
                                                    <AlertCircle size={16} />
                                                    {error}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* ── FOOTER ── */}
                            <div className="p-6 pt-0 border-t border-slate-50 flex-shrink-0">
                                {success ? (
                                    <button
                                        onClick={handleClose}
                                        className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-colors"
                                    >
                                        Tamam
                                    </button>
                                ) : (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleClose}
                                            className="px-6 py-3.5 rounded-2xl border-2 border-slate-100 text-slate-500 font-black text-sm hover:bg-slate-50 transition-colors"
                                        >
                                            Vazgeç
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white font-black text-sm uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                                        >
                                            {loading ? (
                                                <><Loader size={16} className="animate-spin" /> Gönderiliyor...</>
                                            ) : (
                                                <><Video size={16} /> Ücretsiz Ön Görüşme Talep Et</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
