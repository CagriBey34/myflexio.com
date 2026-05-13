import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssessments } from '../../services/assessmentService';

// Alt Bileşenler
import AssessmentHeader from './components/AssessmentHeader';
import AssessmentCard from './components/AssessmentCard';
import AssessmentEmptyState from './components/AssessmentEmptyState';

export default function AssessmentList() {
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        try {
            setLoading(true);
            const response = await getAssessments();
            // Backend'den gelen verinin yapısına göre kontrol (genelde response.data veya response.data.data)
            const data = response.data?.data || response.data || [];
            setAssessments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Veri çekme hatası:', error);
            setAssessments([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Paylaştığın Header Bileşeni */}
            <AssessmentHeader onNew={() => navigate('/hasta/assessment/new')} />

            <div className="relative">
                {loading ? (
                    // Loading Durumu
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : assessments.length === 0 ? (
                    // Veri Yoksa
                    <AssessmentEmptyState onNew={() => navigate('/hasta/assessment/new')} />
                ) : (
                    // Veri Varsa Liste
                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence>
                            {assessments.map((item, index) => (
                                <AssessmentCard 
                                    key={item.id || index} 
                                    assessment={item} 
                                    index={index}
                                    // Tıklama Olayı: Buradaki ID'nin doğruluğundan emin ol
                                    onClick={() => navigate(`/hasta/assessment/${item.id}`)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}