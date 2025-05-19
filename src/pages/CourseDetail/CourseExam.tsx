import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { CourseDetailContextType } from '../../pages/CourseDetailPage';
import MagnifyingGlassIcon from '../../assets/magnify_glass.svg';
import ClockIcon from '../../assets/clock.svg';
import DotsThreeIcon from '../../assets/dot_three.svg';

interface ExamItem {
  id: string;
  name: string;
  dueDateText: string;
  status: 'upcoming' | 'past';
}

const sampleExams: ExamItem[] = [
  { id: 'exam1', name: 'Midterm Exam', dueDateText: 'Due in 4 days', status: 'upcoming' },
  { id: 'exam2', name: 'Final Exam', dueDateText: 'Due in 15 days', status: 'upcoming' },
  { id: 'exam3', name: 'Unit 1 Exam', dueDateText: 'Completed 2 weeks ago', status: 'past' },
  { id: 'exam4', name: 'Unit 2 Exam', dueDateText: 'Completed 1 month ago', status: 'past' },
  { id: 'exam5', name: 'Unit 3 Exam', dueDateText: 'Completed 2 months ago', status: 'past' },
];

interface ExamCardProps {
  exam: ExamItem;
  onMenuClick?: (examId: string) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onMenuClick }) => {
  return (
    <div className="flex items-center gap-4 bg-white hover:bg-slate-50 px-4 min-h-[72px] py-3 my-1.5 rounded-lg border border-slate-200 transition-colors duration-150">
      <div className="flex items-center gap-4 flex-grow">
        <div className="text-[#0d141c] flex items-center justify-center rounded-lg bg-[#e7edf4] shrink-0 size-12">
          <img src={ClockIcon} alt="Clock" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-[#0d141c] text-base font-medium leading-normal line-clamp-1">{exam.name}</p>
          <p className="text-[#49719c] text-sm font-normal leading-normal line-clamp-2">{exam.dueDateText}</p>
        </div>
      </div>
      <div className="shrink-0">
        {onMenuClick && (
          <button
            onClick={() => onMenuClick(exam.id)}
            className="text-[#0d141c] flex size-8 items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
            aria-label={`Options for ${exam.name}`}
          >
            <img src={DotsThreeIcon} alt="Dots Three" />
          </button>
        )}
      </div>
    </div>
  );
};


const CourseExams: React.FC = () => {
  const context = useOutletContext<CourseDetailContextType>();
  const navigate = useNavigate();
  const { courseId, role, isCourseLoading } = context || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [exams, setExams] = useState<ExamItem[]>(sampleExams); // Sau này sẽ fetch từ API

  // Lọc danh sách bài thi dựa trên searchTerm
  const filteredExams = exams.filter(exam =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingExams = filteredExams.filter(exam => exam.status === 'upcoming');
  const pastExams = filteredExams.filter(exam => exam.status === 'past');

  const handleCreateNewExam = () => {
    navigate(`/courses/${courseId}/exams/create`);
  };

  const handleExamMenuClick = (examId: string) => {
    alert(`Menu clicked for exam ID: ${examId}`);
  };

  if (isCourseLoading) {
    return <div className="p-6 text-center text-gray-500">Đang tải dữ liệu đề thi...</div>;
  }

  return (
    <div className="layout-content-container flex flex-col flex-1 pb-8">
      <div className="flex flex-wrap justify-between items-center gap-3 p-4 border-b border-slate-200 mb-4">
        <p className="text-[#0d141c] tracking-light text-2xl md:text-[32px] font-bold leading-tight min-w-72">
          Đề thi
        </p>
        {role === 1 && (
          <button
            onClick={handleCreateNewExam}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-9 px-4 bg-[#1980e6] hover:bg-[#1368bf] text-white text-sm font-medium leading-normal transition-colors"
          >
            <span className="truncate font-bold">Tạo đề thi mới</span>
          </button>
        )}
      </div>

      <div className="px-4 py-3">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
            <div className="text-[#49719c] flex border-none bg-[#e7edf4] items-center justify-center pl-4 rounded-l-xl border-r-0">
              <img src={MagnifyingGlassIcon} alt="Magnifying Glass" />
            </div>
            <input
              placeholder="Tìm kiếm đề thi..."
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-[#0d141c] focus:outline-none focus:ring-2 focus:ring-[#1980e6] focus:border-transparent border-none bg-[#e7edf4] h-full placeholder:text-[#49719c] px-4 text-base font-normal leading-normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </label>
      </div>

      {/* Upcoming Exams Section */}
      {upcomingExams.length > 0 && (
        <>
          <h3 className="text-[#0d141c] text-lg font-semibold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
            Sắp diễn ra
          </h3>
          <div className="px-4 space-y-2">
            {upcomingExams.map(exam => (
              <ExamCard key={exam.id} exam={exam} onMenuClick={handleExamMenuClick} />
            ))}
          </div>
        </>
      )}


      {/* Past Exams Section */}
      {pastExams.length > 0 && (
        <>
          <h3 className="text-[#0d141c] text-lg font-semibold leading-tight tracking-[-0.015em] px-4 pb-2 pt-6">
            Đã kết thúc
          </h3>
          <div className="px-4 space-y-2">
            {pastExams.map(exam => (
              <ExamCard key={exam.id} exam={exam} onMenuClick={handleExamMenuClick} />
            ))}
          </div>
        </>
      )}

      {/* No Exams Found */}
      {filteredExams.length === 0 && !isCourseLoading && (
        <div className="px-4 py-10 text-center">
          <p className="text-lg text-gray-500">
            {searchTerm ? 'Không tìm thấy đề thi nào phù hợp.' : 'Chưa có đề thi nào trong khóa học này.'}
          </p>
          {role === 1 && !searchTerm && (
            <button
              onClick={handleCreateNewExam}
              className="mt-4 flex min-w-[84px] mx-auto cursor-pointer items-center justify-center overflow-hidden rounded-xl h-9 px-4 bg-[#1980e6] hover:bg-[#1368bf] text-white text-sm font-medium leading-normal transition-colors"
            >
              <span className="truncate">Tạo đề thi đầu tiên</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseExams;