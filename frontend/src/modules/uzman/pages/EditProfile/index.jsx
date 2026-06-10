import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, GraduationCap, Award, FileText, ChevronRight, ChevronLeft, Upload, X, Save, ArrowLeft, HeartPulse, BadgeDollarSign } from 'lucide-react';
import { getProfile, completeProfile } from '../../services/uzmanService';
import Input from '../../../../shared/components/ui/Input';
import IlIlceSelect from '../../../../shared/components/ui/IlIlceSelect';

const EXPERTISE_OPTIONS = {
    vucutBolgesi: ['Bel', 'Boyun', 'Omuz', 'Diz', 'Kalça', 'Ayak Bileği', 'Dirsek', 'Bilek', 'El', 'Sırt', 'Kol', 'Bacak'],
    tedaviYontemleri: ['Manuel Terapi', 'Egzersiz Terapisi', 'Elektroterapi', 'Hidroterapi', 'Masaj', 'Akupunktur', 'Kuru İğneleme'],
    ozelAlanlar: ['Spor Yaralanmaları', 'Geriatri', 'Pediatri', 'Nörolojik Rehabilitasyon', 'Ortopedik Rehabilitasyon', 'Kardiyak Rehabilitasyon'],
    hastaliklar: ['Skolyoz', 'Disk Hernisi', 'Tendinit', 'Artrit', 'Fibromiyalji', 'Osteoporoz']
};

const DEFAULT_UZMANLIK = {
    vucutBolgesi: [],
    tedaviYontemleri: [],
    ozelAlanlar: [],
    hastaliklar: []
};

