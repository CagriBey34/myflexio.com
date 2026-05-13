import { FileText, Plus, Activity } from 'lucide-react';
import Button from '../../../../../shared/components/ui/Button';

export default function AssessmentEmptyState({ onNew }) {
    return (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
                <Activity size={400} className="text-blue-600" />
            </div>
            
            <div className="relative z-10">
                <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto mb-8 shadow-inner">
                    <FileText size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic mb-4">
                    Henüz Değerlendirme Yok
                </h2>
                <p className="text-slate-500 font-bold text-sm max-w-sm mx-auto mb-10 leading-relaxed">
                    Size en uygun uzmanları yapay zeka ile eşleştirebilmemiz için ilk ağrı değerlendirmenizi şimdi yapın.
                </p>
                <Button
                    onClick={onNew}
                    className="bg-slate-900 hover:bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 mx-auto transition-all"
                >
                    <Plus size={20} /> İlk Değerlendirmeyi Yap
                </Button>
            </div>
        </div>
    );
}