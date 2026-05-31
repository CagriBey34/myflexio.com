import { Plus, BookOpen } from 'lucide-react';
import Button from '../../../../../shared/components/ui/Button';

export default function ArticleHeader({ onNew }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <span className="inline-block text-[#16a34a] text-xs font-bold uppercase tracking-widest bg-[#dcfce7] px-4 py-2 rounded-full mb-3">
            İçeriklerinizi Yönetin
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-[#0a2e1a] leading-tight">Makalelerim</h1>
      </div>
      <Button 
        onClick={onNew}
        className="bg-[#0f4c35] hover:bg-[#16a34a] text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={18} /> Yeni Makale Yaz
      </Button>
    </div>
  );
}