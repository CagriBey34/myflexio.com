import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, ArrowLeft, Image as ImageIcon, Tag, Layout,
    Send, AlertCircle, X, CheckCircle, Video, Loader2
} from 'lucide-react';
import { createArticle, updateArticle, getUzmanArticleById } from '../../services/articleService';
import Button from '../../../../shared/components/ui/Button';
import RichTextEditor from '../../../../shared/components/ui/RichTextEditor';

const KATEGORILER = [
    'Egzersiz ve Rehabilitasyon', 'Ağrı Yönetimi', 'Spor Yaralanmaları',
    'Postür ve Ergonomi', 'Genel Sağlık', 'Diğer'
];

export default function ArticleEditor() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        baslik: '', ozet: '', icerik: '', kategori: '',
        etiketler: [], videoLink: ''
    });

    // Kapak resmi: dosya referansı + önizleme ayrı tutulur
    const [kapakDosya, setKapakDosya] = useState(null);
    const [kapakremiPreview, setKapakremiPreview] = useState(null);

    const [etiketInput, setEtiketInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingArticle, setLoadingArticle] = useState(isEdit);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Edit modunda mevcut makaleyi yükle
    useEffect(() => {
        if (!isEdit) return;
        const fetchArticle = async () => {
            try {
                const res = await getUzmanArticleById(id);
                const a = res.data;
                setFormData({
                    baslik:    a.baslik    || '',
                    ozet:      a.ozet      || '',
                    icerik:    a.icerik    || '',
                    kategori:  a.kategori  || '',
                    etiketler: Array.isArray(a.etiketler) ? a.etiketler : [],
                    videoLink: a.video_link || '',
                });
                if (a.kapak_resmi_url) {
                        setKapakremiPreview(a.kapak_resmi_url);
                }
            } catch (err) {
                setError('Makale yüklenemedi: ' + (err.response?.data?.message || err.message));
            } finally {
                setLoadingArticle(false);
            }
        };
        fetchArticle();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Dosyayı sakla (FormData için)
        setKapakDosya(file);
        // Önizleme
        const reader = new FileReader();
        reader.onloadend = () => setKapakremiPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setKapakDosya(null);
        setKapakremiPreview(null);
    };

    const addEtiket = () => {
        const trimmed = etiketInput.trim();
        if (trimmed && !formData.etiketler.includes(trimmed)) {
            setFormData(prev => ({ ...prev, etiketler: [...prev.etiketler, trimmed] }));
        }
        setEtiketInput('');
    };

    const removeEtiket = (tag) => {
        setFormData(prev => ({ ...prev, etiketler: prev.etiketler.filter(t => t !== tag) }));
    };

    const handleSubmit = async (e, status = 'taslak') => {
        e.preventDefault();
        if (!formData.baslik.trim()) {
            setError('Lütfen bir makale başlığı girin.');
            return;
        }
        if (!formData.icerik.trim() || formData.icerik === '<br>') {
            setError('Lütfen makale içeriğini yazın.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // Her zaman FormData kullan (dosya var/yok fark etmez)
            const data = new FormData();
            data.append('baslik', formData.baslik);
            data.append('ozet', formData.ozet);
            data.append('icerik', formData.icerik);
            data.append('kategori', formData.kategori);
            data.append('video_link', formData.videoLink);
            data.append('yayinlanmaDurumu', status);
            // Etiketleri JSON string olarak gönder
            data.append('etiketler', JSON.stringify(formData.etiketler));
            // Kapak resmi dosyası varsa ekle
            if (kapakDosya) {
                data.append('kapakGorseli', kapakDosya);
            }

            if (isEdit) {
                await updateArticle(id, data);
                setSuccess('Makale güncellendi!');
            } else {
                await createArticle(data);
                setSuccess(status === 'yayinda' ? 'Makale yayınlandı!' : 'Taslak kaydedildi!');
            }

            setTimeout(() => navigate('/uzman/articles'), 1200);
        } catch (err) {
            setError(err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingArticle) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Makale Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* ── HEADER ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/uzman/articles')}
                        className="w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">
                            {isEdit ? 'Makaleyi Düzenle' : 'Yeni Makale Yaz'}
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">İçerik Stüdyosu</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={(e) => handleSubmit(e, 'taslak')}
                        disabled={loading}
                        className="border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest px-6"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                        Taslağa Kaydet
                    </Button>
                    <Button
                        onClick={(e) => handleSubmit(e, 'yayinda')}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest px-8 shadow-xl shadow-blue-200"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
                        Yayınla
                    </Button>
                </div>
            </div>

            {/* ── MESAJLAR ── */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700"
                    >
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p className="text-xs font-bold leading-tight">{error}</p>
                        <button onClick={() => setError('')} className="ml-auto"><X size={16} /></button>
                    </motion.div>
                )}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-700"
                    >
                        <CheckCircle size={18} className="shrink-0" />
                        <p className="text-xs font-bold">{success}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* ── ANA EDİTÖR (SOL) ── */}
                <div className="lg:col-span-8 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6"
                    >
                        {/* Başlık */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Makale Başlığı *</label>
                            <input
                                name="baslik"
                                value={formData.baslik}
                                onChange={handleChange}
                                placeholder="Okuyucunun dikkatini çekecek bir başlık yazın..."
                                className="w-full bg-transparent text-2xl md:text-3xl font-black tracking-tighter italic text-slate-900 placeholder:text-slate-200 outline-none border-b-2 border-slate-100 focus:border-blue-500 transition-all pb-4"
                            />
                        </div>

                        {/* Özet */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kısa Özet</label>
                            <textarea
                                name="ozet"
                                value={formData.ozet}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Makalenin konusunu kısaca açıklayın (arama sonuçlarında görünür)..."
                                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-medium text-slate-600 outline-none focus:bg-white focus:border-blue-500 transition-all leading-relaxed resize-none"
                            />
                        </div>

                        {/* İçerik Editörü */}
                        <div className="pt-4 border-t border-slate-50">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 block">Makale İçeriği *</label>
                            <RichTextEditor
                                value={formData.icerik}
                                onChange={(html) => setFormData(prev => ({ ...prev, icerik: html }))}
                                placeholder="Bilgi ve deneyimlerinizi buraya dökün..."
                            />
                        </div>
                    </motion.div>
                </div>

                {/* ── AYARLAR PANELİ (SAĞ) ── */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Kategori & Etiket */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8"
                    >
                        {/* Kategori */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                                <Layout size={18} className="text-blue-600" /> Kategori
                            </h3>
                            <select
                                name="kategori"
                                value={formData.kategori}
                                onChange={handleChange}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Seçiniz</option>
                                {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                        </div>

                        {/* Etiketler */}
                        <div className="space-y-4 pt-8 border-t border-slate-50">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                                <Tag size={18} className="text-blue-600" /> Etiketler
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    value={etiketInput}
                                    onChange={(e) => setEtiketInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') { e.preventDefault(); addEtiket(); }
                                    }}
                                    placeholder="Etiket yazıp Enter'a basın..."
                                    className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={addEtiket}
                                    className="px-4 py-3 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-colors"
                                >
                                    Ekle
                                </button>
                            </div>
                            {formData.etiketler.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.etiketler.map(t => (
                                        <span key={t} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-blue-100">
                                            {t}
                                            <button
                                                type="button"
                                                onClick={() => removeEtiket(t)}
                                                className="text-blue-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={11} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Kapak Resmi */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl"
                    >
                        <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2 mb-6">
                            <ImageIcon size={18} className="text-blue-400" /> Kapak Resmi
                        </h3>

                        <label className="block cursor-pointer">
                            <div className="relative h-48 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700 overflow-hidden flex flex-col items-center justify-center hover:border-blue-500 transition-all">
                                {kapakremiPreview ? (
                                    <img
                                        src={kapakremiPreview}
                                        alt="Kapak önizleme"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <>
                                        <ImageIcon size={32} className="text-slate-600 mb-3" />
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Görsel Seç</p>
                                        <p className="text-[9px] text-slate-600 mt-1">JPG, PNG · Maks 10MB</p>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>

                        {kapakremiPreview && (
                            <button
                                type="button"
                                onClick={removeImage}
                                className="mt-4 flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300 transition-colors"
                            >
                                <X size={12} /> Görseli Kaldır
                            </button>
                        )}
                    </motion.div>

                    {/* Video Link */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                        className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm"
                    >
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2 mb-5">
                            <Video size={18} className="text-blue-600" /> Video Linki
                        </h3>
                        <input
                            name="videoLink"
                            value={formData.videoLink}
                            onChange={handleChange}
                            placeholder="YouTube veya diğer video URL'si..."
                            className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                        />
                        {formData.videoLink && (
                            <p className="mt-2 text-[10px] text-slate-400 font-medium break-all">{formData.videoLink}</p>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
