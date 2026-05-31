import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Check, X, ChevronDown, ShieldCheck, Clock, XCircle, ExternalLink, FileText } from 'lucide-react';
import { getUzmanApplications, updateApplicationStatus } from '../../services/adminService';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');

const getDiplomaUrl = (path) => `${API_BASE}${path}`;

const isPdf = (url) => url?.toLowerCase().endsWith('.pdf');

function DiplomaModal({ url, onClose }) {
    const fullUrl = getDiplomaUrl(url);
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-3xl max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <FileText size={18} className="text-blue-600" />
                        <span className="font-black text-slate-800 text-sm uppercase tracking-widest">
                            Diploma Belgesi
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all"
                        >
                            <ExternalLink size={12} /> Yeni Sekmede Aç
                        </a>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 transition-all"
                        >
                            <X size={15} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center min-h-[400px]">
                    {isPdf(url) ? (
                        <iframe
                            src={fullUrl}
                            className="w-full h-[70vh]"
                            title="Diploma Belgesi"
                        />
                    ) : (
                        <img
                            src={fullUrl}
                            alt="Diploma"
                            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

const STATUS_CONFIG = {
    pending_approval: { label: 'Bekliyor', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    active: { label: 'Onaylandı', color: 'bg-green-100 text-green-700 border-green-200' },
    rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-700 border-red-200' },
};

const FILTERS = [
    { key: 'pending_approval', label: 'Bekleyenler' },
    { key: 'active', label: 'Onaylananlar' },
    { key: 'rejected', label: 'Reddedilenler' },
];

function BasvuruRow({ app, onUpdate }) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [diplomaOpen, setDiplomaOpen] = useState(false);
    const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending_approval;

    const handleAction = async (newStatus) => {
        if (!confirm(`Bu başvuruyu ${newStatus === 'active' ? 'onaylamak' : 'reddetmek'} istediğinizden emin misiniz?`)) return;
        setLoading(true);
        try {
            await updateApplicationStatus(app.id, newStatus);
            onUpdate();
        } catch {
            alert('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm hover:border-blue-100 transition-all"
            >
                {/* Ana satır */}
                <div
                    className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(!expanded)}
                >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-base flex-shrink-0">
                        {app.ad?.[0]}{app.soyad?.[0]}
                    </div>

                    {/* Bilgiler */}
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 tracking-tight truncate">
                            {app.ad} {app.soyad}
                            {app.unvan && (
                                <span className="text-blue-600 font-bold text-xs ml-2 uppercase tracking-widest">
                                    {app.unvan}
                                </span>
                            )}
                        </p>
                        <p className="text-xs text-slate-400 font-semibold truncate">{app.email}</p>
                    </div>

                    {/* Mezuniyet */}
                    {app.mezuniyet_okul && (
                        <div className="hidden sm:block text-right flex-shrink-0">
                            <p className="text-xs font-bold text-slate-700 truncate max-w-[160px]">
                                {app.mezuniyet_okul}
                            </p>
                            <p className="text-[10px] text-slate-400">{app.mezuniyet_yili}</p>
                        </div>
                    )}

                    {/* Tarih */}
                    <div className="flex-shrink-0 text-right hidden md:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {new Date(app.created_at).toLocaleDateString('tr-TR')}
                        </p>
                    </div>

                    {/* Durum */}
                    <span className={`flex-shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full border ${status.color}`}>
                        {status.label}
                    </span>

                    <ChevronDown
                        size={15}
                        className={`text-slate-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                </div>

                {/* Detay paneli */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-slate-100"
                        >
                            <div className="p-5 bg-slate-50 flex flex-wrap items-center gap-3">

                                {/* Diploma butonu */}
                                {app.diploma_url && (
                                    <button
                                        onClick={() => setDiplomaOpen(true)}
                                        className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-600 text-xs font-black px-4 py-2.5 rounded-xl uppercase tracking-widest hover:border-blue-300 hover:text-blue-600 transition-all"
                                    >
                                        <Eye size={14} /> Diploma Görüntüle
                                    </button>
                                )}

                                {/* Onay/Red butonları sadece pending'de */}
                                {app.status === 'pending_approval' && (
                                    <>
                                        <button
                                            onClick={() => handleAction('active')}
                                            disabled={loading}
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-widest transition-colors disabled:opacity-50"
                                        >
                                            <Check size={14} />
                                            {loading ? 'İşleniyor...' : 'Onayla'}
                                        </button>
                                        <button
                                            onClick={() => handleAction('rejected')}
                                            disabled={loading}
                                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black px-5 py-2.5 rounded-xl uppercase tracking-widest transition-colors disabled:opacity-50"
                                        >
                                            <X size={14} /> Reddet
                                        </button>
                                    </>
                                )}

                                {/* Tarih mobilde */}
                                <span className="ml-auto text-xs text-slate-400 font-semibold md:hidden">
                                    {new Date(app.created_at).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Diploma önizleme modalı */}
            {diplomaOpen && app.diploma_url && (
                <DiplomaModal url={app.diploma_url} onClose={() => setDiplomaOpen(false)} />
            )}
        </>
    );
}

export default function UzmanBasvurular() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending_approval');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchApplications();
    }, [statusFilter, page]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await getUzmanApplications({ status: statusFilter, page, limit: 20 });
            setApplications(response.data.applications);
            setTotal(response.data.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const bekleyenSayisi = statusFilter === 'pending_approval' ? total : null;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
                        <ShieldCheck className="text-blue-600" size={36} />
                        Uzman Başvuruları
                    </h1>
                    <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        Başvuruları inceleyin ve onaylayın
                    </p>
                </div>
                {bekleyenSayisi > 0 && (
                    <div className="bg-amber-100 text-amber-700 font-black text-sm px-4 py-2 rounded-xl border border-amber-200 flex items-center gap-2">
                        <Clock size={16} />
                        {bekleyenSayisi} bekleyen
                    </div>
                )}
            </div>

            {/* Filtreler */}
            <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => { setStatusFilter(f.key); setPage(1); }}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${statusFilter === f.key ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Liste */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border-2 border-slate-100" />
                    ))}
                </div>
            ) : applications.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-slate-100 p-16 text-center">
                    <XCircle className="mx-auto mb-3 text-slate-200" size={48} />
                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
                        Başvuru bulunamadı
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {applications.map(app => (
                            <BasvuruRow key={app.id} app={app} onUpdate={fetchApplications} />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination */}
            {total > 20 && (
                <div className="flex justify-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-black text-slate-500 disabled:opacity-40 hover:border-slate-300 transition-all"
                    >
                        Önceki
                    </button>
                    <span className="px-4 py-2 text-sm font-bold text-slate-400">
                        {page} / {Math.ceil(total / 20)}
                    </span>
                    <button
                        disabled={page >= Math.ceil(total / 20)}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-black text-slate-500 disabled:opacity-40 hover:border-slate-300 transition-all"
                    >
                        Sonraki
                    </button>
                </div>
            )}
        </div>
    );
}
