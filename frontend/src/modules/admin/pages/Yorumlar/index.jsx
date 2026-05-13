import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash2, ChevronDown, MessageSquare, ShieldAlert } from 'lucide-react';
import { getYorumlar, deleteYorum } from '../../services/adminService';

export default function AdminYorumlar() {
    const [yorumlar, setYorumlar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => { fetchYorumlar(); }, [page]);

    const fetchYorumlar = async () => {
        setLoading(true);
        try {
            const res = await getYorumlar({ page, limit: 20 });
            setYorumlar(res.data.yorumlar);
            setTotal(res.data.total);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;
        try {
            await deleteYorum(id);
            fetchYorumlar();
        } catch (e) {
            alert('Hata oluştu');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <MessageSquare className="text-blue-600" size={32} />
                    Yorum Yönetimi
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Toplam {total} yorum
                </p>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-20 bg-white rounded-2xl
                            animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {yorumlar.map(yorum => (
                        <motion.div
                            key={yorum.id}
                            layout
                            className="bg-white rounded-2xl border border-gray-100
                                shadow-sm overflow-hidden"
                        >
                            <div
                                className="flex items-center gap-4 p-5 cursor-pointer
                                    hover:bg-gray-50 transition-colors"
                                onClick={() => setExpanded(
                                    expanded === yorum.id ? null : yorum.id
                                )}
                            >
                                {/* Rating */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {[1,2,3,4,5].map(s => (
                                        <Star key={s} size={14}
                                            className={s <= yorum.rating
                                                ? 'text-amber-400 fill-amber-400'
                                                : 'text-gray-200 fill-gray-200'}
                                        />
                                    ))}
                                </div>

                                {/* Kişiler */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-900 truncate">
                                        {yorum.anonim ? 'Anonim Hasta' : `${yorum.hasta_ad} ${yorum.hasta_soyad}`}
                                        <span className="text-gray-400 font-normal mx-2">→</span>
                                        {yorum.unvan} {yorum.uzman_ad} {yorum.uzman_soyad}
                                    </div>
                                    {yorum.yorum && (
                                        <p className="text-xs text-gray-400 truncate mt-0.5">
                                            {yorum.yorum}
                                        </p>
                                    )}
                                </div>

                                {/* Tarih + aksiyonlar */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs text-gray-400">
                                        {new Date(yorum.created_at)
                                            .toLocaleDateString('tr-TR')}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(yorum.id);
                                        }}
                                        className="p-1.5 text-red-400 hover:bg-red-50
                                            rounded-lg transition-colors"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                    <ChevronDown size={15}
                                        className={`text-gray-400 transition-transform
                                            ${expanded === yorum.id ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {expanded === yorum.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden border-t border-gray-100"
                                    >
                                        <div className="p-5 bg-gray-50 space-y-3">
                                            {yorum.yorum && (
                                                <div className="bg-white rounded-xl p-4
                                                    border border-gray-100">
                                                    <p className="text-sm text-gray-700 italic">
                                                        "{yorum.yorum}"
                                                    </p>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {[
                                                    { label: 'Profesyonellik', val: yorum.profesyonellik_puan },
                                                    { label: 'İletişim', val: yorum.iletisim_puan },
                                                    { label: 'Tedavi', val: yorum.tedavi_etkinligi_puan },
                                                    { label: 'Zamanında', val: yorum.zamaninda_gelme_puan },
                                                ].map(({ label, val }) => val && (
                                                    <div key={label}
                                                        className="bg-white rounded-xl p-3
                                                            border border-gray-100 text-center">
                                                        <div className="text-xs text-gray-400 mb-1">
                                                            {label}
                                                        </div>
                                                        <div className="font-black text-gray-900">
                                                            {val}/5
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {total > 20 && (
                <div className="flex justify-center gap-2">
                    <button disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-xl border border-gray-200
                            text-sm font-bold disabled:opacity-40">
                        Önceki
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-500">
                        {page} / {Math.ceil(total / 20)}
                    </span>
                    <button disabled={page >= Math.ceil(total / 20)}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-xl border border-gray-200
                            text-sm font-bold disabled:opacity-40">
                        Sonraki
                    </button>
                </div>
            )}
        </div>
    );
}