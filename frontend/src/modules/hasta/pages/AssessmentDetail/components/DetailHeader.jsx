import { ArrowLeft, Calendar, Activity } from 'lucide-react';
import Button from '../../../../../shared/components/ui/Button';

export default function DetailHeader({ region, date, onBack }) {
    const formattedDate = new Date(date).toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <button onClick={onBack} className="w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">
                        {region} Analizi
                    </h1>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                        <Calendar size={14} className="text-blue-500" />
                        {formattedDate}
                    </div>
                </div>
            </div>
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-2">
                <Activity size={18} className="animate-pulse" />
                <span className="text-xs font-black uppercase">Tamamlanmış Rapor</span>
            </div>
        </div>
    );
}