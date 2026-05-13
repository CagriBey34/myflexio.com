import { Plus, Activity } from 'lucide-react';
import Button from '../../../../../shared/components/ui/Button';

export default function AssessmentHeader({ onNew }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner shrink-0">
                    <Activity size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Değerlendirmelerim</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Ağrı ve İyileşme Takip Geçmişi</p>
                </div>
            </div>
            <Button
                onClick={onNew}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center gap-2 transition-all active:scale-95"
            >
                <Plus size={18} /> Yeni Değerlendirme
            </Button>
        </div>
    );
}