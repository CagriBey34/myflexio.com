import { Award, ChevronRight, TrendingUp } from 'lucide-react';

export default function RecommendationsCard({ recommendations }) {
    if (!recommendations || recommendations.length === 0) return null;

    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <TrendingUp size={120} className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Award size={20} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Uzman Önerileri</h2>
            </div>

            <div className="space-y-4 relative z-10">
                {recommendations.map((specialist, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all group/item">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-blue-400 uppercase tracking-widest text-sm">{specialist.type}</h3>
                            <div className="text-right leading-none">
                                <p className="text-2xl font-black text-white italic">%{specialist.score}</p>
                                <p className="text-[8px] font-black text-slate-500 uppercase">Uyumluluk</p>
                            </div>
                        </div>
                        {specialist.matchReasons && (
                            <div className="space-y-2">
                                {specialist.matchReasons.map((reason, ridx) => (
                                    <p key={ridx} className="text-[11px] font-medium text-slate-400 flex items-center gap-2 italic">
                                        <ChevronRight size={12} className="text-blue-500" /> {reason}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}