import { Zap, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TriggersCard({ assessment }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden"
        >
            <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
                    <Zap size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Tetikleyici Analizi</h2>
            </div>

            <div className="space-y-10">
                {/* Artıranlar */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                        <AlertTriangle size={14} /> Ağrıyı Şiddetlendirenler
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {assessment.pain_triggers.map((trigger, idx) => (
                            <span key={idx} className="px-4 py-2 bg-red-50 text-red-700 rounded-2xl text-[11px] font-black border border-red-100 shadow-sm">
                                {trigger}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Azaltanlar */}
                <div className="space-y-4 pt-6 border-t border-slate-50">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                        <ShieldCheck size={14} /> Rahatlatan Faktörler
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {assessment.pain_relievers.map((reliever, idx) => (
                            <span key={idx} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-[11px] font-black border border-emerald-100 shadow-sm">
                                {reliever}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}