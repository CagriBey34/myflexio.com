import { Plus, BookOpen } from 'lucide-react';
import Button from '../../../../../shared/components/ui/Button';

export default function ArticleHeader({ onNew }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Makalelerim</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">İçeriklerinizi Yönetin ve Performansını Takip Edin</p>
      </div>
      <Button 
        onClick={onNew}
        className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-2"
      >
        <Plus size={18} /> Yeni Makale Yaz
      </Button>
    </div>
  );
}