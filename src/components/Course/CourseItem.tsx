import React from 'react';
import StarRatingDisplay from '@/components/Course/StarRatingDisplay';
import type { Course } from '@/api/courseApi';

interface CourseItemProps {
  course: Course;
  onClick: (course: Course) => void;
}

const CourseItem: React.FC<CourseItemProps> = ({ course, onClick }) => {
  return (
    <div
      key={course.id}
      className="flex flex-col gap-3 pb-3 max-w-[300px] cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => onClick(course)}
    >
      <div
        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
        style={{ backgroundImage: `url("${course.avatar}")` }}
      ></div>
      <div>
        <p className="text-[#0e141b] text-base font-medium leading-normal">{course.name}</p>
        <div className="text-[#4e7397] text-sm font-normal leading-normal mt-1">
          <p>Giáo viên: {course.teacher.name}</p>
          <p>Học sinh: {course.students.length}</p>
          <div className="flex items-center mt-0.5">
            <StarRatingDisplay rating={course.averageRating} />
            <span className="ml-1.5">({course.averageRating.toFixed(1)})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseItem; 