import React from 'react';
import { NavLink, useParams } from 'react-router-dom';

interface DrawerItemProps {
  to: string;
  label: string;
  disabled?: boolean;
}

const DrawerItem: React.FC<DrawerItemProps> = ({ to, label, disabled }) => (
  <NavLink
    to={disabled ? '#' : to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-xl text-[#0d141c] text-sm font-medium leading-normal hover:bg-[#e0e7f1] transition-colors
      ${isActive && !disabled ? 'bg-[#e7edf4] font-semibold' : ''}
      ${disabled ? 'cursor-not-allowed text-gray-400' : ''}`
    }
    onClick={(e) => disabled && e.preventDefault()}
  >
    {label}
  </NavLink>
);

const CourseDrawer: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();

  if (!courseId) return null;

  return (
    <div className="layout-content-container flex flex-col w-60 md:w-72 bg-slate-100 border-r border-slate-200 sticky top-0 h-screen overflow-y-auto"> {/* Made drawer sticky */}
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-col gap-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#0d141c] px-3">Nội dung</h2>
          </div>
          <div className="flex flex-col gap-2">
            <DrawerItem to={`/courses/${courseId}/lectures`} label="Bài giảng" />
            <DrawerItem to={`/courses/${courseId}/exams`} label="Đề thi" />
            <DrawerItem to={`/courses/${courseId}/topics`} label="Thảo luận" />
            <DrawerItem to={`/courses/${courseId}/reviews`} label="Đánh giá" />

          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDrawer;