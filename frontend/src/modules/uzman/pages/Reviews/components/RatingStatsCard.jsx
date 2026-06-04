import { motion } from 'framer-motion';
import StarRating from '../../../../../shared/components/ui/StarRating';

export default function RatingStatsCard({ avgRating, total }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-900 h-full rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 md:p-10 text-center text-white shadow-2xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <StarRating rating={5} size={100} />
      </div>
      
      <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Genel Puan Ortalama</p>
      <div className="text-5xl sm:text-6xl md:text-7xl font-black italic tracking-tighter mb-4">
        {avgRating.toFixed(1)}
      </div>
      <div className="flex justify-center mb-6">
        <StarRating rating={Math.round(avgRating)} size={24} />
      </div>
      <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/5">
        {total} Toplam Yorum
      </div>
    </motion.div>
  );
}