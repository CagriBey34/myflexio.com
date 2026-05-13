import StarRating from '../../../../../shared/components/ui/StarRating';

export default function ReviewItem({ review, onEdit, onDelete }) {
  return (
    <div className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center font-black text-blue-600 text-xs italic">
                {review.hastaAd?.[0]}
            </div>
            <div>
                <p className="font-bold text-slate-900 text-sm">{review.hastaAd}</p>
                <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} size={12} />
                    <span className="text-[10px] font-bold text-slate-400">
                        {new Date(review.created_at).toLocaleDateString('tr-TR')}
                    </span>
                </div>
            </div>
        </div>
        {review.isOwn && (
          <div className="flex gap-4">
            <button onClick={onEdit} className="text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:underline">Düzenle</button>
            <button onClick={onDelete} className="text-[10px] font-black text-red-500 uppercase tracking-tighter hover:underline">Sil</button>
          </div>
        )}
      </div>
      {review.comment && (
        <p className="text-slate-600 text-sm leading-relaxed ml-13 font-medium bg-slate-50 p-4 rounded-2xl italic border border-slate-100">
            "{review.comment}"
        </p>
      )}
    </div>
  );
}