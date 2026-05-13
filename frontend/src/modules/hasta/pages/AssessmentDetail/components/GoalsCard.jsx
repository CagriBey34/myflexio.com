import { Target, Timer, MessageSquare, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GoalsCard({ assessment }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden"
        >
            <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                    <Target size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Hedefler & Beklentiler</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
                {/* Sol: Hedefler Listesi */}
                <div className="space-y-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tedavi Hedefleri</p>
                    <div className="space-y-2">
                        {assessment.treatment_goals.map((goal, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-600 transition-all">
                                <ChevronRight size={14} className="text-blue-500" />
                                <span className="text-sm font-bold text-slate-700">{goal}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sağ: Süre ve Notlar */}
                <div className="space-y-8">
                    <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Timer size={18} className="text-blue-400" />
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Beklenen İyileşme</p>
                        </div>
                        <p className="text-lg font-black italic tracking-tighter">{assessment.expected_duration}</p>
                    </div>

                    {assessment.additional_notes && (
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 italic relative">
                            <MessageSquare size={16} className="text-slate-200 absolute top-4 right-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ek Notlar</p>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed">"{assessment.additional_notes}"</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}