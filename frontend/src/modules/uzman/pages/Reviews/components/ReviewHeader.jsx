import { MessageSquare, Star, TrendingUp } from 'lucide-react';

export default function ReviewHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
           Hasta Değerlendirmeleri
        </h1>
        <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
          Hizmet kalitenizi ve hasta memnuniyetini takip edin
        </p>
      </div>

      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 px-5 py-3 rounded-2xl">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
          <TrendingUp size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Performans</p>
          <p className="text-sm font-black text-emerald-900 mt-1 italic">Yükselişte</p>
        </div>
      </div>
    </div>
  );
}