import { BookOpen, Plus } from 'lucide-react';
import Button from '../../../../../shared/components/ui/Button';

export default function ArticleEmptyState({ onNew }) {
  return (
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-16 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-inner">
            <BookOpen size={40} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic mb-2">Henüz Makaleniz Yok</h3>
        <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto mb-8">Bilgi ve deneyimlerinizi paylaşarak hastalarınıza rehberlik edin ve görünürlüğünüzü artırın.</p>
        <Button onClick={onNew} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">
            İlk Makalemi Yazayım
        </Button>
    </div>
  );
}