/* ─── Animasyon Varyantları ─────────────────────────────────── */
const fadeUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export default function EditProfile() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [photoPreview, setPhotoPreview] = useState(null);

    const [formData, setFormData] = useState({
        dogumTarihi: '',
        cinsiyet: '',
        sehir: '',
        ilce: '',
        profilFotograf: null,
        mezuniyetOkul: '',
        mezuniyetYili: '',
        biyografi: '',
        uzmanlikAlanlari: { ...DEFAULT_UZMANLIK },
        sertifikalar: [],
        onlineSeansucreti: '',
        evdeSeansucreti: '',
        ibanNo: '',
        ibanAdSoyad: '',
    });

    const totalSteps = 5;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfile();
                const p = response.data;

                const uzmanlikAlanlari = {
                    ...DEFAULT_UZMANLIK,
                    ...(p.uzmanlikAlanlari || {})
                };

                Object.keys(uzmanlikAlanlari).forEach(key => {
                    if (!Array.isArray(uzmanlikAlanlari[key])) {
                        uzmanlikAlanlari[key] = [];
                    }
                });

                setFormData({
                    dogumTarihi: p.dogum_tarihi?.split('T')[0] || '',
                    cinsiyet: p.cinsiyet || '',
                    sehir: p.sehir || '',
                    ilce: p.ilce || '',
                    profilFotograf: null,
                    mezuniyetOkul: p.mezuniyet_okul || '',
                    mezuniyetYili: p.mezuniyet_yili || '',
                    biyografi: p.biyografi || '',
                    uzmanlikAlanlari,
                    sertifikalar: (p.sertifikalar || []).map(cert => ({
                        id: cert.id,
                        adi: cert.adi,
                        dosya: null,
                        dosya_url: cert.dosya_url
                    })),
                    onlineSeansucreti: p.online_seans_ucreti || '',
                    evdeSeansucreti: p.evde_seans_ucreti || '',
                    ibanNo: p.iban_no || '',
                    ibanAdSoyad: p.iban_ad_soyad || '',
                });

                if (p.profil_fotograf_url) {
                    setPhotoPreview(p.profil_fotograf_url);
                }
            } catch (err) {
                setError('Profil bilgileri yüklenemedi.');
            } finally {
                setFetchLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const toggleExpertise = (category, value) => {
        const current = formData.uzmanlikAlanlari[category] || [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];

        setFormData({
            ...formData,
            uzmanlikAlanlari: { ...formData.uzmanlikAlanlari, [category]: updated }
        });
    };

    const isSelected = (category, value) => {
        return (formData.uzmanlikAlanlari[category] || []).includes(value);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Profil fotoğrafı 2MB\'dan küçük olmalıdır');
                return;
            }
            setFormData({ ...formData, profilFotograf: file });
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const addCertificate = () => {
        if (formData.sertifikalar.length >= 10) {
            setError('Maksimum 10 sertifika ekleyebilirsiniz');
            return;
        }
        setFormData({
            ...formData,
            sertifikalar: [...formData.sertifikalar, { adi: '', dosya: null, dosya_url: null }]
        });
    };

    const removeCertificate = (index) => {
        setFormData({
            ...formData,
            sertifikalar: formData.sertifikalar.filter((_, i) => i !== index)
        });
    };

    const updateCertificate = (index, field, value) => {
        const updated = [...formData.sertifikalar];
        updated[index][field] = value;
        setFormData({ ...formData, sertifikalar: updated });
    };

    const handleNext = () => {
        setError('');
        if (currentStep === 1) {
            if (!formData.dogumTarihi || !formData.cinsiyet || !formData.sehir || !formData.ilce) {
                setError('Lütfen tüm alanları doldurun');
                return;
            }
        }
        if (currentStep === 2) {
            if (!formData.mezuniyetOkul || !formData.mezuniyetYili || !formData.biyografi) {
                setError('Lütfen tüm alanları doldurun');
                return;
            }
        }
        if (currentStep === 3) {
            const hasSelection = Object.values(formData.uzmanlikAlanlari).some(arr => Array.isArray(arr) && arr.length > 0);
            if (!hasSelection) {
                setError('Lütfen en az bir uzmanlık alanı seçin');
                return;
            }
        }
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) { setCurrentStep(currentStep - 1); setError(''); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentStep !== totalSteps) return;
        setError('');
        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('dogumTarihi', formData.dogumTarihi);
            submitData.append('cinsiyet', formData.cinsiyet);
            submitData.append('sehir', formData.sehir);
            submitData.append('ilce', formData.ilce);
            if (formData.profilFotograf) {
                submitData.append('profilFotograf', formData.profilFotograf);
            }
            submitData.append('mezuniyetOkul', formData.mezuniyetOkul);
            submitData.append('mezuniyetYili', formData.mezuniyetYili);
            submitData.append('biyografi', formData.biyografi);
            submitData.append('uzmanlikAlanlari', JSON.stringify(formData.uzmanlikAlanlari));
            if (formData.onlineSeansucreti) submitData.append('onlineSeansucreti', formData.onlineSeansucreti);
            if (formData.evdeSeansucreti) submitData.append('evdeSeansucreti', formData.evdeSeansucreti);
            if (formData.ibanNo) submitData.append('ibanNo', formData.ibanNo);
            if (formData.ibanAdSoyad) submitData.append('ibanAdSoyad', formData.ibanAdSoyad);

            if (formData.sertifikalar.length > 0) {
                const certData = formData.sertifikalar.map(cert => ({
                    id: cert.id || null,
                    adi: cert.adi
                }));
                submitData.append('sertifikalar', JSON.stringify(certData));
                formData.sertifikalar.forEach(cert => {
                    if (cert.dosya) submitData.append('sertifika', cert.dosya);
                });
            }

            await completeProfile(submitData);
            setSuccess('Profil başarıyla güncellendi!');
            setTimeout(() => navigate('/uzman/profile'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Profil güncellenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#0a2e1a] font-bold text-xs uppercase tracking-widest">Profil Yükleniyor...</p>
            </div>
        );
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-[#dcfce7] flex items-center justify-center mx-auto mb-4">
                                <User className="text-[#16a34a]" size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-[#0a2e1a]">Kişisel Bilgiler</h3>
                            <p className="text-gray-500 text-sm mt-2">Temel bilgilerinizi güncelleyin</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <Input
                                label="Doğum Tarihi"
                                type="date"
                                required
                                value={formData.dogumTarihi}
                                onChange={(e) => setFormData({ ...formData, dogumTarihi: e.target.value })}
                                className="border-gray-200 focus:ring-2 focus:ring-[#4ade80] rounded-xl"
                            />
                            <div>
                                <label className="block text-sm font-bold text-[#0a2e1a] mb-2">Cinsiyet <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={formData.cinsiyet}
                                    onChange={(e) => setFormData({ ...formData, cinsiyet: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent bg-white transition-all text-sm"
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
                            theme="green"
                        />

                        <div className="pt-2">
                            <label className="block text-sm font-bold text-[#0a2e1a] mb-3">Profil Fotoğrafı</label>
                            <div className="flex items-center gap-5 p-4 border border-gray-100 bg-gray-50 rounded-2xl">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#dcfce7]" />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-gray-200 flex items-center justify-center">
                                        <User className="text-gray-400" size={32} />
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
                                <label
                                    htmlFor="photo-upload"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-[#4ade80] hover:text-[#16a34a] transition-all text-sm font-bold text-gray-600 shadow-sm"
                                >
                                    <Upload size={18} />
                                    {formData.profilFotograf ? 'Fotoğrafı Değiştir' : 'Fotoğraf Yükle'}
                                </label>
                            </div>
                        </div>
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-[#dbeafe] flex items-center justify-center mx-auto mb-4">
                                <GraduationCap className="text-[#1d4ed8]" size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-[#0a2e1a]">Eğitim Bilgileri</h3>
                            <p className="text-gray-500 text-sm mt-2">Akademik geçmişinizi güncelleyin</p>
                        </div>

                        <Input
                            label="Mezuniyet Okulu"
                            required
                            value={formData.mezuniyetOkul}
                            onChange={(e) => setFormData({ ...formData, mezuniyetOkul: e.target.value })}
                            placeholder="Örn: Hacettepe Üniversitesi"
                            className="border-gray-200 focus:ring-2 focus:ring-[#4ade80] rounded-xl"
                        />
                        <Input
                            label="Mezuniyet Yılı"
                            type="number"
                            required
                            value={formData.mezuniyetYili}
                            onChange={(e) => setFormData({ ...formData, mezuniyetYili: e.target.value })}
                            placeholder="Örn: 2015"
                            className="border-gray-200 focus:ring-2 focus:ring-[#4ade80] rounded-xl"
                        />
                        <div>
                            <label className="block text-sm font-bold text-[#0a2e1a] mb-2">
                                Biyografi <span className="text-red-500">*</span> <span className="text-gray-400 font-normal ml-1">(Maks 500 karakter)</span>
                            </label>
                            <textarea
                                required
                                value={formData.biyografi}
                                onChange={(e) => setFormData({ ...formData, biyografi: e.target.value })}
                                maxLength={500}
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent resize-none transition-all text-sm"
                                placeholder="Danışanlarınıza kendinizden bahsedin, deneyimlerinizi paylaşın..."
                            />
                            <p className="text-xs text-gray-400 mt-2 text-right font-medium">{formData.biyografi.length} / 500</p>
                        </div>
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-[#fef3c7] flex items-center justify-center mx-auto mb-4">
                                <Award className="text-[#d97706]" size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-[#0a2e1a]">Uzmanlık Alanları</h3>
                            <p className="text-gray-500 text-sm mt-2">Hizmet verdiğiniz alanları işaretleyin</p>
                        </div>

                        {Object.entries(EXPERTISE_OPTIONS).map(([category, options]) => (
                            <div key={category} className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <h4 className="font-black text-[#0a2e1a] text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <HeartPulse size={14} className="text-[#4ade80]" />
                                    {category === 'vucutBolgesi' && 'Vücut Bölgesi'}
                                    {category === 'tedaviYontemleri' && 'Tedavi Yöntemleri'}
                                    {category === 'ozelAlanlar' && 'Özel Alanlar'}
                                    {category === 'hastaliklar' && 'Hastalıklar'}
                                </h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {options.map(option => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => toggleExpertise(category, option)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${
                                                isSelected(category, option)
                                                    ? 'bg-[#0f4c35] text-white border-[#0f4c35] shadow-lg shadow-green-900/20'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#4ade80] hover:text-[#16a34a]'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                );

            case 4:
                return (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-[#f3e8ff] flex items-center justify-center mx-auto mb-4">
                                <FileText className="text-[#7e22ce]" size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-[#0a2e1a]">Sertifikalar</h3>
                            <p className="text-gray-500 text-sm mt-2">Mesleki belgelerinizi sisteme ekleyin</p>
                        </div>

                        {formData.sertifikalar.map((cert, index) => (
                            <div key={index} className="bg-gray-50 p-6 rounded-3xl relative border border-gray-100 group hover:border-[#4ade80]/40 transition-colors">
                                <button
                                    type="button"
                                    onClick={() => removeCertificate(index)}
                                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white text-red-400 hover:text-white hover:bg-red-500 shadow-sm transition-all"
                                >
                                    <X size={16} />
                                </button>
                                <div className="space-y-4 pr-10">
                                    <Input
                                        label={`Sertifika ${index + 1} Adı`}
                                        value={cert.adi}
                                        onChange={(e) => updateCertificate(index, 'adi', e.target.value)}
                                        placeholder="Örn: Spor Fizyoterapisi Sertifikası"
                                        className="border-gray-200 focus:ring-2 focus:ring-[#4ade80] rounded-xl"
                                    />
                                    
                                    {cert.dosya_url && !cert.dosya && (
                                        <div className="flex items-center gap-3 text-sm text-gray-600 bg-white px-4 py-3 rounded-xl border border-gray-200">
                                            <FileText size={16} className="text-[#16a34a]" />
                                            <span className="font-medium">Mevcut dosya yüklü</span>
                                            <a href={cert.dosya_url} target="_blank" rel="noopener noreferrer" className="text-[#16a34a] font-bold hover:underline ml-auto text-xs">Görüntüle</a>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-[#0a2e1a] mb-2">
                                            {cert.dosya_url ? 'Dosyayı Değiştir (Opsiyonel)' : 'Belge Yükle'}
                                        </label>
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => updateCertificate(index, 'dosya', e.target.files[0])}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#dcfce7] file:text-[#16a34a] hover:file:bg-[#bbf7d0] cursor-pointer transition-all"
                                        />
                                        {cert.dosya && (
                                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                <HeartPulse size={12} className="text-[#4ade80]" />
                                                {cert.dosya.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addCertificate}
                            disabled={formData.sertifikalar.length >= 10}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-gray-200 text-[#16a34a] font-bold text-sm hover:border-[#4ade80] hover:bg-[#f0fdf4] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            + Yeni Sertifika Ekle
                        </button>
                    </motion.div>
                );

            case 5:
                return (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-[#dcfce7] flex items-center justify-center mx-auto mb-4">
                                <BadgeDollarSign className="text-[#16a34a]" size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-[#0a2e1a]">Hizmet Ücretleri</h3>
                            <p className="text-gray-500 text-sm mt-2">Seans başına ücretlerinizi belirleyin</p>
                        </div>

                        <div className="bg-[#f0fdf4] rounded-3xl p-6 border border-[#bbf7d0] space-y-5">
                            <div>
                                <label className="block text-sm font-black text-[#0a2e1a] mb-1">
                                    💻 Online Seans Ücreti (₺)
                                </label>
                                <p className="text-xs text-gray-400 mb-3">Hasta ile video/online görüşme başına ücret</p>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">₺</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="50"
                                        value={formData.onlineSeansucreti}
                                        onChange={(e) => setFormData({ ...formData, onlineSeansucreti: e.target.value })}
                                        placeholder="Örn: 500"
                                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-[#4ade80] bg-white text-sm font-bold text-[#0a2e1a] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-[#bbf7d0]" />

                            <div>
                                <label className="block text-sm font-black text-[#0a2e1a] mb-1">
                                    🏠 Evde Tedavi Seans Ücreti (₺)
                                </label>
                                <p className="text-xs text-gray-400 mb-3">Hastanın evinde yapılan seans başına ücret</p>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">₺</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="50"
                                        value={formData.evdeSeansucreti}
                                        onChange={(e) => setFormData({ ...formData, evdeSeansucreti: e.target.value })}
                                        placeholder="Örn: 800"
                                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-[#4ade80] bg-white text-sm font-bold text-[#0a2e1a] transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-[#bbf7d0] pt-5 space-y-3">
                            <div>
                                <label className="block text-sm font-black text-[#0a2e1a] mb-1">
                                    🏦 IBAN Numaranız
                                </label>
                                <p className="text-xs text-gray-400 mb-3">Ödeme bilgileriniz hastalar tarafından görülemez, sadece admin tarafından kontrol edilir.</p>
                                <input
                                    type="text"
                                    value={formData.ibanNo}
                                    onChange={(e) => setFormData({ ...formData, ibanNo: e.target.value.toUpperCase() })}
                                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                                    maxLength={32}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-[#4ade80] bg-white text-sm font-bold text-[#0a2e1a] tracking-widest transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-[#0a2e1a] mb-1">
                                    Hesap Sahibi Adı Soyadı
                                </label>
                                <input
                                    type="text"
                                    value={formData.ibanAdSoyad}
                                    onChange={(e) => setFormData({ ...formData, ibanAdSoyad: e.target.value })}
                                    placeholder="Örn: Ahmet Yılmaz"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-[#4ade80] bg-white text-sm font-bold text-[#0a2e1a] transition-all"
                                />
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 text-center">
                            Bu ücretler tedavi planı oluştururken otomatik hesaplamalarda kullanılır.
                        </p>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-[#f0fdf4] min-h-screen py-6 sm:py-10 md:py-12 px-3 sm:px-5 md:px-8">
            <div className="max-w-3xl mx-auto pb-28 lg:pb-8">
                <button
                    onClick={() => navigate('/uzman/profile')}
                    className="flex items-center gap-2 text-[#16a34a] hover:text-[#0a2e1a] font-bold text-sm mb-6 transition-colors"
                >
                    <ArrowLeft size={18} /> Profile Dön
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-green-900/5 border border-gray-100 p-5 sm:p-7 md:p-10"
                >
                    <div className="mb-8 sm:mb-10">
                        <span className="inline-block text-[#16a34a] text-xs font-bold uppercase tracking-widest bg-[#dcfce7] px-4 py-2 rounded-full mb-4">
                            Profili Düzenle
                        </span>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0a2e1a] leading-tight">
                            Bilgilerini Güncelle
                        </h1>
                    </div>

                    <div className="mb-10">
                        <div className="flex items-start mb-1">
                            {['Kişisel', 'Eğitim', 'Uzmanlık', 'Sertifikalar', 'Ücretler'].map((label, index) => {
                                const step = index + 1;
                                const completed = step < currentStep;
                                const active = step === currentStep;
                                return (
                                    <div key={step} className={`flex items-start ${index < 4 ? 'flex-1' : ''}`}>
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                                completed ? 'bg-[#4ade80] text-[#0a2e1a]' :
                                                active ? 'bg-[#0f4c35] text-white ring-4 ring-[#dcfce7]' :
                                                'bg-gray-100 text-gray-400'
                                            }`}>
                                                {completed ? '✓' : step}
                                            </div>
                                            <span className={`text-[10px] mt-1.5 font-bold ${active || completed ? 'text-[#0f4c35]' : 'text-gray-400'}`}>
                                                {label}
                                            </span>
                                        </div>
                                        {index < 4 && (
                                            <div className={`flex-1 h-1 mt-3.5 mx-1 rounded-full transition-all duration-300 ${
                                                completed ? 'bg-[#4ade80]' : 'bg-gray-100'
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
                        <div className="bg-[#dcfce7] border border-[#4ade80]/30 text-[#16a34a] px-5 py-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-2">
                            <HeartPulse size={18} /> {success}
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
                                    className="flex-1 flex items-center justify-center gap-2 bg-white text-[#0a2e1a] border border-gray-200 font-bold px-8 py-4 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 text-sm"
                                >
                                    <ChevronLeft size={18} /> Geri
                                </button>
                            )}
                            
                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); handleNext(); }}
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#0f4c35] text-white font-bold px-8 py-4 rounded-full hover:bg-[#16a34a] transition-all duration-300 shadow-lg shadow-green-900/20 text-sm"
                                >
                                    Devam Et <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#4ade80] text-[#0a2e1a] font-bold px-8 py-4 rounded-full hover:bg-[#22c55e] transition-all duration-300 shadow-lg shadow-green-500/20 text-sm disabled:opacity-70"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-[#0a2e1a] border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={18} /> Değişiklikleri Kaydet
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}