import React, { useState } from 'react';
import type { Exam } from '@/api/examApi';
import ExamIcon from '@/assets/exam.svg';
import LoveIcon from '@/assets/love.svg';
import LoveFillIcon from '@/assets/love_fill.svg';
import { removeFavorite } from '@/api/favouriteApi';
import { addFavorite } from '@/api/favouriteApi';

interface ExamCardProps extends Exam {
  onToggleFavorite: (id: string, isFavorited: boolean) => void;
  onClick: (id: string) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({
  id,
  title,
  durationMinutes,
  openTime,
  closeTime,
  easyCount,
  mediumCount,
  hardCount,
  veryHardCount,
  easyScore,
  mediumScore,
  hardScore,
  veryHardScore,
  favourite,
  onClick,
}) => {
  const [isFavorited, setIsFavorited] = useState(favourite);

  const onToggleFavorite = async () => {
    if (isFavorited) {
      await removeFavorite(id, 4);
      setIsFavorited(false);
    } else {
      await addFavorite(id, 4);
      setIsFavorited(true);
    }
  };

  let status = "";
  let statusColor = "text-slate-600";
  let statusBgColor = "bg-slate-100";

  if (closeTime) {
    const now = new Date();
    const close = new Date(closeTime);
    if (now > close) {
      status = "Đã kết thúc: " + close.toLocaleString();
      statusColor = "text-red-700";
      statusBgColor = "bg-red-100";
    } else {
      const timeLeft = Math.floor((close.getTime() - now.getTime()) / (1000 * 60));
      status = `Đang diễn ra, kết thúc trong ${timeLeft / 60 === 0 ? '' : Math.floor(timeLeft / 60) + ' giờ '} ${timeLeft % 60} phút`;
      statusColor = "text-green-700";
      statusBgColor = "bg-green-100";
    }
  } else if (openTime) {
    const now = new Date();
    const open = new Date(openTime);
    if (now < open) {
      status = "Thời gian mở đề: " + open.toLocaleString();
      statusColor = "text-slate-600";
      statusBgColor = "bg-slate-100";
    } else {
      status = "Đang diễn ra";
      statusColor = "text-green-700";
      statusBgColor = "bg-green-100";
    }
  } else {
    status = "Đang diễn ra";
    statusColor = "text-green-700";
    statusBgColor = "bg-green-100";
  }
  const totalQuestions = easyCount + mediumCount + hardCount + veryHardCount;
  const totalScore = easyCount * easyScore + mediumCount * mediumScore + hardCount * hardScore + veryHardCount * veryHardScore;

  return (
    <div className="p-4">
      <div className="flex items-start gap-4 rounded-xl p-5 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer" onClick={() => onClick(id)}>
        <img src={ExamIcon} alt="Exam" className="w-8 h-8" />
        <div className="flex flex-col flex-grow gap-1">
          <p className="text-[#0e141b] text-xl font-bold leading-tight">{title}</p>
          <p className="text-[#4e7297] text-sm font-normal leading-normal mt-1">
            <span className="font-medium text-slate-600">Tổng số câu hỏi:</span> {totalQuestions}
          </p>
          <p className="text-[#4e7297] text-sm font-normal leading-normal">
            <span className="font-medium text-slate-600">Tổng điểm:</span> {totalScore} • <span className="font-medium text-slate-600">Thời gian:</span> {durationMinutes} phút
          </p>
          <p className={`text-sm font-bold leading-normal mt-2 inline-block px-2 py-0.5 rounded ${statusBgColor} ${statusColor}`}>
            {status}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="flex size-8 items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
          aria-label={isFavorited ? 'Bỏ yêu thích đề thi' : 'Yêu thích đề thi'}
          title={isFavorited ? 'Bỏ yêu thích' : 'Yêu thích'}
        >
          <img src={isFavorited ? LoveFillIcon : LoveIcon} alt="Favorite" className={`w-4 h-4 ${isFavorited ? 'text-red-500' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default ExamCard; 