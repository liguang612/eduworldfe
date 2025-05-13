// RatingStars.tsx (Phiên bản cập nhật hỗ trợ điểm lẻ)
import React from 'react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating, maxRating = 5 }) => {
  const clampedRating = Math.max(0, Math.min(rating, maxRating));
  const percentage = (clampedRating / maxRating) * 100;

  const starSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
      <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
    </svg>
  );

  return (
    <div
      className="relative inline-flex"
      aria-label={`Rating: ${clampedRating.toFixed(1)} out of ${maxRating} stars`}
    >
      <div className="flex gap-0.5">
        {[...Array(maxRating)].map((_, i) => (
          <div key={`empty-${i}`} className="text-[#aec2d5]">
            {starSvg}
          </div>
        ))}
      </div>

      <div
        className="absolute top-0 left-0 h-full overflow-hidden flex gap-0.5"
        style={{ width: `${percentage}%` }}
      >
        {[...Array(maxRating)].map((_, i) => (
          <div key={`filled-${i}`} className="text-[#1980e6] flex-shrink-0">
            {starSvg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingStars;