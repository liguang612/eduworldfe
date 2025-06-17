import React from 'react';
import { BookOpen, Presentation, FileQuestion } from 'lucide-react';
import type { StudyMode, SortOption } from '@/pages/Homepage/SearchPage';
import type { Subject } from '@/api/courseApi';

interface SidebarProps {
  activeMode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
  selectedGrade: string;
  onGradeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedSubject: string;
  onSubjectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  sortOption: SortOption;
  onSortChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  subjects: Subject[];
  grades: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeMode, onModeChange, selectedGrade, onGradeChange, selectedSubject, onSubjectChange, sortOption, onSortChange, subjects, grades }) => {
  const modes: { key: StudyMode; name: string; icon: React.ElementType }[] = [
    { key: 'Course', name: 'Khóa học', icon: BookOpen },
    { key: 'Lecture', name: 'Bài giảng', icon: Presentation },
    { key: 'Exam', name: 'Đề thi', icon: FileQuestion }
  ];

  return (
    <aside className="w-72 p-4 bg-white border-r border-slate-200 flex-shrink-0 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h3 className="px-3 mb-2 text-sm font-semibold text-slate-500">Loại</h3>
          <div className="space-y-1">
            {modes.map(mode => (
              <button
                key={mode.name}
                onClick={() => onModeChange(mode.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeMode === mode.name ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <mode.icon className="w-5 h-5" />
                <span>{mode.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="px-3 mb-2 text-sm font-semibold text-slate-500">Lọc</h3>
          <div className="px-3 space-y-3">
            <div className="flex items-center">
              <label htmlFor="grade-select" className="sr-only">Chọn khối lớp</label>
              <select
                id="grade-select"
                name="grade"
                value={selectedGrade}
                onChange={onGradeChange}
                className="w-full appearance-none cursor-pointer bg-transparent border-none text-[#0e141b] text-sm font-medium focus:outline-none focus:ring-0 p-0 pr-5 bg-[image:var(--select-button-svg-black)] bg-no-repeat bg-right center leading-tight"
              >
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label htmlFor="subject-select" className="sr-only">Chọn môn học</label>
              <select
                id="subject-select"
                name="subject"
                value={selectedSubject}
                onChange={onSubjectChange}
                className="w-full appearance-none cursor-pointer bg-transparent border-none text-[#0e141b] text-sm font-medium focus:outline-none focus:ring-0 p-0 pr-5 bg-[image:var(--select-button-svg-black)] bg-no-repeat bg-right center leading-tight"
              >
                <option value="All subjects">Tất cả môn học</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.name}>{subject.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="px-3 mb-2 text-sm font-semibold text-slate-500">Sắp xếp</h3>
          <div className="px-3 space-y-3 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="sort" value="none" checked={sortOption === 'none'} onChange={onSortChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
              Mặc định
            </label>
            <p className="font-medium text-slate-600">Tên</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="sort" value="name-asc" checked={sortOption === 'name-asc'} onChange={onSortChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
              A -&gt; Z
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="sort" value="name-desc" checked={sortOption === 'name-desc'} onChange={onSortChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
              Z -&gt; A
            </label>

            <hr className="my-2" />

            {activeMode === 'Exam' ? (
              <>
                <p className="font-medium text-slate-600">Thời gian</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="sort" value="time-asc" checked={sortOption === 'time-asc'} onChange={onSortChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  Cũ nhất
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="sort" value="time-desc" checked={sortOption === 'time-desc'} onChange={onSortChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  Mới nhất
                </label>
              </>
            ) : (
              <>
                <p className="font-medium text-slate-600">Đánh giá</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="sort" value="rating-desc" checked={sortOption === 'rating-desc'} onChange={onSortChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  Cao -&gt; Thấp
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="sort" value="rating-asc" checked={sortOption === 'rating-asc'} onChange={onSortChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  Thấp -&gt; Cao
                </label>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
