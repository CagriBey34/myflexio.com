import { motion } from 'framer-motion';
import { User, Calendar, Quote } from 'lucide-react';
import StarRating from '../../../../../shared/components/ui/StarRating';

export default function ReviewTimelineItem({ review, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-blue-100/20 transition-all relative"
    >
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 font-black italic text-xl">
            {review.hastaAd?.[0]}
          </div>
          <div>
            <h4 className="font-black text-slate-900 tracking-tight">{review.hastaAd}</h4>
            <div className="flex items-center gap-3 mt-1">
                <StarRating rating={review.rating} size={12} />
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar size={12} className="text-blue-500" />
                    {new Date(review.created_at).toLocaleDateString('tr-TR')}
                </div>
            </div>
          </div>
        </div>
      </div>

      {review.comment && (
        <div className="mt-6 relative">
            <Quote className="absolute -top-2 -left-2 text-blue-100" size={32} />
            <p className="text-slate-600 font-medium leading-relaxed italic text-sm pl-6 relative z-10">
                "{review.comment}"
            </p>
        </div>
      )}
    </motion.div>
  );
}