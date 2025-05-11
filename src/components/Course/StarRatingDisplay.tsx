import StarIcon from "./StarIcon";

interface StarRatingDisplayProps {
  rating: number;
  totalStars?: number;
}

const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({ rating, totalStars = 5 }) => {
  const percentage = Math.max(0, Math.min(100, (rating / totalStars) * 100)); // Đảm bảo tỷ lệ từ 0 đến 100

  return (
    <div className="relative inline-flex" aria-label={`Rating: ${rating} out of ${totalStars} stars`}>
      {/* Các ngôi sao nền (màu xám) */}
      <div className="flex">
        {[...Array(totalStars)].map((_, i) => (
          <StarIcon key={`empty-${i}`} className="text-gray-300" />
        ))}
      </div>
      {/* Các ngôi sao được tô màu (vàng), được cắt theo tỷ lệ */}
      <div
        className="absolute top-0 left-0 h-full overflow-hidden flex"
        style={{ width: `${percentage}%` }}
      >
        {[...Array(totalStars)].map((_, i) => (
          // flex-shrink-0 rất quan trọng để các ngôi sao không bị co lại bên trong vùng cắt
          <StarIcon key={`filled-${i}`} className="text-yellow-400 flex-shrink-0" />
        ))}
      </div>
    </div>
  );
};

export default StarRatingDisplay;