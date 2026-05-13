import { Star } from 'lucide-react';

export default function StarRating({ rating, size = 16, interactive = false, onChange }) {
    const stars = [1, 2, 3, 4, 5];

    const handleClick = (value) => {
        if (interactive && onChange) {
            onChange(value);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {stars.map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={`${star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                    onClick={() => handleClick(star)}
                />
            ))}
        </div>
    );
}
