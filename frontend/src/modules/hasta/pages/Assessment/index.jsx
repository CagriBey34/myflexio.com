import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createAssessment } from '../../services/assessmentService';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';

// Alt Bileşenler
import Step1PainProfile from './components/Step1PainProfile';
import Step2FunctionalImpact from './components/Step2FunctionalImpact';
import Step3Triggers from './components/Step3Triggers';
import Step4Goals from './components/Step4Goals';
import StepIndicator from './components/StepIndicator';

export default function Assessment() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    painRegion: '', painSeverity: 3, painDuration: '', painTypes: [],
    dailyActivitiesImpact: 3, sleepImpact: 3, workImpact: 3, socialImpact: 3,
    painTriggers: [], customTrigger: '', painRelievers: [], customReliever: '',
    treatmentGoals: [], expectedDuration: '', additionalNotes: '',
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep === 1) {
        const isRegionEmpty = !formData.painRegion || formData.painRegion.trim() === '';
        const isDurationEmpty = !formData.painDuration;
        const isTypesEmpty = !formData.painTypes || formData.painTypes.length === 0;

        if (isRegionEmpty || isDurationEmpty || isTypesEmpty) {
            setError('Lütfen bölge, süre ve en az bir ağrı tipi seçtiğinizden emin olun.');
            return;
        }
    }
    setError('');
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalTriggers = [...formData.painTriggers, formData.customTrigger].filter(Boolean);
      const finalRelievers = [...formData.painRelievers, formData.customReliever].filter(Boolean);

      const response = await createAssessment({ ...formData, painTriggers: finalTriggers, painRelievers: finalRelievers });
      navigate(`/hasta/assessment/${response.data.assessmentId}/result`);
    } catch (err) {
      setError(err.response?.data?.message || 'Hata oluştu');
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full h-[calc(100dvh-120px)] flex items-center justify-center px-4 overflow-hidden">
      <motion.div layout className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-2xl shadow-blue-100/50 max-w-2xl w-full flex flex-col h-full max-h-[850px]">
        
        <div className="p-8 pb-0 shrink-0">
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        {error && <div className="mx-8 mt-4 p-3 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center border border-red-100">{error}</div>}

        <div className="flex-1 overflow-y-auto p-8 pt-4 scrollbar-thin scrollbar-thumb-blue-100">
          <AnimatePresence mode="wait">
            {currentStep === 1 && <Step1PainProfile key={1} formData={formData} setFormData={setFormData} />}
            {currentStep === 2 && <Step2FunctionalImpact key={2} formData={formData} setFormData={setFormData} />}
            {currentStep === 3 && <Step3Triggers key={3} formData={formData} setFormData={setFormData} />}
            {currentStep === 4 && <Step4Goals key={4} formData={formData} setFormData={setFormData} />}
          </AnimatePresence>
        </div>

        <div className="p-8 pt-0 shrink-0 flex gap-4">
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)} className="flex-1 rounded-2xl py-4 border-2 border-slate-100">
              <ChevronLeft size={20} className="mr-2" /> Geri
            </Button>
          )}
          {currentStep < totalSteps ? (
            <Button onClick={handleNext} className="flex-1 bg-slate-900 text-white rounded-2xl py-4">
              Devam Et <ChevronRight size={20} className="ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading} className="flex-1 bg-blue-600 text-white rounded-2xl py-4 shadow-xl shadow-blue-100">
              Değerlendirmeyi Bitir
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}