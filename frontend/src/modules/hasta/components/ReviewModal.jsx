import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Star, Send, Activity, AlertCircle } from 'lucide-react';
import StarRating from '../../../shared/components/ui/StarRating';
import Button from '../../../shared/components/ui/Button';
import { createReview, updateReview } from '../services/uzmanService';

export default function ReviewModal({ isOpen, onClose, uzmanId, existingReview, onSuccess }) {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!uzmanId) {
            setError('Uzman bilgisi yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.');
            return;
        }

        if (rating === 0) {
            setError('Lütfen bir puan seçerek deneyiminizi değerlendirin.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            if (existingReview) {
                await updateReview(existingReview.id, { rating, comment });
            } else {
                await createReview({ uzmanId, rating, comment });
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Değerlendirme gönderilirken bir teknik hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
                {/* Backdrop (Cam Efekti) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] max-w-md w-full relative z-10 overflow-hidden border border-slate-100"
                >
                    {/* Header: Bento Stilinde */}
                    <div className="p-8 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight italic">
                                    {existingReview ? 'Yorumu Düzenle' : 'Deneyiminizi Paylaşın'}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Geri Bildirim Formu</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-8">
                        {/* Rating Area */}
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">
                                Uzman Puanı
                            </label>
                            <div className="flex justify-center transform transition-transform active:scale-95">
                                <StarRating
                                    rating={rating}
                                    size={40}
                                    interactive={true}
                                    onChange={setRating}
                                />
                            </div>
                            {rating > 0 && (
                                <p className="text-blue-600 font-black text-xs mt-4 uppercase tracking-tighter animate-pulse">
                                    {rating === 5 ? 'Mükemmel!' : rating >= 4 ? 'Çok İyi' : 'Teşekkürler'}
                                </p>
                            )}
                        </div>

                        {/* Comment Area */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                    Düşünceleriniz (Opsiyonel)
                                </label>
                                <span className={`text-[10px] font-black uppercase ${comment.length > 450 ? 'text-red-500' : 'text-slate-300'}`}>
                                    {comment.length}/500
                                </span>
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                maxLength={500}
                                rows={4}
                                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-blue-600 focus:bg-white transition-all font-medium text-slate-700 placeholder:text-slate-400 text-sm leading-relaxed scrollbar-none"
                                placeholder="Tedavi süreci nasıldı? Diğer hastalara önerir misiniz?"
                            />
                        </div>

                        {/* Error Notification */}
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700"
                                >
                                    <AlertCircle size={18} className="shrink-0" />
                                    <p className="text-xs font-bold leading-tight">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="flex gap-4 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                İptal Et
                            </button>
                            <Button
                                type="submit"
                                disabled={loading || rating === 0}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 group"
                            >
                                {loading ? 'Gönderiliyor...' : (
                                    <>
                                        Yorumu Gönder
                                        <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Dekoratif Alt Şerit */}
                    <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}