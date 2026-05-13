import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssessment } from '../../services/assessmentService';

// Alt Bileşenler
import DetailHeader from './components/DetailHeader';
import PainProfileCard from './components/PainProfileCard';
import FunctionalImpactCard from './components/FunctionalImpactCard';
import TriggersCard from './components/TriggersCard';
import GoalsCard from './components/GoalsCard';
import RecommendationsCard from './components/RecommendationsCard';

export default function AssessmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAssessment(); }, [id]);

    const fetchAssessment = async () => {
        try {
            const response = await getAssessment(id);
            setAssessment(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Rapor Hazırlanıyor...</p>
        </div>
    );

    if (!assessment) return (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-black italic">Değerlendirme Bulunamadı</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <DetailHeader 
                region={assessment.pain_region} 
                date={assessment.created_at} 
                onBack={() => navigate('/hasta/assessment')} 
            />

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Sol Sütun: Profil ve Etkiler */}
                <div className="lg:col-span-7 space-y-8">
                    <PainProfileCard assessment={assessment} />
                    <FunctionalImpactCard assessment={assessment} />
                    <GoalsCard assessment={assessment} />
                </div>

                {/* Sağ Sütun: Tetikleyiciler ve Öneriler */}
                <div className="lg:col-span-5 space-y-8">
                    <RecommendationsCard recommendations={assessment.recommended_specialists} />
                    <TriggersCard assessment={assessment} />
                </div>
            </div>
        </div>
    );
}