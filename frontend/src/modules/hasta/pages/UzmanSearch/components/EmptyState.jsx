import { motion } from 'framer-motion';
import { SearchX, RotateCcw, Activity } from 'lucide-react';
import Button from '../../../../../shared/components/ui/Button';

export default function EmptyState({ onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden"
    >
      {/* Arka Plan Süsü */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
        <Activity size={400} className="text-blue-600" />
      </div>

      <div className="relative z-10 max-w-sm mx-auto">
        {/* İkon Alanı */}
        <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto mb-8 shadow-inner">
          <SearchX size={40} strokeWidth={1.5} />
        </div>

        {/* Metinler */}
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter mb-4 italic">
          Sonuç Bulunamadı
        </h3>
        <p className="text-slate-500 font-bold text-sm leading-relaxed mb-10">
          Arama kriterlerinize uygun bir uzman şu an yayında değil. 
          Daha geniş bir arama yaparak şansınızı tekrar deneyebilirsiniz.
        </p>

        {/* Aksiyon Butonu */}
        <Button
          onClick={onClear}
          className="bg-slate-900 hover:bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 mx-auto shadow-xl transition-all active:scale-95"
        >
          <RotateCcw size={18} /> Filtreleri Sıfırla
        </Button>
      </div>
    </motion.div>
  );
}