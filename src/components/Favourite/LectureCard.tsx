import React from 'react';
import type { LectureResponse } from '@/api/lectureApi';
import LectureIcon from '@/assets/lecture.svg';
import type { User } from '@/contexts/AuthContext';

interface LectureCardProps extends LectureResponse {
  onSelectUser: (user: User) => void;
  onClick: (id: string) => void;
}

const LectureCard: React.FC<LectureCardProps> = ({ id, name, description, duration, teacher, onSelectUser, onClick }) => {
  return (
    <div className="p-4">
      <div className="flex items-start gap-4 rounded-xl p-5 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer" onClick={() => onClick(id)}>
        <img src={LectureIcon} alt="Lecture" className="size-12" />
        <div className="flex flex-col flex-grow gap-1">
          <p className="text-[#0e141b] text-xl font-bold leading-tight">{name}</p>
          <p className="text-black text-sm font-normal font-normal leading-normal">{description}</p>
          <p className="text-[#4e7297] text-sm font-normal leading-normal mt-1">
            <span className="font-medium text-slate-600">Thời gian:</span> {Math.floor(duration / 60) === 0 ? '' : Math.floor(duration / 60) + ' giờ '} {duration % 60} phút
          </p>
          <div className="flex items-center gap-2 mt-2 cursor-pointer hover:underline" onClick={(e) => {
            e.stopPropagation();
            onSelectUser(teacher);
          }}>
            <img src={teacher.avatar} alt={teacher.name} className="size-9 rounded-full border border-slate-200" />
            <span className="text-[#0e141b] text-sm font-semibold">{teacher.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureCard; 