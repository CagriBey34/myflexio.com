import { Activity, Zap } from 'lucide-react';
const PAIN_EMOJIS = ['😊', '🙂', '😐', '😣', '😫'];

export default function PainProfileCard({ assessment }) {
    return (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Activity size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Ağrı Profili</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Şiddet & His</p>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-5xl">{PAIN_EMOJIS[assessment.pain_severity - 1]}</span>
                        <span className="text-2xl font-black text-slate-900">{assessment.pain_severity}<span className="text-slate-300 text-sm">/5</span></span>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ağrı Süresi</p>
                        <p className="font-bold text-slate-700">{assessment.pain_duration}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ağrı Tipi</p>
                        <div className="flex flex-wrap gap-2">
                            {assessment.pain_types.map((type, i) => (
                                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black border border-blue-100">{type}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}