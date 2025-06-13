import React from 'react';
import { FileQuestion } from 'lucide-react';
import type { SearchExam } from '@/api/searchApi';

const getExamStatus = (openTimeStr: string, closeTimeStr: string): { text: string; color: string; } => {
  const now = new Date();
  const openTime = new Date(openTimeStr);
  const closeTime = new Date(closeTimeStr);

  if (now > closeTime) return { text: 'Đã kết thúc', color: 'text-slate-500 bg-slate-100' };
  if (now < openTime) return { text: 'Sắp diễn ra', color: 'text-blue-600 bg-blue-100' };
  return { text: 'Đang diễn ra', color: 'text-green-600 bg-green-100' };
};

const ExamResultItem: React.FC<{ item: SearchExam; onClick: () => void }> = ({ item, onClick }) => {
  const status = getExamStatus(item.openTime, item.closeTime);
  return (
    <div className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg w-full cursor-pointer hover:bg-slate-50 transition-colors" onClick={onClick}>
      <div className="text-red-600 flex items-center justify-center rounded-lg bg-red-50 shrink-0 size-16">
        <FileQuestion className="w-8 h-8" />
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-slate-800 text-base">{item.title}</h3>
        <p className="text-sm text-slate-500 mt-1">
          Thời gian: {item.durationMinutes} phút | {item.totalQuestions} câu hỏi
        </p>
        <p className="text-sm text-slate-500">
          Môn: {item.subjectName} - Lớp {item.grade}
        </p>
      </div>
      <div className="ml-auto text-right flex-shrink-0 space-y-1">
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${status.color}`}>
          {status.text}
        </span>
        <button className="block w-full text-sm font-semibold text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default ExamResultItem;
