import { useState, useEffect } from 'react';
import { getUpcomingExams } from '@/api/homeApi';
import type { Exam } from '@/api/examApi';
import ExamCard from '@/components/Exam/ExamCard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ExamPages() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await getUpcomingExams(100);
        setExams(data);
      } catch (error) {
        console.error('Error fetching exams:', error);
        toast.error('Có lỗi xảy ra khi tải danh sách kỳ thi');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleExamClick = (exam: Exam) => {
    navigate(`/courses/${exam.classId}/exams/${exam.id}/instructions`, {
      state: {
        examId: exam.id,
        courseId: exam.classId,
        examTitle: exam.title,
        courseName: exam.className,
        subjectName: exam.subjectName,
        subjectGrade: exam.grade,
        duration: exam.durationMinutes,
        numQuestions: exam.totalQuestions,
        subjectId: undefined,
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1980e6]"></div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
          <div className="flex justify-between items-center px-4 pt-5 pb-3">
            <h2 className="text-[#0e141b] text-xl sm:text-[22px] font-bold leading-tight tracking-[-0.015em]">
              Danh sách kỳ thi sắp tới
            </h2>
          </div>
          <div className="px-0 sm:px-4 pb-4">
            {exams.length === 0 ? (
              <div className="text-center py-8 text-[#4e7397]">
                Không có kỳ thi nào sắp tới
              </div>
            ) : (
              exams.map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  onClick={() => handleExamClick(exam)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}