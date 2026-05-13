// components/AssessmentCard.jsx
import { motion } from 'framer-motion';

export default function AssessmentCard({ assessment, index, onClick }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={onClick} // Ana tıklama burada
            className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-blue-100/50 transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
        >
            {/* Kart içeriği buraya gelecek */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <span className="font-black text-slate-900">{assessment.pain_region} Analizi</span>
                </div>
                <div className="text-blue-600 font-bold uppercase text-xs">Detaylar →</div>
            </div>
        </motion.div>
    );
}