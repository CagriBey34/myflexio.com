import StarRating from '../../../../../shared/components/ui/StarRating';

export default function RatingSummary({ reviews }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
      <div className="text-center">
        <div className="text-6xl font-black text-slate-900 tracking-tighter mb-1">
          {reviews.avgRating.toFixed(1)}
        </div>
        <StarRating rating={Math.round(reviews.avgRating)} size={20} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">
          {reviews.totalReviews} Toplam Değerlendirme
        </p>
      </div>

      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviews.distribution[star] || 0;
          const percentage = reviews.totalReviews > 0 ? (count / reviews.totalReviews) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 w-4">{star}</span>
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }} />
              </div>
              <span className="text-[10px] font-black text-slate-400 w-4 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}