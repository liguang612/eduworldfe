import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Thêm useMemo
import { useParams, useNavigate } from 'react-router-dom';
import { getExamAttemptDetails, type ExamAttemptDetails } from '@/api/attemptApi';
import { type Question, type SharedMedia } from '@/api/questionApi'; // Đảm bảo ChoiceOption được import nếu cần cho Question type
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { BorderlessLight } from 'survey-core/themes';
import 'survey-core/survey-core.css';
import '@/components/Question/survey-custom.css';
import FormatCorrectAnswer from '@/components/Question/FormatCorrectAnswer';
import DotRegularIcon from '@/assets/dot_regular.svg';
import DotFillTrueIcon from '@/assets/dot_fill_true.svg';
import DotFillFalseIcon from '@/assets/dot_fill_false.svg';
import DotFillIcon from '@/assets/dot_fill.svg';
import { checkAnswerCorrectness } from '@/lib/utils';
import ProfileDialog from '@/components/Auth/UserInformationPopup';
import type { User } from '@/contexts/AuthContext';

const AttemptDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [attemptDetail, setAttemptDetail] = useState<ExamAttemptDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyModels, setSurveyModels] = useState<{ [key: string]: Model }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0); // Index này trỏ vào attemptDetail.questions
  const [sortedQuestions, setSortedQuestions] = useState<Question[]>([]);
  const [currentSharedMedia, setCurrentSharedMedia] = useState<SharedMedia | null>(null);
  const [currentMediaQuestions, setCurrentMediaQuestions] = useState<Question[]>([]);

  // State for user information popup
  const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Hàm để nhóm các câu hỏi theo sharedMedia
  const groupQuestionsBySharedMedia = useCallback((questions: Question[] | undefined) => {
    const groups: { [key: string]: Question[] } = {};
    if (!questions) return groups;
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

  // SỬA ĐỔI HÀM NÀY
  const sortQuestions = useCallback((questionsToSort: Question[] | undefined) => {
    if (!questionsToSort || questionsToSort.length === 0) return [];

    const groups = groupQuestionsBySharedMedia(questionsToSort);
    const sortedResult: Question[] = [];
    const processedIds = new Set<string>();

    const mediaGroupEntries: [number, Question[]][] = [];
    Object.values(groups).forEach(group => {
      if (group.length > 0 && group[0].sharedMedia) {
        const firstQuestionOriginalIndex = questionsToSort.findIndex(q => q.id === group[0].id);
        if (firstQuestionOriginalIndex !== -1) {
          mediaGroupEntries.push([firstQuestionOriginalIndex, group]);
        }
      }
    });

    mediaGroupEntries.sort((entryA, entryB) => entryA[0] - entryB[0]);

    mediaGroupEntries.forEach(([, group]) => {
      group.forEach(qInGroup => {
        if (!processedIds.has(qInGroup.id)) {
          sortedResult.push(qInGroup);
          processedIds.add(qInGroup.id);
        }
      });
    });

    questionsToSort.forEach(q => {
      if (!processedIds.has(q.id)) {
        sortedResult.push(q);
        // processedIds.add(q.id); // Không thực sự cần add ở đây nếu đây là lần cuối cùng
      }
    });
    return sortedResult;
  }, [groupQuestionsBySharedMedia]);

  // Cập nhật currentQuestionIndex khi chọn câu hỏi từ danh sách đã sắp xếp
  const handleSelectQuestion = (indexInSortedList: number) => {
    if (!attemptDetail?.questions || sortedQuestions.length === 0) return;
    // Đảm bảo indexInSortedList nằm trong phạm vi hợp lệ của sortedQuestions
    if (indexInSortedList < 0 || indexInSortedList >= sortedQuestions.length) return;

    const question = sortedQuestions[indexInSortedList];
    const originalIndex = attemptDetail.questions.findIndex(q => q.id === question.id);
    if (originalIndex !== -1) { // Thêm kiểm tra này
      setCurrentQuestionIndex(originalIndex);
    }
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
        if (data.questions && data.questions.length > 0) {
          const models: { [key: string]: Model } = {};
          data.questions.forEach((question: Question) => {
            const surveyJson: any = {
              elements: [{
                name: `question_${question.id}`,
                title: question.title,
                type: question.type === 'radio' ? 'radiogroup' :
                  question.type === 'checkbox' ? 'checkbox' :
                    question.type === 'itemConnector' ? 'itemConnector' :
                      question.type === 'ranking' ? 'ranking' : 'text',
                choices: question.choices?.map((choice: any) => ({ // choice type có thể cần định nghĩa rõ hơn
                  value: String(choice.value),
                  text: choice.text,
                })),
              }]
            };
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
            model.mode = "display";
            const userAnswer = data.answers[question.id];
            if (userAnswer !== undefined) {
              try {
                let parsedAnswer = userAnswer;
                if (typeof userAnswer === 'string') {
                  if (question.type === 'checkbox' || question.type === 'itemConnector' || question.type === 'ranking') {
                    // Chỉ parse nếu nó có vẻ là JSON array hoặc object
                    if (userAnswer.startsWith('[') || userAnswer.startsWith('{')) {
                      parsedAnswer = JSON.parse(userAnswer);
                    }
                  }
                }
                model.data = { [`question_${question.id}`]: parsedAnswer };

              } catch (e) {
                console.warn(`Failed to parse answer for question ${question.id}:`, userAnswer, e);
                model.data = { [`question_${question.id}`]: userAnswer };
              }
            }
            models[question.id] = model;
          });
          setSurveyModels(models);
          // Đặt câu hỏi đầu tiên làm câu hỏi hiện tại sau khi load
          if (data.questions.length > 0) {
            setCurrentQuestionIndex(0);
          }
        }
      } catch (err) {
        console.error('Error fetching attempt details:', err);
        setError('Có lỗi xảy ra khi tải chi tiết bài thi');
      } finally {
        setLoading(false);
      }
    };
    fetchAttemptDetails();
  }, [id]);

  useEffect(() => {
    if (attemptDetail?.questions && attemptDetail.questions.length > 0) {
      setSortedQuestions(sortQuestions(attemptDetail.questions));
    } else {
      setSortedQuestions([]);
    }
  }, [attemptDetail?.questions, sortQuestions]);

  useEffect(() => {
    const questions = attemptDetail?.questions;
    if (questions && questions.length > 0 && currentQuestionIndex >= 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion.sharedMedia) {
        const groups = groupQuestionsBySharedMedia(questions);
        const mediaId = currentQuestion.sharedMedia.id;
        setCurrentSharedMedia(currentQuestion.sharedMedia);
        setCurrentMediaQuestions(groups[mediaId] || []);
      } else {
        setCurrentSharedMedia(null);
        setCurrentMediaQuestions(currentQuestion ? [currentQuestion] : []);
      }
    } else if (questions && questions.length > 0 && sortedQuestions.length > 0) {
      const firstSortedQuestion = sortedQuestions[0];
      if (firstSortedQuestion) {
        const originalIndex = questions.findIndex(q => q.id === firstSortedQuestion.id);
        if (originalIndex !== -1 && currentQuestionIndex !== originalIndex) {
          setCurrentQuestionIndex(originalIndex);
        }
      }
    } else {
      setCurrentSharedMedia(null);
      setCurrentMediaQuestions([]);
    }
  }, [currentQuestionIndex, attemptDetail?.questions, groupQuestionsBySharedMedia, sortedQuestions]);


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

  const currentQuestionInSortedListIndex = useMemo(() => {
    if (!attemptDetail?.questions || !attemptDetail.questions[currentQuestionIndex] || sortedQuestions.length === 0) return -1;
    return sortedQuestions.findIndex(q => q.id === attemptDetail.questions[currentQuestionIndex].id);
  }, [currentQuestionIndex, attemptDetail?.questions, sortedQuestions]);


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
                  <div
                    className="flex gap-3 items-center cursor-pointer"
                    onClick={() => {
                      if (attemptDetail?.userId && attemptDetail.studentName && attemptDetail.studentAvatar && attemptDetail.studentEmail) {
                        const studentUser = {
                          id: attemptDetail.userId,
                          name: attemptDetail.studentName,
                          avatar: attemptDetail.studentAvatar,
                          email: attemptDetail.studentEmail,
                        };
                        setSelectedUser(studentUser as User);
                        setIsUserPopupOpen(true);
                      }
                    }}
                  >
                    <img
                      src={`${attemptDetail.studentAvatar}`}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border border-[#d0dbe7]"
                    />
                    <div className="flex flex-col">
                      <h2 className="text-[#0e141b] text-sm text-[18px] font-medium leading-normal">{attemptDetail.studentName}</h2>
                      <p className="text-[#49719c] text-sm font-normal leading-normal">{attemptDetail.studentEmail}</p>
                      <p className="text-[#49719c] text-xs font-normal leading-normal">{attemptDetail.studentSchool}</p>
                    </div>
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
                  {sortedQuestions.map((q_sorted, index_in_sorted_list) => {
                    const isCurrentlySelected = q_sorted.id === attemptDetail.questions[currentQuestionIndex]?.id;
                    const originalQuestionData = attemptDetail.questions.find(oq => oq.id === q_sorted.id) || q_sorted;

                    let IconSource;
                    let resultIcon = null;
                    const userAnswer = attemptDetail.answers[originalQuestionData.id];
                    const hasAnswer = typeof userAnswer !== 'undefined' && userAnswer !== "" && userAnswer !== null;

                    if (attemptDetail.correctAnswers) {
                      let isCorrect = false;
                      if (hasAnswer) {
                        const correctAnswer = attemptDetail.correctAnswers[originalQuestionData.id];
                        const questionType = originalQuestionData.type;

                        isCorrect = checkAnswerCorrectness(userAnswer, correctAnswer, questionType);
                      }

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
                        resultIcon = (
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        );
                      }
                    } else {
                      IconSource = hasAnswer ? DotFillIcon : DotRegularIcon;
                      resultIcon = null;
                    }

                    return (
                      <div
                        key={q_sorted.id}
                        onClick={() => handleSelectQuestion(index_in_sorted_list)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer ${isCurrentlySelected ? 'bg-[#e7edf4]' : 'hover:bg-slate-100'}`}
                      >
                        <img src={IconSource} className='w-5 h-5' alt='status icon' />
                        <p className="text-[#0d141c] text-sm font-medium leading-normal flex-1 line-clamp-1">{q_sorted.title}</p>
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
                  {' '}
                  {attemptDetail.endTime ? Math.round((new Date(attemptDetail.endTime).getTime() - new Date(attemptDetail.startTime).getTime()) / 1000) % 60 : 0} giây
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
                    src={`${currentSharedMedia.mediaUrl}`}
                    alt="Question media"
                    className="max-w-full h-auto rounded-md"
                  />
                )}
                {currentSharedMedia.mediaType === 2 && currentSharedMedia.mediaUrl && (
                  <audio controls className="w-full">
                    <source src={`${currentSharedMedia.mediaUrl}`} type="audio/mpeg" />
                    Định dạng file không được hỗ trợ
                  </audio>
                )}
                {currentSharedMedia.mediaType === 3 && currentSharedMedia.mediaUrl && (
                  <video controls className="w-full">
                    <source src={`${currentSharedMedia.mediaUrl}`} type="video/mp4" />
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
                  {attemptDetail.correctAnswers && attemptDetail.correctAnswers[question.id] !== undefined && (
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
                onClick={() => handleSelectQuestion(currentQuestionInSortedListIndex - 1)}
                disabled={currentQuestionInSortedListIndex <= 0}
                className="px-6 py-3 bg-slate-200 text-slate-700 text-base font-semibold rounded-xl hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trở lại
              </button>
              <button
                onClick={() => handleSelectQuestion(currentQuestionInSortedListIndex + 1)}
                disabled={currentQuestionInSortedListIndex >= sortedQuestions.length - 1 || sortedQuestions.length === 0}
                className="px-6 py-3 bg-[#0d7cf2] text-white text-base font-semibold rounded-xl shadow-sm hover:bg-[#0b68c3] focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Tiếp theo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Information Popup (ProfileDialog) */}
      <ProfileDialog
        isOpen={isUserPopupOpen}
        onClose={() => setIsUserPopupOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default AttemptDetailPage;