import { type Exam } from "@/api/examApi";
import ClockIcon from "@/assets/clock.svg";
import EditIcon from "@/assets/edit.svg";
import TrashIcon from "@/assets/delete.svg";
import ResultIcon from "@/assets/result.svg";
import LoveIcon from '@/assets/love.svg';
import LoveFillIcon from '@/assets/love_fill.svg';
import { isAfter, isBefore, isWithinInterval, parseISO } from 'date-fns';
import { useState } from "react";
import { addFavorite, removeFavorite } from "@/api/favouriteApi";

export interface ExamCardProps {
  exam: Exam;
  onClick?: (examId: string) => void;
  onEdit?: (examId: string) => void;
  onDelete?: (examId: string) => void;
  onViewResults?: (examId: string) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onClick, onEdit, onDelete, onViewResults }) => {
  const [isFavorited, setIsFavorited] = useState(exam.favourite);

  const formatTimeRange = (openTime: string | null, closeTime: string | null): string => {
    const now = new Date();

    const open = openTime ? parseISO(openTime) : null;
    const close = closeTime ? parseISO(closeTime) : null;

    const formatTime = (date: Date | null): string => {
      if (!date) return "";
      // Sử dụng các hàm lấy thời gian theo múi giờ địa phương
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng trong JavaScript bắt đầu từ 0
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes} ${day}/${month}/${year}`;
    };

    const openTimeFormatted = formatTime(open);
    const closeTimeFormatted = formatTime(close);

    if (close && isBefore(close, now)) {
      return `Đã kết thúc lúc ${closeTimeFormatted}`;
    }
    if (open && isAfter(open, now)) {
      return `Sẽ mở lúc ${openTimeFormatted}`;
    }
    if (open && !close) {
      return `Đã mở lúc ${openTimeFormatted}`;
    }
    if (!open && close && isAfter(close, now)) {
      return `Kết thúc lúc ${closeTimeFormatted}`;
    }
    if (open && close && isWithinInterval(now, { start: open, end: close })) {
      return `Đang diễn ra. Kết thúc lúc ${closeTimeFormatted}`;
    }

    if (!open && !close) {
      return "Mở vĩnh viễn";
    }

    return "";
  };

  const timeRangeText = formatTimeRange(exam.openTime, exam.closeTime);

  const onToggleFavorite = async () => {
    if (isFavorited) {
      await removeFavorite(exam.id, 4);
      setIsFavorited(false);
    } else {
      await addFavorite(exam.id, 4);
      setIsFavorited(true);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-white hover:bg-slate-50 px-4 min-h-[72px] py-3 my-1.5 rounded-lg border border-slate-200 transition-colors duration-150">
      <div className="flex items-center gap-4 flex-grow cursor-pointer" onClick={() => onClick?.(exam.id)}>
        <div className="text-[#0d141c] flex items-center justify-center rounded-lg bg-[#e7edf4] shrink-0 size-12">
          <img src={ClockIcon} alt="Clock" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-[#0d141c] text-base font-medium leading-normal line-clamp-1">{exam.title}</p>
          <p className="text-[#49719c] text-sm font-normal leading-normal line-clamp-2">{timeRangeText}</p>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
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
        {onViewResults && (
          <button
            onClick={(e) => { e.stopPropagation(); onViewResults(exam.id); }}
            className="text-[#0d141c] flex size-8 items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
            aria-label={`Xem kết quả đề thi ${exam.title}`}
            title="Xem kết quả"
          >
            <img src={ResultIcon} alt="Results" className="w-4 h-4" />
          </button>
        )}
        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(exam.id); }}
            className="text-[#0d141c] flex size-8 items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
            aria-label={`Sửa đề thi ${exam.title}`}
            title="Sửa"
          >
            <img src={EditIcon} alt="Edit" className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(exam.id); }}
            className="text-red-500 flex size-8 items-center justify-center rounded-full hover:bg-red-100 transition-colors"
            aria-label={`Xóa đề thi ${exam.title}`}
            title="Xóa"
          >
            <img src={TrashIcon} alt="Delete" className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamCard;