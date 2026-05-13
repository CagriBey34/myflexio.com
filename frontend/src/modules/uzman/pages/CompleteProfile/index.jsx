import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, GraduationCap, Award, FileText, ChevronRight, ChevronLeft, Upload, X } from 'lucide-react';
import { completeProfile } from '../../services/uzmanService';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';

// Expertise options
const EXPERTISE_OPTIONS = {
    vucutBolgesi: ['Bel', 'Boyun', 'Omuz', 'Diz', 'Kalça', 'Ayak Bileği', 'Dirsek', 'Bilek', 'El', 'Sırt', 'Kol', 'Bacak'],
    tedaviYontemleri: ['Manuel Terapi', 'Egzersiz Terapisi', 'Elektroterapi', 'Hidroterapi', 'Masaj', 'Akupunktur', 'Kuru İğneleme'],
    ozelAlanlar: ['Spor Yaralanmaları', 'Geriatri', 'Pediatri', 'Nörolojik Rehabilitasyon', 'Ortopedik Rehabilitasyon', 'Kardiyak Rehabilitasyon'],
    hastaliklar: ['Skolyoz', 'Disk Hernisi', 'Tendinit', 'Artrit', 'Fibromiyalji', 'Osteoporoz']
};

export default function CompleteProfile() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [photoPreview, setPhotoPreview] = useState(null);

    const [formData, setFormData] = useState({
        // Step 1: Personal Info
        dogumTarihi: '',
        cinsiyet: '',
        sehir: '',
        ilce: '',
        profilFotograf: null,

        // Step 2: Education
        mezuniyetOkul: '',
        mezuniyetYili: '',
        biyografi: '',

        // Step 3: Expertise
        uzmanlikAlanlari: {
            vucutBolgesi: [],
            tedaviYontemleri: [],
            ozelAlanlar: [],
            hastaliklar: []
        },

        // Step 4: Certificates
        sertifikalar: []
    });

    const totalSteps = 4;

    const toggleExpertise = (category, value) => {
        const current = formData.uzmanlikAlanlari[category];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];

        setFormData({
            ...formData,
            uzmanlikAlanlari: {
                ...formData.uzmanlikAlanlari,
                [category]: updated
            }
        });
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
            sertifikalar: [...formData.sertifikalar, { adi: '', dosya: null }]
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

        // Validation
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
            const hasSelection = Object.values(formData.uzmanlikAlanlari).some(arr => arr.length > 0);
            if (!hasSelection) {
                setError('Lütfen en az bir uzmanlık alanı seçin');
                return;
            }
        }

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const submitData = new FormData();

            // Personal info
            submitData.append('dogumTarihi', formData.dogumTarihi);
            submitData.append('cinsiyet', formData.cinsiyet);
            submitData.append('sehir', formData.sehir);
            submitData.append('ilce', formData.ilce);
            if (formData.profilFotograf) {
                submitData.append('profilFotograf', formData.profilFotograf);
            }

            // Education
            submitData.append('mezuniyetOkul', formData.mezuniyetOkul);
            submitData.append('mezuniyetYili', formData.mezuniyetYili);
            submitData.append('biyografi', formData.biyografi);

            // Expertise
            submitData.append('uzmanlikAlanlari', JSON.stringify(formData.uzmanlikAlanlari));

            // Certificates
            if (formData.sertifikalar.length > 0) {
                const certData = formData.sertifikalar.map(cert => ({ adi: cert.adi }));
                submitData.append('sertifikalar', JSON.stringify(certData));

                formData.sertifikalar.forEach(cert => {
                    if (cert.dosya) {
                        submitData.append('sertifika', cert.dosya);
                    }
                });
            }

            await completeProfile(submitData);

            alert('Profil başarıyla tamamlandı!');
            navigate('/uzman/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Profil tamamlanırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="text-center mb-6">
                            <User className="mx-auto text-primary-600 mb-2" size={40} />
                            <h3 className="text-2xl font-bold text-gray-900">Kişisel Bilgiler</h3>
                            <p className="text-gray-600 mt-2">Temel bilgilerinizi girin</p>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cinsiyet *</label>
                                <select
                                    required
                                    value={formData.cinsiyet}
                                    onChange={(e) => setFormData({ ...formData, cinsiyet: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Profil Fotoğrafı (Opsiyonel)</label>
                            <div className="flex items-center gap-4">
                                {photoPreview && (
                                    <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                    id="photo-upload"
                                />
                                <label
                                    htmlFor="photo-upload"
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                                >
                                    <Upload size={20} />
                                    {formData.profilFotograf ? 'Fotoğrafı Değiştir' : 'Fotoğraf Yükle'}
                                </label>
                            </div>
                        </div>
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="text-center mb-6">
                            <GraduationCap className="mx-auto text-primary-600 mb-2" size={40} />
                            <h3 className="text-2xl font-bold text-gray-900">Eğitim Bilgileri</h3>
                            <p className="text-gray-600 mt-2">Akademik geçmişiniz</p>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Biyografi * (Max 500 karakter)
                            </label>
                            <textarea
                                required
                                value={formData.biyografi}
                                onChange={(e) => setFormData({ ...formData, biyografi: e.target.value })}
                                maxLength={500}
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="Kendinizden bahsedin, deneyimlerinizi paylaşın..."
                            />
                            <p className="text-sm text-gray-500 mt-1">{formData.biyografi.length}/500</p>
                        </div>
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="text-center mb-6">
                            <Award className="mx-auto text-primary-600 mb-2" size={40} />
                            <h3 className="text-2xl font-bold text-gray-900">Uzmanlık Alanları</h3>
                            <p className="text-gray-600 mt-2">Hangi alanlarda uzmanlaştınız?</p>
                        </div>

                        {Object.entries(EXPERTISE_OPTIONS).map(([category, options]) => (
                            <div key={category} className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-3">
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
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.uzmanlikAlanlari[category].includes(option)
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100'
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
                            <FileText className="mx-auto text-primary-600 mb-2" size={40} />
                            <h3 className="text-2xl font-bold text-gray-900">Sertifikalar</h3>
                            <p className="text-gray-600 mt-2">Sertifikalarınızı ekleyin (Opsiyonel)</p>
                        </div>

                        {formData.sertifikalar.map((cert, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg relative">
                                <button
                                    type="button"
                                    onClick={() => removeCertificate(index)}
                                    className="absolute top-2 right-2 text-red-600 hover:text-red-700"
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Dosya</label>
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => updateCertificate(index, 'dosya', e.target.files[0])}
                                            className="w-full"
                                        />
                                        {cert.dosya && (
                                            <p className="text-sm text-gray-600 mt-1">{cert.dosya.name}</p>
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
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-2xl p-8"
                >
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            {[1, 2, 3, 4].map((step) => (
                                <div
                                    key={step}
                                    className={`flex-1 h-2 rounded-full mx-1 transition-colors ${step <= currentStep ? 'bg-primary-600' : 'bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-center text-sm text-gray-600">Adım {currentStep} / {totalSteps}</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {renderStep()}

                        {/* Navigation */}
                        <div className="flex gap-4 mt-8">
                            {currentStep > 1 && (
                                <Button type="button" variant="outline" onClick={handlePrev} className="flex-1" size="lg">
                                    <ChevronLeft size={20} />
                                    Geri
                                </Button>
                            )}

                            {currentStep < totalSteps ? (
                                <Button type="button" onClick={handleNext} className="flex-1" size="lg">
                                    Devam Et
                                    <ChevronRight size={20} />
                                </Button>
                            ) : (
                                <Button type="submit" loading={loading} className="flex-1" size="lg">
                                    Profili Tamamla
                                </Button>
                            )}
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
