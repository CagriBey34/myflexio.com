import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { completeProfile, uploadMedicalReport, getProfile } from '../../services/hastaService';

// Alt Bileşenler
import Step1Location from './components/Step1Location';
import Step2MedicalHistory from './components/Step2MedicalHistory';
import Step3ReportUpload from './components/Step3ReportUpload';
import StepIndicator from './components/StepIndicator';

export default function CompleteProfile() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        sehir: '', ilce: '', dogumTarihi: '', cinsiyet: '',
        agriBolgesi: [], tedaviTercihi: '', agriSeviyesi: 5,
        ameliyatGecmisi: false, ameliyatDetay: '',
        kronikHastalik: false, kronikHastalikDetay: '',
        surekliIlac: false, ilacListesi: '', alerjiler: '',
        medicalReport: null, reportType: 'diger', reportDescription: '',
    });

    useEffect(() => {
        const loadExisting = async () => {
            try {
                const res = await getProfile();
                const p = res.data;
                if (p?.profile_completed_at) {
                    let dogumTarihi = '';
                    if (p.dogum_tarihi) {
                        dogumTarihi = p.dogum_tarihi.split('T')[0];
                    }
                    setFormData(prev => ({
                        ...prev,
                        sehir: p.sehir || '',
                        ilce: p.ilce || '',
                        dogumTarihi,
                        cinsiyet: p.cinsiyet || '',
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
                    }));
                }
            } catch {
                // profil yoksa boş başlar
            } finally {
                setInitLoading(false);
            }
        };
        loadExisting();
    }, []);

    const totalSteps = 3;

    const handleNext = () => {
        if (currentStep === 1) {
            if (!formData.sehir || !formData.ilce || !formData.dogumTarihi || !formData.cinsiyet || formData.agriBolgesi.length === 0 || !formData.tedaviTercihi) {
                setError('Lütfen zorunlu alanları eksiksiz doldurun.');
                return;
            }
        }
        setError('');
        setCurrentStep(prev => prev + 1);
    };

    const submitProfile = async (includeReport = true) => {
        setError('');
        setLoading(true);
        try {
            await completeProfile({
                ...formData,
                agriBolgesi: formData.agriBolgesi.join(', '),
            });

            if (includeReport && formData.medicalReport) {
                await uploadMedicalReport(formData.medicalReport, {
                    tip: formData.reportType,
                    aciklama: formData.reportDescription,
                });
            }
            navigate('/hasta/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Profil tamamlanırken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (initLoading) {
        return (
            <div className="w-full h-[calc(100dvh-120px)] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full h-[calc(100dvh-120px)] flex items-center justify-center px-4 overflow-hidden">
            <motion.div 
                layout
                className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-2xl shadow-blue-100/50 max-w-3xl w-full flex flex-col h-full max-h-[850px] overflow-hidden"
            >
                {/* Progress Header */}
                <div className="p-8 pb-0 shrink-0">
                    <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
                </div>

                {/* Status Bar */}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="mx-8 mt-4 p-3 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center border border-red-100">
                            ⚠️ {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Steps Area */}
                <div className="flex-1 overflow-y-auto p-8 pt-4 scrollbar-thin scrollbar-thumb-blue-100">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && <Step1Location key={1} formData={formData} setFormData={setFormData} onNext={handleNext} />}
                        {currentStep === 2 && <Step2MedicalHistory key={2} formData={formData} setFormData={setFormData} onNext={handleNext} onPrev={() => setCurrentStep(1)} />}
                        {currentStep === 3 && <Step3ReportUpload key={3} formData={formData} setFormData={setFormData} onPrev={() => setCurrentStep(2)} onSubmit={submitProfile} loading={loading} />}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
