import React, { useState, useEffect, useRef } from 'react';
import MyEditor from '@/components/Lecture/MyEditor';
import type { MyEditorRef } from '@/components/Lecture/MyEditor';
import QuestionDetailPreview from '@/components/Question/QuestionDetailPreview';
import type { Question } from '@/api/questionApi';
import { getQuestionDetail } from '@/api/questionApi';
import { uploadFile } from '@/api/lectureApi';
import { createSolution } from '@/api/solutionApi';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const SolutionCreatePage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();

  const [originalQuestion, setOriginalQuestion] = useState<Question | null>(null);
  const [isQuestionLoading, setIsQuestionLoading] = useState(true);
  const editorRef = useRef<MyEditorRef>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!questionId) {
        toast.error("Không tìm thấy ID câu hỏi.");
        setIsQuestionLoading(false);
        return;
      }
      try {
        setIsQuestionLoading(true);
        const data = await getQuestionDetail(questionId);
        setOriginalQuestion(data);
      } catch (error) {
        console.error('Error fetching question:', error);
        toast.error('Không thể tải dữ liệu câu hỏi gốc.');
        setOriginalQuestion(null);
      } finally {
        setIsQuestionLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, navigate]);

  const handleSaveContribution = async () => {
    const editorValue = editorRef.current?.getValue();
    if (!editorValue || editorValue.length === 0) {
      toast.warn('Nội dung đóng góp không được để trống.');
      return;
    }
    if (!questionId) {
      toast.error("Không tìm thấy ID câu hỏi để đóng góp.");
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const contents = editorValue;
      const processedContents: typeof contents = [];

      for (let i = 0; i < contents.length; i++) {
        const contentItem = contents[i];
        if (contentItem.isUpload && contentItem.url.startsWith('blob:')) {
          const metadata = contentItem.type?.split('/');
          console.log(contentItem);
          if (metadata && (metadata[0] === 'image' || contentItem.type === 'img')) {
            try {
              setStatusMessage(`Đang tải hình ảnh...`);
              const response = await fetch(contentItem.url);
              const blob = await response.blob();

              const fileName = contentItem.name && contentItem.name !== '' ? contentItem.name : `uploaded_image_${Date.now()}.${metadata[1] || 'png'}`;
              const file = new File([blob], fileName, { type: blob.type });

              const fileUrl = await uploadFile(file, 'solutions');

              const writableContentItem = { ...contentItem };
              writableContentItem.url = fileUrl;

              delete writableContentItem.placeholderId;
              processedContents.push(writableContentItem);
            } catch (uploadError) {
              console.error('Error uploading image:', uploadError);
              toast.error(`Không thể tải lên hình ảnh: ${contentItem.name || 'file'}. Vui lòng thử lại.`);
            }
          } else {
            console.log(`Skipping non-image upload: ${contentItem.type}`);
          }
        } else {
          processedContents.push(contentItem);
        }
      }

      if (!questionId) {
        toast.error('Không tìm thấy ID câu hỏi.');
        return;
      }

      setStatusMessage('Đang gửi lời giải...');

      const solutionData = {
        questionId: questionId,
        content: JSON.stringify(processedContents),
      };

      await createSolution(solutionData);

      toast.success('Lời giải đã được gửi thành công!');
      setLoading(false);
      setStatusMessage(null);

      navigate(-1);
    } catch (error) {
      setLoading(false);
      setStatusMessage(null);

      console.error('Error saving solution:', error);
      toast.error('Có lỗi xảy ra khi gửi lời giải. Vui lòng thử lại (Bạn có thể export tài liệu này dưới dạng HTML để có thể import lại sau).');
    }
  };

  if (isQuestionLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-lg font-medium text-gray-700">Đang tải câu hỏi...</div>
      </div>
    );
  }

  if (!originalQuestion) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 p-4 text-center">
        <div className="text-xl font-semibold text-red-600 mb-4">Không thể tải câu hỏi</div>
        <p className="text-gray-700">Câu hỏi bạn đang tìm kiếm không tồn tại hoặc đã có lỗi xảy ra.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
        style={{
          fontFamily: 'Inter, "Noto Sans", sans-serif',
        } as React.CSSProperties}
      >
        <div className="flex flex-col lg:flex-row flex-1 gap-6 p-6 justify-center">
          {/* Left Column: Question Preview */}
          <div className="lg:w-2/5 xl:w-3/7 flex flex-col">
            <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight">Tạo cách giải</p>
            <h2 className="text-slate-700 text-xl font-semibold leading-tight tracking-[-0.015em] pb-3 mb-3 border-b border-slate-200 mt-10">
              Câu hỏi
            </h2>
            <div className="overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar shadow-md">
              <QuestionDetailPreview question={originalQuestion} showFunction={false} />
            </div>
          </div>

          {/* Right Column: Plate.js Editor for Contribution */}
          <div className="lg:w-3/5 xl:w-4/7 flex flex-col mt-6 lg:mt-0">
            <h2 className="text-slate-700 text-xl font-semibold leading-tight tracking-[-0.015em] pb-3 mb-3 border-b border-slate-200">
              Bài giải
            </h2>
            <MyEditor ref={editorRef} />
            <div className="flex flex-col items-end gap-2 pt-4 mt-6">
              {statusMessage && (
                <div className="text-sm text-blue-600 font-medium mb-2 w-full text-right">{statusMessage}</div>
              )}
              <button
                className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-6 bg-blue-600 text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors" // Style adapted from LectureCreatePage
                onClick={handleSaveContribution}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V4a8 8 0 00-8 8h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> {/* Improved spinner SVG */}
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  <span className="truncate">Tạo</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolutionCreatePage;