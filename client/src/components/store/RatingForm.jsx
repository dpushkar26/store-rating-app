import { useState } from 'react';
import api from '../../services/api';
import { Star } from 'lucide-react';

const RatingForm = ({ storeId, initialRating, onRatingUpdate }) => {
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(initialRating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = async (score) => {
    try {
      setIsSubmitting(true);
      setRating(score);
      
      await api.put(`/ratings/${storeId}`, { score });
      if (onRatingUpdate) onRatingUpdate();
    } catch (error) {
      console.error('Failed to submit rating:', error);
      setRating(initialRating || 0);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeScore = hover || rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeScore;
          return (
            <button
              key={star}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-0.5 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-transform active:scale-90 hover:scale-125 disabled:cursor-not-allowed disabled:opacity-50"
              title={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`w-5 h-5 transition-all duration-150 ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              />
            </button>
          );
        })}
      </div>

      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
        {rating > 0 ? (
          <span className="text-amber-400 font-bold">{rating}/5★</span>
        ) : (
          <span className="text-slate-400">Click to rate</span>
        )}
      </span>
    </div>
  );
};

export default RatingForm;