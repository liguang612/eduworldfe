import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import type { Question } from '@/api/questionApi';
import type { Solution } from '@/api/solutionApi';
import { getSolutionsByQuestionId, reviewSolution } from '@/api/solutionApi';
import { getQuestionDetail } from '@/api/questionApi';
import QuestionPreviewSection from '@/components/Solution/QuestionPreviewSection';
import SolutionPreviewPane from '@/components/Solution/SolutionPreviewPane';
import SolutionListItem from '@/components/Solution/SolutionListItem';
import { deleteSolution } from '@/api/solutionApi';
import { toast, ToastContainer } from 'react-toastify';
import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog';
import { useAuth } from '@/contexts/AuthContext';

const SolutionPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [pendingSolutions, setPendingSolutions] = useState<Solution[]>([]);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [_statusMessage, setStatusMessage] = useState<string | null>(null);
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
        const newApprovedSolutions = solutionsData.filter(s => s.status === 1);
        const newPendingSolutions = solutionsData.filter(s => s.status === 0);
        setSolutions(newApprovedSolutions);
        setPendingSolutions(newPendingSolutions);

        if (newApprovedSolutions.length > 0) {
          setSelectedSolutionId(newApprovedSolutions[0].id);
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

      const solutionsData = await getSolutionsByQuestionId(questionId);
      const newApprovedSolutions = solutionsData.filter(s => s.status === 1);
      const newPendingSolutions = solutionsData.filter(s => s.status === 0);
      setSolutions(newApprovedSolutions);
      setPendingSolutions(newPendingSolutions);

      if (newApprovedSolutions.length > 0) {
        setSelectedSolutionId(newApprovedSolutions[0].id);
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

  const handleReviewSolution = async (solutionId: string, status: number) => {
    try {
      setLoading(true);
      setStatusMessage('Đang xử lý phê duyệt...');
      await reviewSolution(solutionId, status);
      if (status === 1) {
        toast.success('Đã phê duyệt lời giải!');
      } else if (status === 2) {
        toast.success('Đã từ chối lời giải!');
      }

      // Refresh solutions list
      const solutionsData = await getSolutionsByQuestionId(questionId!);
      const newApprovedSolutions = solutionsData.filter(s => s.status === 1);
      const newPendingSolutions = solutionsData.filter(s => s.status === 0);
      setSolutions(newApprovedSolutions);
      setPendingSolutions(newPendingSolutions);
    } catch (error) {
      console.error('Error reviewing solution:', error);
      toast.error('Có lỗi xảy ra khi phê duyệt lời giải. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setStatusMessage(null);
    }
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
  const finalSelectedSolution = selectedSolution || pendingSolutions.find(s => s.id === selectedSolutionId) || null;

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

          {/* Phần lời giải đang chờ phê duyệt */}
          {pendingSolutions.length > 0 && (user?.id === question?.createdBy || pendingSolutions.some(s => s.creatorId === user?.id)) && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-gray-700 text-xl font-bold leading-tight tracking-[-0.015em]">
                  Lời giải đang chờ phê duyệt ({pendingSolutions.length})
                </h3>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                {pendingSolutions.map((solution) => (
                  <div key={solution.id} className="border-b border-gray-200 last:border-b-0">
                    <SolutionListItem
                      solution={solution}
                      isSelected={selectedSolutionId === solution.id}
                      onSelect={handleSelectSolution}
                      onDelete={handleDeleteSolution}
                    />
                    {user?.id === question?.createdBy && (
                      <div className="flex justify-end gap-2 p-2 bg-gray-50">
                        <button
                          onClick={() => handleReviewSolution(solution.id, 2)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                          title="Từ chối"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleReviewSolution(solution.id, 1)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-md"
                          title="Phê duyệt"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Preview Pane */}
        <div className="flex-[50%] sticky top-0 h-screen">
          <SolutionPreviewPane solution={finalSelectedSolution} onDelete={handleDeleteSolution} questionAuthorId={question?.createdBy} />
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
      <ToastContainer />
    </div>
  );
};

export default SolutionPage;