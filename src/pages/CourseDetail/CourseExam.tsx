import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { CourseDetailContextType } from '../../pages/CourseDetailPage';
import MagnifyingGlassIcon from '../../assets/magnify_glass.svg';
import { getExamsByClassId, type Exam, deleteExam } from '../../api/examApi';
import { isAfter, isBefore, isWithinInterval, parseISO } from 'date-fns';
import ExamCard from '@/components/Exam/ExamCard';
import { toast, ToastContainer } from 'react-toastify';
import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog';

const CourseExams: React.FC = () => {
  const context = useOutletContext<CourseDetailContextType>();
  const navigate = useNavigate();
  const { courseId, role, isCourseLoading } = context || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [examToDeleteId, setExamToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      if (!courseId) {
        setIsLoading(false);
        return;
      }

      try {
        const examsData = await getExamsByClassId(courseId);
        setExams(examsData);
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExams();
  }, [courseId]);

  const handleCreateNewExam = () => {
    navigate(`/courses/${courseId}/exams/create`);
  };

  const handleExamCardClick = (examId: string) => {
    const clickedExam = exams.find(exam => exam.id === examId);
    if (!clickedExam) return;

    navigate(`/courses/${courseId}/exams/${examId}/instructions`, {
      state: {
        examId,
        courseId,
        examTitle: clickedExam.title,
        courseName: context?.course?.name || '',
        subjectName: context?.subject?.name || '',
        subjectGrade: context?.subject?.grade || '',
        duration: clickedExam.durationMinutes,
        numQuestions: clickedExam.totalQuestions,
        subjectId: context?.subjectId,
      }
    });
  };

  // Lọc danh sách bài thi dựa trên searchTerm
  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const now = new Date();

  const upcomingExams = filteredExams.filter(exam => {
    const openTime = exam.openTime ? parseISO(exam.openTime) : null;
    const closeTime = exam.closeTime ? parseISO(exam.closeTime) : null;

    if (closeTime && isAfter(now, closeTime)) return false;

    if (openTime && closeTime && isWithinInterval(now, { start: openTime, end: closeTime })) return false;
    if (openTime && !closeTime && isAfter(now, openTime)) return false;
    if (openTime && isBefore(now, openTime)) return true;
    if (!openTime && !closeTime) return false;

    return true;
  });

  const pastExams = filteredExams.filter(exam => {
    const closeTime = exam.closeTime ? parseISO(exam.closeTime) : null;
    return closeTime && isAfter(now, closeTime);
  });

  const ongoingExams = filteredExams.filter(exam => {
    const isUpcoming = upcomingExams.some(u => u.id === exam.id);
    const isPast = pastExams.some(p => p.id === exam.id);
    return !isUpcoming && !isPast;
  });

  if (isCourseLoading || isLoading) {
    return <div className="p-6 text-center text-gray-500">Đang tải dữ liệu đề thi...</div>;
  }

  function handleEditExam(id: string): void {
    navigate(`/courses/${courseId}/exams/${id}/edit`);
  }

  async function handleDeleteExam(id: string): Promise<void> {
    setExamToDeleteId(id);
    setShowConfirmDialog(true);
  }

  const handleConfirmDelete = async () => {
    if (!examToDeleteId || !courseId) return; // Add check for courseId

    try {
      await deleteExam(examToDeleteId);
      toast.success('Xóa đề thi thành công!');
      // Refresh danh sách đề thi
      const examsData = await getExamsByClassId(courseId);
      setExams(examsData);
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Có lỗi xảy ra khi xóa đề thi. Vui lòng thử lại sau.');
    } finally {
      setShowConfirmDialog(false);
      setExamToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setExamToDeleteId(null);
  };

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

      {/* Ongoing Exams Section */}
      {ongoingExams.length > 0 && (
        <>
          <h3 className="text-[#0d141c] text-lg font-semibold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
            Đang diễn ra
          </h3>
          <div className="px-4 space-y-2">
            {ongoingExams.map(exam => (
              <ExamCard key={exam.id} exam={exam} onClick={() => handleExamCardClick(exam.id)} onEdit={() => handleEditExam(exam.id)} onDelete={() => handleDeleteExam(exam.id)} />
            ))}
          </div>
        </>
      )}

      {/* Upcoming Exams Section */}
      {upcomingExams.length > 0 && (
        <>
          <h3 className="text-[#0d141c] text-lg font-semibold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
            Sắp diễn ra
          </h3>
          <div className="px-4 space-y-2">
            {upcomingExams.map(exam => (
              <ExamCard key={exam.id} exam={exam} onEdit={() => handleEditExam(exam.id)} onDelete={() => handleDeleteExam(exam.id)} />
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
              <ExamCard key={exam.id} exam={exam} onEdit={() => handleEditExam(exam.id)} onDelete={() => handleDeleteExam(exam.id)} />
            ))}
          </div>
        </>
      )}

      {/* No Exams Found */}
      {filteredExams.length === 0 && !isLoading && (
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

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelDelete}
        title="Xác nhận xóa đề thi"
        message="Bạn có chắc chắn muốn xóa đề thi này không? Thao tác này không thể hoàn tác."
        onConfirm={handleConfirmDelete}
        confirmButtonText="Xóa"
        cancelButtonText="Hủy"
        confirmButtonColorClass="bg-red-600 hover:bg-red-700"
      />
      <ToastContainer />
    </div>
  );
};

export default CourseExams;