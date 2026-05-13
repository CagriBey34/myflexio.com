
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const PAIN_EMOJIS = ['😊', '🙂', '😐', '😣', '😫'];

export default function FunctionalImpactCard({ assessment }) {
    const impacts = [
        { label: 'Günlük Aktiviteler', value: assessment.daily_activities_impact, color: 'bg-blue-500' },
        { label: 'Uyku Kalitesi', value: assessment.sleep_impact, color: 'bg-indigo-500' },
        { label: 'İş Performansı', value: assessment.work_impact, color: 'bg-violet-500' },
        { label: 'Sosyal Hayat', value: assessment.social_impact, color: 'bg-purple-500' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden"
        >
            <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                    <Activity size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Fonksiyonel Etki Analizi</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {impacts.map((impact, idx) => (
                    <div key={idx} className="space-y-4">
                        <div className="flex justify-between items-end px-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                {impact.label}
                            </p>
                            <div className="flex items-center gap-2 leading-none">
                                <span className="text-xl">{PAIN_EMOJIS[impact.value - 1]}</span>
                                <span className="text-lg font-black text-slate-900 tracking-tighter">
                                    {impact.value}<span className="text-slate-300 text-xs">/5</span>
                                </span>
                            </div>
                        </div>

                        {/* Custom Progress Bar */}
                        <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(impact.value / 5) * 100}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className={`h-full rounded-full ${impact.color} shadow-lg shadow-blue-100`}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Alt Bilgi Badge */}
            <div className="mt-10 pt-6 border-t border-slate-50 flex justify-center">
                <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Yaşam Kalitesi Skorlaması
                    </p>
                </div>
            </div>
        </motion.div>
    );
}