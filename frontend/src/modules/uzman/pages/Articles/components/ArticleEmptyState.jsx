import { BookOpen, Plus } from 'lucide-react';
import Button from '../../../../../shared/components/ui/Button';

export default function ArticleEmptyState({ onNew }) {
  return (
    <div className="bg-white border-2 border-dashed border-gray-200 rounded-[3rem] p-12 md:p-16 text-center shadow-sm">
        <div className="w-24 h-24 bg-[#dcfce7] rounded-[2.5rem] flex items-center justify-center text-[#16a34a] mx-auto mb-6 shadow-inner">
            <BookOpen size={48} />
        </div>
        <h3 className="text-3xl font-black text-[#0a2e1a] tracking-tight mb-3">Henüz Makaleniz Yok</h3>
        <p className="text-gray-500 font-medium text-sm max-w-md mx-auto mb-10 leading-relaxed">
            Bilgi ve deneyimlerinizi paylaşarak hastalarınıza rehberlik edin ve platformdaki görünürlüğünüzü artırın.
        </p>
        <Button onClick={onNew} className="bg-[#4ade80] hover:bg-[#22c55e] text-[#0a2e1a] px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest shadow-lg shadow-green-500/20 transition-all">
            İlk Makalemi Yazayım
        </Button>
    </div>
  );
}