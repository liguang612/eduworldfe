import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import type { Question } from '@/api/questionApi';
import type { Solution } from '@/api/solutionApi';
import { getSolutionsByQuestionId } from '@/api/solutionApi';
import { getQuestionDetail } from '@/api/questionApi';
import QuestionPreviewSection from '@/components/Solution/QuestionPreviewSection';
import SolutionPreviewPane from '@/components/Solution/SolutionPreviewPane';
import SolutionListItem from '@/components/Solution/SolutionListItem';
import { deleteSolution } from '@/api/solutionApi';
import { toast } from 'react-toastify';
import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog';

const SolutionPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [solutionToDeleteId, setSolutionToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!questionId) return;

      try {
        setLoading(true);
        const [questionData, solutionsData] = await Promise.all([
          getQuestionDetail(questionId),
          getSolutionsByQuestionId(questionId)
        ]);

        setQuestion(questionData);
        setSolutions(solutionsData);

        if (solutionsData.length > 0) {
          setSelectedSolutionId(solutionsData[0].id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [questionId]);

  const handleSelectSolution = (id: string) => {
    setSelectedSolutionId(id);
  };

  const handleDeleteSolution = async (solutionId: string) => {
    if (!questionId) return; // Should not happen if we are on this page

    setSolutionToDeleteId(solutionId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteSolution = async () => {
    if (!solutionToDeleteId || !questionId) return;

    try {
      setLoading(true);
      setStatusMessage('Đang xóa lời giải...');
      await deleteSolution(solutionToDeleteId);
      toast.success('Lời giải đã được xóa thành công!');
      // Refetch solutions after deletion
      const solutionsData = await getSolutionsByQuestionId(questionId);
      setSolutions(solutionsData);
      // Select the first solution or set to null if none left
      if (solutionsData.length > 0) {
        setSelectedSolutionId(solutionsData[0].id);
      } else {
        setSelectedSolutionId(null);
      }
    } catch (error) {
      console.error('Error deleting solution:', error);
      toast.error('Không thể xóa lời giải. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setStatusMessage(null);
      setIsDeleteDialogOpen(false);
      setSolutionToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setSolutionToDeleteId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Không tìm thấy câu hỏi</p>
      </div>
    );
  }

  const selectedSolution = solutions.find(s => s.id === selectedSolutionId) || null;

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="flex h-full grow">
        {/* Left Column (50%) */}
        <div className="flex-[50%] p-6 overflow-y-auto">
          <QuestionPreviewSection question={question} />

          <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[#0b6fda] text-xl font-bold leading-tight tracking-[-0.015em]">
                Lời giải ({solutions.length})
              </h3>
              <button
                onClick={() => navigate(`/question-bank/${questionId}/solutions/create`)}
                className="flex min-w-[84px] max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium leading-normal"
              >
                <span className="truncate">Thêm cách giải</span>
              </button>
            </div>

            {solutions.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                {solutions.map((solution) => (
                  <SolutionListItem
                    key={solution.id}
                    solution={solution}
                    isSelected={selectedSolutionId === solution.id}
                    onSelect={handleSelectSolution}
                    onDelete={handleDeleteSolution}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-3">Chưa có lời giải nào được tạo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Preview Pane */}
        <div className="flex-[50%] sticky top-0 h-screen">
          <SolutionPreviewPane solution={selectedSolution} onDelete={handleDeleteSolution} />
        </div>
      </div>
      <Outlet />
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        title="Xác nhận xóa lời giải"
        message="Bạn có chắc chắn muốn xóa lời giải này? Hành động này không thể hoàn tác."
        onConfirm={handleConfirmDeleteSolution}
        confirmButtonText="Xóa"
        cancelButtonText="Hủy"
        confirmButtonColorClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default SolutionPage;