import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, ArrowLeft, Image as ImageIcon, Tag, Layout,
    Send, AlertCircle, X, CheckCircle, Video, Loader2, HeartPulse
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
    const [kapakResmiPreview, setKapakResmiPreview] = useState(null);

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
                    setKapakResmiPreview(a.kapak_resmi_url);
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
        reader.onloadend = () => setKapakResmiPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setKapakDosya(null);
        setKapakResmiPreview(null);
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
                setSuccess('Makale başarıyla güncellendi!');
            } else {
                await createArticle(data);
                setSuccess(status === 'yayinda' ? 'Makale başarıyla yayınlandı!' : 'Taslak başarıyla kaydedildi!');
            }

            setTimeout(() => navigate('/uzman/articles'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingArticle) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#0a2e1a] font-black uppercase text-[10px] tracking-widest">Makale Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#f0fdf4] min-h-screen py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/uzman/articles')}
                            className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[#16a34a] hover:border-[#4ade80]/50 hover:bg-[#dcfce7] transition-all shadow-sm shrink-0"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <span className="inline-block text-[#16a34a] text-[10px] font-bold uppercase tracking-widest bg-[#dcfce7] px-3 py-1.5 rounded-full mb-2">
                                İçerik Stüdyosu
                            </span>
                            <h1 className="text-3xl md:text-4xl font-black text-[#0a2e1a] leading-none">
                                {isEdit ? 'Makaleyi Düzenle' : 'Yeni Makale Yaz'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={(e) => handleSubmit(e, 'taslak')}
                            disabled={loading}
                            className="border-gray-200 text-gray-600 bg-white hover:bg-gray-50 rounded-full font-black text-xs uppercase tracking-widest px-6"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                            Taslağa Kaydet
                        </Button>
                        <Button
                            onClick={(e) => handleSubmit(e, 'yayinda')}
                            disabled={loading}
                            className="bg-[#0f4c35] hover:bg-[#16a34a] text-white rounded-full font-black text-xs uppercase tracking-widest px-8 shadow-lg shadow-green-900/20 transition-all"
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
                            className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 shadow-sm"
                        >
                            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
                            <p className="text-sm font-bold leading-tight flex-1">{error}</p>
                            <button onClick={() => setError('')} className="text-red-400 hover:text-red-700 transition-colors"><X size={18} /></button>
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="p-4 bg-[#dcfce7] border border-[#4ade80]/30 rounded-2xl flex items-center gap-3 text-[#0f4c35] shadow-sm"
                        >
                            <CheckCircle size={18} className="shrink-0 text-[#16a34a]" />
                            <p className="text-sm font-bold">{success}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* ── ANA EDİTÖR (SOL) ── */}
                    <div className="lg:col-span-8 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm space-y-8"
                        >
                            {/* Başlık */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <HeartPulse size={12} className="text-[#4ade80]"/> Makale Başlığı *
                                </label>
                                <input
                                    name="baslik"
                                    value={formData.baslik}
                                    onChange={handleChange}
                                    placeholder="Okuyucunun dikkatini çekecek bir başlık yazın..."
                                    className="w-full bg-transparent text-2xl md:text-3xl font-black text-[#0a2e1a] placeholder:text-gray-300 outline-none border-b-2 border-gray-100 focus:border-[#4ade80] transition-all pb-4"
                                />
                            </div>

                            {/* Özet */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <Layout size={12} className="text-[#4ade80]"/> Kısa Özet
                                </label>
                                <textarea
                                    name="ozet"
                                    value={formData.ozet}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Makalenin konusunu kısaca açıklayın (arama sonuçlarında görünür)..."
                                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium text-gray-600 outline-none focus:bg-white focus:border-[#4ade80] focus:ring-4 focus:ring-[#4ade80]/10 transition-all leading-relaxed resize-none"
                                />
                            </div>

                            {/* İçerik Editörü */}
                            <div className="pt-6 border-t border-gray-50">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-4 block">Makale İçeriği *</label>
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
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-8"
                        >
                            {/* Kategori */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-[#0a2e1a] uppercase tracking-widest flex items-center gap-2">
                                    <Layout size={18} className="text-[#16a34a]" /> Kategori
                                </h3>
                                <div className="relative">
                                    <select
                                        name="kategori"
                                        value={formData.kategori}
                                        onChange={handleChange}
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-700 uppercase tracking-widest outline-none focus:border-[#4ade80] focus:ring-4 focus:ring-[#4ade80]/10 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Seçiniz</option>
                                        {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            {/* Etiketler */}
                            <div className="space-y-4 pt-8 border-t border-gray-50">
                                <h3 className="text-sm font-black text-[#0a2e1a] uppercase tracking-widest flex items-center gap-2">
                                    <Tag size={18} className="text-[#16a34a]" /> Etiketler
                                </h3>
                                <div className="flex gap-2">
                                    <input
                                        value={etiketInput}
                                        onChange={(e) => setEtiketInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') { e.preventDefault(); addEtiket(); }
                                        }}
                                        placeholder="Etiket yazıp Enter'a basın..."
                                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-[#4ade80] focus:ring-4 focus:ring-[#4ade80]/10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={addEtiket}
                                        className="px-5 py-3 bg-[#4ade80] text-[#0a2e1a] rounded-xl text-xs font-black hover:bg-[#22c55e] transition-colors"
                                    >
                                        Ekle
                                    </button>
                                </div>
                                {formData.etiketler.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {formData.etiketler.map(t => (
                                            <span key={t} className="px-3 py-1.5 bg-[#f0fdf4] text-[#16a34a] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-[#bbf7d0]">
                                                {t}
                                                <button
                                                    type="button"
                                                    onClick={() => removeEtiket(t)}
                                                    className="text-[#16a34a] hover:text-red-500 transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Kapak Resmi */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #0a2e1a 0%, #0f4c35 100%)' }}
                        >
                            {/* Dekoratif blur */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#4ade80] blur-[80px] opacity-20 rounded-full pointer-events-none" />

                            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6 relative z-10">
                                <ImageIcon size={18} className="text-[#4ade80]" /> Kapak Resmi
                            </h3>

                            <label className="block cursor-pointer relative z-10">
                                <div className="relative h-48 bg-white/5 rounded-3xl border-2 border-dashed border-white/20 overflow-hidden flex flex-col items-center justify-center hover:border-[#4ade80]/50 hover:bg-white/10 transition-all group">
                                    {kapakResmiPreview ? (
                                        <img
                                            src={kapakResmiPreview}
                                            alt="Kapak önizleme"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <ImageIcon size={24} className="text-[#4ade80]" />
                                            </div>
                                            <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">Görsel Seç</p>
                                            <p className="text-[9px] text-white/40 mt-1 font-medium">JPG, PNG · Maks 10MB</p>
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

                            {kapakResmiPreview && (
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="mt-4 flex items-center justify-center w-full gap-2 text-[10px] py-2 font-black text-red-300 uppercase tracking-widest hover:text-white hover:bg-red-500/20 rounded-xl transition-colors relative z-10"
                                >
                                    <X size={14} /> Görseli Kaldır
                                </button>
                            )}
                        </motion.div>

                        {/* Video Link */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm"
                        >
                            <h3 className="text-sm font-black text-[#0a2e1a] uppercase tracking-widest flex items-center gap-2 mb-5">
                                <Video size={18} className="text-[#16a34a]" /> Video Linki
                            </h3>
                            <input
                                name="videoLink"
                                value={formData.videoLink}
                                onChange={handleChange}
                                placeholder="YouTube veya diğer video URL'si..."
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-700 outline-none focus:border-[#4ade80] focus:ring-4 focus:ring-[#4ade80]/10 transition-all"
                            />
                            {formData.videoLink && (
                                <p className="mt-3 text-[10px] text-gray-400 font-medium break-all px-1 flex items-center gap-1.5">
                                    <CheckCircle size={10} className="text-[#16a34a]"/> Link Eklendi
                                </p>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}