import StarIcon from "./StarIcon";

interface StarRatingDisplayProps {
  rating: number;
  totalStars?: number;
}

const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({ rating, totalStars = 5 }) => {
  const percentage = Math.max(0, Math.min(100, (rating / totalStars) * 100));

  return (
    <div className="relative inline-flex" aria-label={`Rating: ${rating} out of ${totalStars} stars`}>
      <div className="flex">
        {[...Array(totalStars)].map((_, i) => (
          <StarIcon key={`empty-${i}`} className="text-gray-300" />
        ))}
      </div>
      <div
        className="absolute top-0 left-0 h-full overflow-hidden flex"
        style={{ width: `${percentage}%` }}
      >
        {[...Array(totalStars)].map((_, i) => (
          <StarIcon key={`filled-${i}`} className="text-yellow-400 flex-shrink-0" />
        ))}
      </div>
    </div>
  );
};

export default StarRatingDisplay;