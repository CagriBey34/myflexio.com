import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, FileText, Activity,
    ChevronRight, ChevronLeft, ArrowLeft,
    Save, X, Upload, Trash2, Eye, Plus, ClipboardList
} from 'lucide-react';
import { getProfile, completeProfile, getMedicalReports, uploadMedicalReport, deleteMedicalReport } from '../../services/hastaService';
import IlIlceSelect from '../../../../shared/components/ui/IlIlceSelect';
import Input from '../../../../shared/components/ui/Input';

const PAIN_REGIONS = [
    'Bel', 'Boyun', 'Omuz', 'Diz', 'Kalça',
    'Ayak Bileği', 'Sırt', 'El Bileği', 'Dirsek'
];

const ACTIVITY_LEVELS = [
    { value: 'sedentary', label: 'Hareketsiz' },
    { value: 'light', label: 'Az Hareketli' },
    { value: 'active', label: 'Aktif' },
    { value: 'athlete', label: 'Sporcu' },
];

const fadeUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

function ToggleBox({ label, checked, onChange, detail, onDetailChange, placeholder }) {
    return (
        <div className="space-y-3">
            <div
                onClick={() => onChange(!checked)}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all select-none ${
                    checked
                        ? 'border-blue-500 bg-blue-50/40 shadow-sm shadow-blue-100'
                        : 'border-gray-100 bg-white hover:border-blue-200'
                }`}
            >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}>
                    {checked && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="text-sm font-bold text-gray-700">{label}</span>
            </div>
            {checked && (
                <textarea
                    value={detail}
                    onChange={e => onDetailChange(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    className="w-full px-4 py-3 border border-blue-100 bg-blue-50/20 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none transition-all"
                />
            )}
        </div>
    );
}

export default function HastaEditProfile() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        dogumTarihi: '',
        cinsiyet: '',
        sehir: '',
        ilce: '',
        meslek: '',
        aktiviteDuzeyi: '',
        agriBolgesi: [],
        tedaviTercihi: '',
        agriSeviyesi: 5,
        ameliyatGecmisi: false,
        ameliyatDetay: '',
        kronikHastalik: false,
        kronikHastalikDetay: '',
        surekliIlac: false,
        ilacListesi: '',
        alerjiler: '',
    });

    const totalSteps = 4;

    const [raporlar, setRaporlar] = useState([]);
    const [raporLoading, setRaporLoading] = useState(false);
    const [raporYukleniyor, setRaporYukleniyor] = useState(false);
    const [raporHata, setRaporHata] = useState('');
    const [yeniRapor, setYeniRapor] = useState({ tip: '', aciklama: '', dosya: null });
    const fileInputRef = useRef(null);

    const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');

    const RAPOR_TIPLERI = [
        { value: 'mri', label: 'MRI' },
        { value: 'röntgen', label: 'Röntgen' },
        { value: 'ultrason', label: 'Ultrason' },
        { value: 'kan_tahlili', label: 'Kan Tahlili' },
        { value: 'diger', label: 'Diğer' },
    ];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getProfile();
                const p = res.data;
                setFormData({
                    dogumTarihi: p.dogum_tarihi?.split('T')[0] || '',
                    cinsiyet: p.cinsiyet || '',
                    sehir: p.sehir || '',
                    ilce: p.ilce || '',
                    meslek: p.meslek || '',
                    aktiviteDuzeyi: p.aktivite_duzeyi || '',
                    agriBolgesi: p.agri_bolgesi
                        ? p.agri_bolgesi.split(',').map(s => s.trim()).filter(Boolean)
                        : [],
                    tedaviTercihi: p.tedavi_tercihi || '',
                    agriSeviyesi: p.agri_seviyesi || 5,
                    ameliyatGecmisi: !!p.ameliyat_gecmisi,
                    ameliyatDetay: p.ameliyat_detay || '',
                    kronikHastalik: !!p.kronik_hastalik,
                    kronikHastalikDetay: p.kronik_hastalik_detay || '',
                    surekliIlac: !!p.surekli_ilac,
                    ilacListesi: p.ilac_listesi || '',
                    alerjiler: p.alerjiler || '',
                });
            } catch {
                setError('Profil bilgileri yüklenemedi.');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const fetchRaporlar = async () => {
        setRaporLoading(true);
        try {
            const res = await getMedicalReports();
            setRaporlar(res.data || []);
        } catch {
            setRaporHata('Raporlar yüklenemedi.');
        } finally {
            setRaporLoading(false);
        }
    };

    const handleRaporYukle = async () => {
        if (!yeniRapor.dosya || !yeniRapor.tip) {
            setRaporHata('Lütfen dosya ve rapor türünü seçin.');
            return;
        }
        setRaporHata('');
        setRaporYukleniyor(true);
        try {
            await uploadMedicalReport(yeniRapor.dosya, { tip: yeniRapor.tip, aciklama: yeniRapor.aciklama });
            setYeniRapor({ tip: '', aciklama: '', dosya: null });
            if (fileInputRef.current) fileInputRef.current.value = '';
            await fetchRaporlar();
        } catch {
            setRaporHata('Rapor yüklenirken bir hata oluştu.');
        } finally {
            setRaporYukleniyor(false);
        }
    };

    const handleRaporSil = async (id) => {
        if (!confirm('Bu raporu silmek istediğinizden emin misiniz?')) return;
        try {
            await deleteMedicalReport(id);
            setRaporlar(prev => prev.filter(r => r.id !== id));
        } catch {
            setRaporHata('Rapor silinemedi.');
        }
    };

    const toggleRegion = (region) => {
        setFormData(prev => {
            const current = prev.agriBolgesi || [];
            return {
                ...prev,
                agriBolgesi: current.includes(region)
                    ? current.filter(r => r !== region)
                    : [...current, region]
            };
        });
    };

    const handleNext = () => {
        setError('');
        if (currentStep === 1) {
            if (!formData.dogumTarihi || !formData.cinsiyet || !formData.sehir || !formData.ilce) {
                setError('Lütfen zorunlu alanları doldurun');
                return;
            }
        }
        if (currentStep === 2) {
            if (formData.agriBolgesi.length === 0 || !formData.tedaviTercihi) {
                setError('Lütfen ağrı bölgesi ve tedavi tercihini seçin');
                return;
            }
        }
        if (currentStep === 3) {
            fetchRaporlar();
        }
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) { setCurrentStep(currentStep - 1); setError(''); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentStep !== 3) return;
        setError('');
        setLoading(true);
        try {
            await completeProfile({
                ...formData,
                agriBolgesi: formData.agriBolgesi.join(', '),
            });
            setSuccess('Profil başarıyla güncellendi!');
            setTimeout(() => {
                setSuccess('');
                fetchRaporlar();
                setCurrentStep(4);
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Profil güncellenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Profil Yükleniyor...</p>
            </div>
        );
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                <User className="text-blue-600" size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Kişisel Bilgiler</h3>
                            <p className="text-slate-500 text-sm mt-2">Temel bilgilerinizi güncelleyin</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <Input
                                label="Doğum Tarihi"
                                type="date"
                                required
                                value={formData.dogumTarihi}
                                onChange={(e) => setFormData(prev => ({ ...prev, dogumTarihi: e.target.value }))}
                            />
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">Cinsiyet <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.cinsiyet}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cinsiyet: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white transition-all text-sm"
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="erkek">Erkek</option>
                                    <option value="kadin">Kadın</option>
                                    <option value="diger">Diğer</option>
                                </select>
                            </div>
                        </div>

                        <IlIlceSelect
                            sehir={formData.sehir}
                            ilce={formData.ilce}
                            onSehirChange={(val) => setFormData(prev => ({ ...prev, sehir: val, ilce: '' }))}
                            onIlceChange={(val) => setFormData(prev => ({ ...prev, ilce: val }))}
                            theme="blue"
                        />

                        <div className="grid md:grid-cols-2 gap-5">
                            <Input
                                label="Meslek"
                                value={formData.meslek}
                                onChange={(e) => setFormData(prev => ({ ...prev, meslek: e.target.value }))}
                                placeholder="Örn: Yazılımcı"
                            />
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">Günlük Aktivite Düzeyi</label>
                                <select
                                    value={formData.aktiviteDuzeyi}
                                    onChange={(e) => setFormData(prev => ({ ...prev, aktiviteDuzeyi: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white transition-all text-sm"
                                >
                                    <option value="">Seçiniz</option>
                                    {ACTIVITY_LEVELS.map(l => (
                                        <option key={l.value} value={l.value}>{l.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                                <Activity className="text-orange-500" size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Ağrı & Şikayet</h3>
                            <p className="text-slate-500 text-sm mt-2">Şikayetlerinizi güncelleyin</p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                            <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-4">
                                Ağrı Hissedilen Bölgeler <span className="text-red-500">*</span>
                            </h4>
                            <div className="flex flex-wrap gap-2.5">
                                {PAIN_REGIONS.map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => toggleRegion(r)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${
                                            formData.agriBolgesi.includes(r)
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-3">
                            <label className="font-black text-slate-800 text-xs uppercase tracking-widest flex justify-between">
                                Ağrı Seviyesi
                                <span className="text-blue-600 text-sm normal-case font-black">{formData.agriSeviyesi} / 10</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={formData.agriSeviyesi}
                                onChange={e => setFormData(prev => ({ ...prev, agriSeviyesi: parseInt(e.target.value) }))}
                                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 font-bold px-1">
                                <span>AZ</span><span>ORTA</span><span>ŞİDDETLİ</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">
                                Tedavi Tercihi <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.tedaviTercihi}
                                onChange={e => setFormData(prev => ({ ...prev, tedaviTercihi: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white transition-all text-sm"
                            >
                                <option value="">Seçiniz</option>
                                <option value="online">Online Tedavi</option>
                                <option value="evde">Evde Tedavi</option>
                                <option value="klinik">Belirsiz</option>
                            </select>
                        </div>
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                                <FileText className="text-purple-600" size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Tıbbi Geçmiş</h3>
                            <p className="text-slate-500 text-sm mt-2">Sağlık geçmişinizi güncelleyin</p>
                        </div>

                        <div className="space-y-4">
                            <ToggleBox
                                label="Ameliyat Geçmişim Var"
                                checked={formData.ameliyatGecmisi}
                                onChange={v => setFormData(prev => ({ ...prev, ameliyatGecmisi: v }))}
                                detail={formData.ameliyatDetay}
                                onDetailChange={v => setFormData(prev => ({ ...prev, ameliyatDetay: v }))}
                                placeholder="Ameliyatlarınızı kısaca belirtin..."
                            />
                            <ToggleBox
                                label="Kronik Hastalığım Var"
                                checked={formData.kronikHastalik}
                                onChange={v => setFormData(prev => ({ ...prev, kronikHastalik: v }))}
                                detail={formData.kronikHastalikDetay}
                                onDetailChange={v => setFormData(prev => ({ ...prev, kronikHastalikDetay: v }))}
                                placeholder="Kronik hastalıklarınızı belirtin..."
                            />
                            <ToggleBox
                                label="Sürekli İlaç Kullanıyorum"
                                checked={formData.surekliIlac}
                                onChange={v => setFormData(prev => ({ ...prev, surekliIlac: v }))}
                                detail={formData.ilacListesi}
                                onDetailChange={v => setFormData(prev => ({ ...prev, ilacListesi: v }))}
                                placeholder="Kullandığınız ilaçları listeleyin..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">
                                Alerjiler <span className="text-gray-400 font-normal">(Opsiyonel)</span>
                            </label>
                            <textarea
                                value={formData.alerjiler}
                                onChange={e => setFormData(prev => ({ ...prev, alerjiler: e.target.value }))}
                                placeholder="Varsa alerjilerinizi belirtin..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition-all text-sm"
                            />
                        </div>
                    </motion.div>
                );

            case 4:
                return (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                                <ClipboardList className="text-green-600" size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Tıbbi Raporlar</h3>
                            <p className="text-slate-500 text-sm mt-2">Raporlarınızı yükleyin veya yönetin</p>
                        </div>

                        {/* Yeni Rapor Yükleme */}
                        <div className="bg-gray-50 rounded-3xl border border-gray-100 p-6 space-y-4">
                            <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest">Yeni Rapor Ekle</h4>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-2">Rapor Türü <span className="text-red-500">*</span></label>
                                    <select
                                        value={yeniRapor.tip}
                                        onChange={e => setYeniRapor(prev => ({ ...prev, tip: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm"
                                    >
                                        <option value="">Seçiniz</option>
                                        {RAPOR_TIPLERI.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-2">Açıklama <span className="text-gray-400 font-normal">(Opsiyonel)</span></label>
                                    <input
                                        type="text"
                                        value={yeniRapor.aciklama}
                                        onChange={e => setYeniRapor(prev => ({ ...prev, aciklama: e.target.value }))}
                                        placeholder="Örn: 2024 Ocak MRI"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm"
                                    />
                                </div>
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                                    yeniRapor.dosya ? 'border-green-400 bg-green-50/40' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/20'
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    className="hidden"
                                    onChange={e => setYeniRapor(prev => ({ ...prev, dosya: e.target.files[0] || null }))}
                                />
                                {yeniRapor.dosya ? (
                                    <div className="flex items-center justify-center gap-2 text-green-700">
                                        <FileText size={20} />
                                        <span className="text-sm font-bold">{yeniRapor.dosya.name}</span>
                                    </div>
                                ) : (
                                    <div className="text-gray-400">
                                        <Upload size={24} className="mx-auto mb-2" />
                                        <p className="text-sm font-bold">Dosya seçmek için tıklayın</p>
                                        <p className="text-xs mt-1">PDF, JPG, PNG (Maks. 10MB)</p>
                                    </div>
                                )}
                            </div>

                            {raporHata && (
                                <p className="text-red-500 text-sm font-medium flex items-center gap-1.5"><X size={14} /> {raporHata}</p>
                            )}

                            <button
                                type="button"
                                onClick={handleRaporYukle}
                                disabled={raporYukleniyor}
                                className="flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all text-sm disabled:opacity-70"
                            >
                                {raporYukleniyor ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : <Plus size={16} />}
                                Rapor Ekle
                            </button>
                        </div>

                        {/* Mevcut Raporlar */}
                        <div>
                            <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-4">Mevcut Raporlar</h4>
                            {raporLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : raporlar.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <ClipboardList size={36} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-bold">Henüz rapor yüklenmemiş</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {raporlar.map(r => (
                                        <div key={r.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                                    <FileText size={16} className="text-blue-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-slate-800 capitalize">
                                                        {RAPOR_TIPLERI.find(t => t.value === r.tip)?.label || r.tip}
                                                    </p>
                                                    {r.aciklama && <p className="text-xs text-gray-500 truncate">{r.aciklama}</p>}
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        {new Date(r.created_at).toLocaleDateString('tr-TR')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 ml-3">
                                                <a
                                                    href={`${API_BASE}${r.dosya_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all"
                                                >
                                                    <Eye size={14} className="text-blue-600" />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRaporSil(r.id)}
                                                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all"
                                                >
                                                    <Trash2 size={14} className="text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-blue-50/40 min-h-screen py-6 sm:py-10 md:py-12 px-3 sm:px-5 md:px-8">
            <div className="max-w-3xl mx-auto pb-28 lg:pb-8">
                <button
                    onClick={() => navigate('/hasta/profile')}
                    className="flex items-center gap-2 text-blue-600 hover:text-slate-900 font-bold text-sm mb-6 transition-colors"
                >
                    <ArrowLeft size={18} /> Profile Dön
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 p-5 sm:p-7 md:p-10"
                >
                    <div className="mb-8 sm:mb-10">
                        <span className="inline-block text-blue-600 text-xs font-bold uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full mb-4">
                            Profili Düzenle
                        </span>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                            Bilgilerini Güncelle
                        </h1>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-10">
                        <div className="flex items-start mb-1">
                            {['Kişisel', 'Şikayet', 'Tıbbi Geçmiş', 'Raporlar'].map((label, index) => {
                                const step = index + 1;
                                const completed = step < currentStep;
                                const active = step === currentStep;
                                return (
                                    <div key={step} className={`flex items-start ${index < 3 ? 'flex-1' : ''}`}>
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                                completed ? 'bg-blue-500 text-white' :
                                                active ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                                                'bg-gray-100 text-gray-400'
                                            }`}>
                                                {completed ? '✓' : step}
                                            </div>
                                            <span className={`text-[10px] mt-1.5 font-bold ${active || completed ? 'text-blue-600' : 'text-gray-400'}`}>
                                                {label}
                                            </span>
                                        </div>
                                        {index < 3 && (
                                            <div className={`flex-1 h-1 mt-3.5 mx-1 rounded-full transition-all duration-300 ${
                                                completed ? 'bg-blue-400' : 'bg-gray-100'
                                            }`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl mb-8 text-sm font-medium flex items-center gap-2">
                            <X size={18} /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-5 py-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-2">
                            <Activity size={18} /> {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="min-h-[400px]">
                            {renderStep()}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-gray-100">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); handlePrev(); }}
                                    className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-800 border border-gray-200 font-bold px-8 py-4 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 text-sm"
                                >
                                    <ChevronLeft size={18} /> Geri
                                </button>
                            )}

                            {currentStep < 3 && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); handleNext(); }}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-full hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-200 text-sm"
                                >
                                    Devam Et <ChevronRight size={18} />
                                </button>
                            )}
                            {currentStep === 3 && (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-8 py-4 rounded-full hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-200 text-sm disabled:opacity-70"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <><Save size={18} /> Kaydet & Devam Et</>
                                    )}
                                </button>
                            )}
                            {currentStep === 4 && (
                                <button
                                    type="button"
                                    onClick={() => navigate('/hasta/profile')}
                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-full hover:bg-green-700 transition-all duration-300 shadow-lg shadow-green-200 text-sm"
                                >
                                    <Save size={18} /> Tamamla
                                </button>
                            )}
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
