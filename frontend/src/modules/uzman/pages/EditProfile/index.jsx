import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, GraduationCap, Award, FileText, ChevronRight, ChevronLeft, Upload, X, Save, ArrowLeft } from 'lucide-react';
import { getProfile, completeProfile } from '../../services/uzmanService';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';

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
        sertifikalar: []
    });

    const totalSteps = 4;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfile();
                const p = response.data;

                // Backend'den gelen uzmanlikAlanlari verisini default ile birleştir
                const uzmanlikAlanlari = {
                    ...DEFAULT_UZMANLIK,
                    ...(p.uzmanlikAlanlari || {})
                };

                // Her kategorinin array olduğundan emin ol
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
                    }))
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
        const current = formData.uzmanlikAlanlari[category] || []; // güvenli erişim
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
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Profil Yükleniyor...</p>
            </div>
        );
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="text-center mb-6">
                            <User className="mx-auto text-blue-600 mb-2" size={40} />
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Kişisel Bilgiler</h3>
                            <p className="text-slate-500 font-medium mt-1">Temel bilgilerinizi güncelleyin</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Doğum Tarihi"
                                type="date"
                                required
                                value={formData.dogumTarihi}
                                onChange={(e) => setFormData({ ...formData, dogumTarihi: e.target.value })}
                            />
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Cinsiyet *</label>
                                <select
                                    required
                                    value={formData.cinsiyet}
                                    onChange={(e) => setFormData({ ...formData, cinsiyet: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="erkek">Erkek</option>
                                    <option value="kadin">Kadın</option>
                                    <option value="diger">Diğer</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Şehir"
                                required
                                value={formData.sehir}
                                onChange={(e) => setFormData({ ...formData, sehir: e.target.value })}
                                placeholder="İstanbul"
                            />
                            <Input
                                label="İlçe"
                                required
                                value={formData.ilce}
                                onChange={(e) => setFormData({ ...formData, ilce: e.target.value })}
                                placeholder="Kadıköy"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Profil Fotoğrafı</label>
                            <div className="flex items-center gap-4">
                                {photoPreview && (
                                    <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-50" />
                                )}
                                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
                                <label
                                    htmlFor="photo-upload"
                                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 text-sm font-medium text-slate-700"
                                >
                                    <Upload size={18} />
                                    {formData.profilFotograf ? 'Fotoğrafı Değiştir' : 'Fotoğraf Güncelle'}
                                </label>
                            </div>
                        </div>
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="text-center mb-6">
                            <GraduationCap className="mx-auto text-blue-600 mb-2" size={40} />
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Eğitim Bilgileri</h3>
                            <p className="text-slate-500 font-medium mt-1">Akademik geçmişinizi güncelleyin</p>
                        </div>

                        <Input
                            label="Mezuniyet Okulu"
                            required
                            value={formData.mezuniyetOkul}
                            onChange={(e) => setFormData({ ...formData, mezuniyetOkul: e.target.value })}
                            placeholder="Hacettepe Üniversitesi"
                        />
                        <Input
                            label="Mezuniyet Yılı"
                            type="number"
                            required
                            value={formData.mezuniyetYili}
                            onChange={(e) => setFormData({ ...formData, mezuniyetYili: e.target.value })}
                            placeholder="2015"
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Biyografi * <span className="text-slate-400">(Max 500 karakter)</span>
                            </label>
                            <textarea
                                required
                                value={formData.biyografi}
                                onChange={(e) => setFormData({ ...formData, biyografi: e.target.value })}
                                maxLength={500}
                                rows={6}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Kendinizden bahsedin, deneyimlerinizi paylaşın..."
                            />
                            <p className="text-sm text-slate-400 mt-1 text-right">{formData.biyografi.length}/500</p>
                        </div>
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="text-center mb-6">
                            <Award className="mx-auto text-blue-600 mb-2" size={40} />
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Uzmanlık Alanları</h3>
                            <p className="text-slate-500 font-medium mt-1">Uzmanlıklarınızı güncelleyin</p>
                        </div>

                        {Object.entries(EXPERTISE_OPTIONS).map(([category, options]) => (
                            <div key={category} className="bg-slate-50 p-5 rounded-2xl">
                                <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4">
                                    {category === 'vucutBolgesi' && 'Vücut Bölgesi'}
                                    {category === 'tedaviYontemleri' && 'Tedavi Yöntemleri'}
                                    {category === 'ozelAlanlar' && 'Özel Alanlar'}
                                    {category === 'hastaliklar' && 'Hastalıklar'}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {options.map(option => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => toggleExpertise(category, option)}
                                            className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                                                isSelected(category, option)
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                                    : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
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
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="text-center mb-6">
                            <FileText className="mx-auto text-blue-600 mb-2" size={40} />
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Sertifikalar</h3>
                            <p className="text-slate-500 font-medium mt-1">Sertifikalarınızı güncelleyin</p>
                        </div>

                        {formData.sertifikalar.map((cert, index) => (
                            <div key={index} className="bg-slate-50 p-5 rounded-2xl relative">
                                <button
                                    type="button"
                                    onClick={() => removeCertificate(index)}
                                    className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="space-y-3">
                                    <Input
                                        label={`Sertifika ${index + 1} Adı`}
                                        value={cert.adi}
                                        onChange={(e) => updateCertificate(index, 'adi', e.target.value)}
                                        placeholder="Spor Fizyoterapisi Sertifikası"
                                    />
                                    {cert.dosya_url && !cert.dosya && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200">
                                            <FileText size={14} className="text-blue-500" />
                                            <span>Mevcut dosya yüklü</span>
                                            <a href={cert.dosya_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-auto text-xs">Görüntüle</a>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            {cert.dosya_url ? 'Dosyayı Değiştir (Opsiyonel)' : 'Dosya Yükle'}
                                        </label>
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => updateCertificate(index, 'dosya', e.target.files[0])}
                                            className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {cert.dosya && (
                                            <p className="text-xs text-slate-500 mt-1">{cert.dosya.name}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addCertificate}
                            className="w-full"
                            disabled={formData.sertifikalar.length >= 10}
                        >
                            + Yeni Sertifika Ekle
                        </Button>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <button
                onClick={() => navigate('/uzman/profile')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm mb-6 transition-colors"
            >
                <ArrowLeft size={18} /> Profile Dön
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 p-8 md:p-10"
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Profili Düzenle</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Bilgilerinizi güncelleyin</p>
                </div>

                <div className="mb-8">
                    <div className="flex gap-2 mb-2">
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                                    step <= currentStep ? 'bg-blue-600' : 'bg-slate-100'
                                }`}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        Adım {currentStep} / {totalSteps}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-medium">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-2xl mb-6 text-sm font-bold">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {renderStep()}

                    <div className="flex gap-4 mt-10">
                        {currentStep > 1 && (
                            <Button type="button" variant="outline" onClick={handlePrev} className="flex-1" size="lg">
                                <ChevronLeft size={20} /> Geri
                            </Button>
                        )}
                        {currentStep < totalSteps ? (
                            <Button type="button" onClick={handleNext} className="flex-1" size="lg">
                                Devam Et <ChevronRight size={20} />
                            </Button>
                        ) : (
                            <Button type="submit" loading={loading} className="flex-1 bg-blue-600 hover:bg-blue-700" size="lg">
                                <Save size={18} /> Değişiklikleri Kaydet
                            </Button>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
}