import React from 'react';
import { useOutletContext } from 'react-router-dom';
import type { CourseDetailContextType } from '../CourseDetailPage'; // Adjust path

const CourseTopics: React.FC = () => {
  const context = useOutletContext<CourseDetailContextType>();
  // const { course } = context || {};

  return (
    <div className="p-4 md:p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold text-[#0d141c] mb-4">Thảo luận</h2>
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md" role="alert">
        <p className="font-bold">Tính năng đang phát triển</p>
        <p>Khu vực thảo luận, hỏi đáp về khóa học sẽ được hiển thị ở đây.</p>
      </div>
      {/* {course && <p className="mt-4">Thảo luận cho khóa học: {course.name}</p>} */}
    </div>
  );
};

export default CourseTopics;