import { motion } from 'framer-motion';

export default function DistributionCard({ distribution, total }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white h-full rounded-[3rem] p-10 border border-slate-100 shadow-sm"
    >
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 italic">Puan Dağılım Analizi</h3>
      <div className="space-y-4">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-6">
              <span className="text-xs font-black text-slate-400 w-8">{star} ★</span>
              <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: (5 - star) * 0.1 }}
                  className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                />
              </div>
              <span className="text-xs font-black text-slate-700 w-20 text-right italic">
                {count} <span className="text-slate-300 font-medium">({percentage.toFixed(0)}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}