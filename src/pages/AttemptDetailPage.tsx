import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { baseURL } from '@/config/axios';
import { getExamAttemptDetails, type ExamAttemptDetails } from '@/api/attemptApi';
import { type Question, type SharedMedia } from '@/api/questionApi';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { BorderlessLight } from 'survey-core/themes';
import 'survey-core/survey-core.css';
import "../components/Question/survey-custom.css";
import FormatCorrectAnswer from '@/components/Question/FormatCorrectAnswer';
import DotRegularIcon from '@/assets/dot_regular.svg';
import DotFillTrueIcon from '@/assets/dot_fill_true.svg';
import DotFillFalseIcon from '@/assets/dot_fill_false.svg';
import DotFillIcon from '@/assets/dot_fill.svg';

const AttemptDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [attemptDetail, setAttemptDetail] = useState<ExamAttemptDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyModels, setSurveyModels] = useState<{ [key: string]: Model }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [sortedQuestions, setSortedQuestions] = useState<Question[]>([]);
  const [currentSharedMedia, setCurrentSharedMedia] = useState<SharedMedia | null>(null);
  const [currentMediaQuestions, setCurrentMediaQuestions] = useState<Question[]>([]);

  // Hàm để nhóm các câu hỏi theo sharedMedia
  const groupQuestionsBySharedMedia = useCallback((questions: Question[]) => {
    const groups: { [key: string]: Question[] } = {};
    questions.forEach(question => {
      if (question.sharedMedia) {
        const mediaId = question.sharedMedia.id;
        if (!groups[mediaId]) {
          groups[mediaId] = [];
        }
        groups[mediaId].push(question);
      }
    });
    return groups;
  }, []);

  // Hàm sắp xếp câu hỏi
  const sortQuestions = useCallback((questions: Question[]) => {
    const groups = groupQuestionsBySharedMedia(questions);
    const sorted: (Question | null)[] = [];
    const processedIds = new Set<string>();

    // Xử lý từng nhóm câu hỏi có sharedMedia
    Object.values(groups).forEach(group => {
      if (group.length > 0 && group[0].sharedMedia) {
        // Tìm vị trí của câu hỏi đầu tiên trong nhóm
        const firstQuestionIndex = questions.findIndex(q => q.id === group[0].id);

        // Đảm bảo mảng sorted đủ dài
        while (sorted.length <= firstQuestionIndex) {
          sorted.push(null);
        }

        // Thêm tất cả câu hỏi trong nhóm vào các vị trí liên tiếp
        group.forEach((q, groupIndex) => {
          const insertIndex = firstQuestionIndex + groupIndex;
          // Đảm bảo mảng sorted đủ dài
          while (sorted.length <= insertIndex) {
            sorted.push(null);
          }
          sorted[insertIndex] = q;
          processedIds.add(q.id);
        });
      }
    });

    // Thêm các câu hỏi còn lại vào các vị trí trống
    questions.forEach(q => {
      if (!processedIds.has(q.id)) {
        const emptyIndex = sorted.findIndex(item => !item);
        if (emptyIndex !== -1) {
          sorted[emptyIndex] = q;
        } else {
          sorted.push(q);
        }
        processedIds.add(q.id);
      }
    });

    // Lọc bỏ các vị trí null và ép kiểu về Question[]
    return sorted.filter((item): item is Question => item !== null);
  }, [groupQuestionsBySharedMedia]);

  // Cập nhật currentQuestionIndex khi chọn câu hỏi từ danh sách đã sắp xếp
  const handleSelectQuestion = (index: number) => {
    if (!attemptDetail?.questions) return;

    const question = sortedQuestions[index];
    const originalIndex = attemptDetail.questions.findIndex(q => q.id === question.id);
    setCurrentQuestionIndex(originalIndex);
  };

  // Lấy dữ liệu chi tiết bài thi từ API
  useEffect(() => {
    const fetchAttemptDetails = async () => {
      if (!id) {
        setError('Không tìm thấy ID bài thi');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getExamAttemptDetails(id);
        setAttemptDetail(data);

        // Thiết lập survey models cho mỗi câu hỏi
        if (data.questions && data.questions.length > 0) {
          const models: { [key: string]: Model } = {};

          data.questions.forEach((question: Question) => {
            const surveyJson: any = { // Thêm any để tránh lỗi type với SurveyJS JSON
              elements: [{
                name: `question_${question.id}`,
                title: question.title,
                type: question.type === 'radio' ? 'radiogroup' :
                  question.type === 'checkbox' ? 'checkbox' :
                    question.type === 'itemConnector' ? 'itemConnector' :
                      question.type === 'ranking' ? 'ranking' : 'text',
                choices: question.choices?.map((choice: any) => ({
                  value: String(choice.value),
                  text: choice.text,
                })),
              }]
            };

            // Thêm leftItems và rightItems cho itemConnector
            if (question.type === 'itemConnector' && question.matchingColumns) {
              surveyJson.elements[0].leftItems = question.matchingColumns
                .filter((col: any) => col.side === 'left')
                .map((col: any) => ({ value: String(col.id), text: col.label }));
              surveyJson.elements[0].rightItems = question.matchingColumns
                .filter((col: any) => col.side === 'right')
                .map((col: any) => ({ value: String(col.id), text: col.label }));
            }

            const model = new Model(surveyJson);
            model.applyTheme(BorderlessLight);
            model.showCompleteButton = false;
            model.showProgressBar = "off";
            model.showQuestionNumbers = "off";
            model.showNavigationButtons = false;
            model.showCompletedPage = false;
            model.showPreviewBeforeComplete = "off";
            model.showCorrectAnswers = false;
            model.mode = "display"; // Chế độ chỉ đọc

            // Thiết lập câu trả lời đã chọn của người dùng
            const userAnswer = data.answers[question.id];
            if (userAnswer !== undefined) {
              try {
                // Nếu là JSON string (cho checkbox, itemConnector), parse nó
                if (typeof userAnswer === 'string' && (userAnswer.startsWith('[') || userAnswer.startsWith('{'))) {
                  model.data = { [`question_${question.id}`]: JSON.parse(userAnswer) };
                } else {
                  model.data = { [`question_${question.id}`]: userAnswer };
                }
              } catch (e) {
                // Nếu không parse được, thử dùng giá trị như bình thường
                model.data = { [`question_${question.id}`]: userAnswer };
              }
            }

            models[question.id] = model;
          });

          setSurveyModels(models);
        }
      } catch (error) {
        console.error('Error fetching attempt details:', error);
        setError('Có lỗi xảy ra khi tải chi tiết bài thi');
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptDetails();
  }, [id]);

  // Cập nhật danh sách câu hỏi đã sắp xếp khi questions thay đổi
  useEffect(() => {
    if (attemptDetail?.questions && attemptDetail.questions.length > 0) {
      setSortedQuestions(sortQuestions(attemptDetail.questions));
    }
  }, [attemptDetail?.questions, sortQuestions]);

  // Cập nhật sharedMedia và câu hỏi liên quan khi chọn câu hỏi mới
  useEffect(() => {
    if (attemptDetail?.questions && attemptDetail.questions.length > 0 && currentQuestionIndex < attemptDetail.questions.length) {
      const currentQuestion = attemptDetail.questions[currentQuestionIndex];
      if (currentQuestion.sharedMedia) {
        const groups = groupQuestionsBySharedMedia(attemptDetail.questions);
        const mediaId = currentQuestion.sharedMedia.id;
        setCurrentSharedMedia(currentQuestion.sharedMedia);
        setCurrentMediaQuestions(groups[mediaId] || []);
      } else {
        setCurrentSharedMedia(null);
        setCurrentMediaQuestions([currentQuestion]);
      }
    }
  }, [currentQuestionIndex, attemptDetail?.questions, groupQuestionsBySharedMedia]);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(',', ' -');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-600"></div>
          <p className="mt-2">Đang tải chi tiết bài thi...</p>
        </div>
      </div>
    );
  }

  if (error || !attemptDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error || 'Không tìm thấy chi tiết bài thi'}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => navigate('/attempts')}
          >
            Quay lại danh sách bài thi
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round((attemptDetail.score || 0) / attemptDetail.maxScore * 100);

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 py-5">
          {/* Cột trái: danh sách câu hỏi, thông tin user, progress bar */}
          <div className="layout-content-container flex flex-col w-80">
            <div className="flex h-full min-h-[700px] flex-col justify-between bg-slate-50 p-4">
              <div className="flex flex-col gap-4">
                {/* User Info & Exam Icon */}
                <div className="flex gap-3 items-center">
                  <img
                    src={user?.avatar ? `${baseURL}${user?.avatar}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'U')}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-[#d0dbe7]"
                  />
                  <div className="flex flex-col">
                    <h2 className="text-[#0e141b] text-sm text-[18px] font-medium leading-normal">{user?.name}</h2>
                    <p className="text-[#49719c] text-sm font-normal leading-normal">{user?.email}</p>
                  </div>
                </div>

                {/* Thông tin bài thi */}
                <div className="flex flex-col gap-2">
                  <p className="text-[#0d141c] text-lg font-semibold">{attemptDetail.title}</p>
                  <p className="text-[#49719c] text-sm">Lớp: {attemptDetail.className}</p>
                  <p className="text-[#49719c] text-xs">Bắt đầu: {formatDateTime(attemptDetail.startTime)}</p>
                  <p className="text-[#49719c] text-xs">Nộp bài: {formatDateTime(attemptDetail.endTime || '')}</p>
                </div>

                {/* Progress Bar */}
                <div className="flex flex-col gap-1 mb-2">
                  <div className="flex justify-between text-xs text-[#49719c]">
                    <span>Điểm số</span>
                    <span>{attemptDetail.score}/{attemptDetail.maxScore} điểm</span>
                  </div>
                  <div className="rounded bg-[#cedbe8] h-2 w-full">
                    <div className={`h-2 rounded ${progressPercentage >= 75 ? 'bg-green-500' : progressPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                </div>

                {/* Question List */}
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium text-[#49719c] mb-1">Danh sách câu hỏi:</div>
                  {sortedQuestions.map((q, index) => {
                    const originalIndex = attemptDetail.questions.findIndex(question => question.id === q.id);
                    let IconSource;
                    let resultIcon = null;
                    const hasAnswer = typeof attemptDetail.answers[q.id] !== 'undefined' && attemptDetail.answers[q.id] !== "";

                    if (attemptDetail.correctAnswers) {
                      const isCorrect = hasAnswer &&
                        attemptDetail.correctAnswers[q.id] &&
                        JSON.stringify(attemptDetail.answers[q.id]) === JSON.stringify(attemptDetail.correctAnswers[q.id]);

                      if (hasAnswer) {
                        IconSource = isCorrect ? DotFillTrueIcon : DotFillFalseIcon;
                        resultIcon = isCorrect ? (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        );
                      } else {
                        IconSource = DotRegularIcon;
                        resultIcon = null;
                      }
                    } else { // Trường hợp không có correctAnswers
                      IconSource = hasAnswer ? DotFillIcon : DotRegularIcon;
                      resultIcon = null;
                    }

                    return (
                      <div
                        key={q.id}
                        onClick={() => handleSelectQuestion(index)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer ${originalIndex === currentQuestionIndex ? 'bg-[#e7edf4]' : 'hover:bg-slate-100'}`}
                      >
                        <img src={IconSource} className='w-5 h-5' alt='status icon' />
                        <p className="text-[#0d141c] text-sm font-medium leading-normal flex-1 line-clamp-1">{q.title}</p>
                        {resultIcon}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => navigate('/attempts')}
                  className="w-full mt-4 px-4 py-3 text-base font-medium rounded-xl shadow-sm bg-slate-200 hover:bg-slate-300 text-[#0e141b] focus:outline-none"
                >
                  Quay lại danh sách
                </button>
              </div>
            </div>
          </div>

          {/* Cột phải: Hiển thị câu hỏi */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Thông tin kết quả bài thi */}
            <div className="flex flex-col gap-2 p-4 border-b border-slate-200">
              <h1 className="text-[#0d141c] font-bold leading-tight tracking-[-0.015em] text-xl">
                {attemptDetail.title}
              </h1>
              <div className="flex justify-between items-center">
                <p className="text-[#49719c] font-normal leading-normal">
                  Kết quả: <span className={`font-medium ${progressPercentage >= 75 ? 'text-green-600' : progressPercentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {attemptDetail.score}/{attemptDetail.maxScore} điểm ({progressPercentage}%)
                  </span>
                </p>
                <p className="text-[#49719c] text-sm">
                  Thời gian làm bài: {attemptDetail.endTime ? Math.round((new Date(attemptDetail.endTime).getTime() - new Date(attemptDetail.startTime).getTime()) / 60000) : 0} phút
                </p>
              </div>
            </div>

            {/* Shared Media */}
            {currentSharedMedia && (
              <div className="p-4 border-b border-slate-200">
                {currentSharedMedia.mediaType === 0 && currentSharedMedia.text && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{currentSharedMedia.text}</p>
                  </div>
                )}
                {currentSharedMedia.mediaType === 1 && currentSharedMedia.mediaUrl && (
                  <img
                    src={`${baseURL}${currentSharedMedia.mediaUrl}`}
                    alt="Question media"
                    className="max-w-full h-auto rounded-md"
                  />
                )}
                {currentSharedMedia.mediaType === 2 && currentSharedMedia.mediaUrl && (
                  <audio controls className="w-full">
                    <source src={`${baseURL}${currentSharedMedia.mediaUrl}`} type="audio/mpeg" />
                    Định dạng file không được hỗ trợ
                  </audio>
                )}
                {currentSharedMedia.mediaType === 3 && currentSharedMedia.mediaUrl && (
                  <video controls className="w-full">
                    <source src={`${baseURL}${currentSharedMedia.mediaUrl}`} type="video/mp4" />
                    Định dạng file không được hỗ trợ
                  </video>
                )}
              </div>
            )}

            {/* Questions with same shared media */}
            <div className="overflow-y-auto">
              {currentMediaQuestions.map((question) => (
                <div key={question.id} className="p-4 border-b border-slate-200">
                  {surveyModels[question.id] && (
                    <div className="survey-container mb-4">
                      <Survey
                        model={surveyModels[question.id]}
                        readOnly={true}
                      />
                    </div>
                  )}

                  {/* Hiển thị đáp án đúng */}
                  {attemptDetail.correctAnswers && attemptDetail.correctAnswers[question.id] && (
                    <div className="p-3 border rounded-md bg-green-50 border-green-300 shadow">
                      <h4 className="text-md font-semibold text-green-800 mb-2">Đáp án đúng:</h4>
                      <FormatCorrectAnswer
                        correctAnswerData={attemptDetail.correctAnswers[question.id]}
                        question={question}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between p-4 border-t border-slate-200">
              <button
                onClick={() => handleSelectQuestion(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-slate-200 text-slate-700 text-base font-semibold rounded-xl hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trở lại
              </button>
              <button
                onClick={() => handleSelectQuestion(Math.min(attemptDetail.questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === attemptDetail.questions.length - 1}
                className="px-6 py-3 bg-[#0d7cf2] text-white text-base font-semibold rounded-xl shadow-sm hover:bg-[#0b68c3] focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Tiếp theo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptDetailPage;
