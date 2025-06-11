import React from 'react';
import { Presentation } from 'lucide-react';
import RatingStars from '@/components/Common/RatingStars';

interface LectureItemProps {
  id: string | number;
  title: string;
  duration: number; // in minutes
  rating: number;
  questionCount: number;
  subjectName: string;
  grade: number;
  onClick: (id: string | number) => void;
}

const LectureItem: React.FC<LectureItemProps> = ({ id, title, duration, rating, questionCount, subjectName, grade, onClick }) => {
  return (
    <div
      key={id}
      className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg w-full cursor-pointer"
      onClick={() => onClick(id)}
    >
      <div className="text-blue-600 flex items-center justify-center rounded-lg bg-blue-50 shrink-0 size-16">
        <Presentation className="w-8 h-8" />
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
        <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
          <span>{duration} phút</span>
          <span className="mx-1">•</span>
          <RatingStars rating={rating} />
          <span className="ml-1">({rating.toFixed(1)})</span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Môn: {subjectName} - Lớp {grade}
        </p>
      </div>
      <div className="ml-auto text-right flex-shrink-0">
        <p className="font-medium text-slate-800">{questionCount} câu hỏi</p>
        <p className="text-sm text-slate-500">luyện tập</p>
      </div>
    </div>
  );
};

export default LectureItem; 