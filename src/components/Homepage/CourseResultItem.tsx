import React from 'react';
import type { Course } from "@/api/courseApi";
import RatingStars from "@/components/Common/RatingStars";


const CourseResultItem: React.FC<{ item: Course; onClick?: () => void }> = ({ item, onClick }) => (
  <div className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg w-full cursor-pointer hover:bg-slate-50 transition-colors" onClick={onClick}>
    <img
      src={item.avatar || 'https://images.unsplash.com/photo-1596495578065-45074394490b?w=200&h=200&fit=crop'}
      alt={item.name}
      className="w-24 h-24 rounded-md object-cover flex-shrink-0"
    />
    <div className="flex-grow">
      <h3 className="font-semibold text-slate-800 text-base">{item.name}</h3>
      <p className="text-sm text-slate-500 mt-1">Giảng viên: {item.teacher.name}</p>
      <div className="flex items-center gap-2 mt-1">
        <RatingStars rating={item.averageRating} />
        <span className="text-sm text-slate-500">({item.averageRating.toFixed(1)}) - {item.students.length} học viên</span>
      </div>
      <p className="text-sm text-slate-500 mt-1">
        Môn: {item.subjectName} - Lớp {item.grade}
      </p>
    </div>
  </div>
);

export default CourseResultItem;