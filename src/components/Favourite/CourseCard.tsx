import React from 'react';
import type { Course } from '@/api/courseApi';
import RatingStars from '@/components/Common/RatingStars';
import type { User } from '@/contexts/AuthContext';

interface CourseCardProps extends Course {
  onClick: (id: string) => void;
  onSelectUser: (user: User) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ id, name, description, avatar, teacher, allCategories, averageRating, onSelectUser, onClick }) => {
  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 rounded-xl bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer" onClick={() => onClick(id)}>
        <div className="flex flex-[2_2_0px] flex-col gap-3 p-5">
          <div className="flex flex-col gap-1">
            <p className="text-[#0e141b] text-xl font-bold leading-tight">{name}</p>
            <p className="text-[#4e7297] text-sm font-normal leading-normal">{description}</p>
          </div>
          <div className="flex items-center gap-2 mt-1 cursor-pointer hover:underline" onClick={(e) => {
            e.stopPropagation();
            onSelectUser(teacher);
          }}>
            <img src={teacher.avatar} alt={teacher.name} className="size-9 rounded-full border border-slate-200" />
            <span className="text-[#0e141b] text-sm font-semibold">{teacher.name}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {allCategories.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-full">{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <RatingStars rating={averageRating} />
            <span className="text-[#0e141b] text-sm font-bold">{averageRating.toFixed(1)}</span>
          </div>
        </div>
        <div
          className="w-full md:w-1/3 bg-center bg-no-repeat aspect-video md:aspect-auto bg-cover rounded-r-xl min-h-[200px] md:min-h-full"
          style={{ backgroundImage: `url("${avatar || 'https://via.placeholder.com/300x200'}")` }}
        ></div>
      </div>
    </div>
  );
};

export default CourseCard; 