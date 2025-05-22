import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ClearIcon from '@/assets/clear.svg';
import DotRegularIcon from '@/assets/dot_regular.svg';
import DotFillIcon from '@/assets/dot_fill.svg';
import DotFillFlagIcon from '@/assets/dot_fill_flag.svg';
import FlagIcon from '@/assets/flag.svg';
import FlagFillIcon from '@/assets/flag_fill.svg';
import { useAuth } from '@/contexts/AuthContext';
import { baseURL } from '@/config/axios';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { getSubjectById, type Subject } from '../api/courseApi';
import { type Question } from '../api/questionApi';
import { getExamQuestionsDetails, startExamAttempt } from '../api/examApi';
import { saveExamAnswer, submitExamAttempt } from '../api/examApi';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { BorderlessLight } from 'survey-core/themes';
import 'survey-core/survey-core.css';
import "../components/Question/survey-custom.css";
import { toast, ToastContainer } from 'react-toastify';
import { type ChoiceOption } from '../api/questionApi';
import { type Exam } from '../api/examApi';
import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog';
import { debounce } from '@/lib/utils';

const initialQuestionsData: Question[] = [];

const DoExamPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestionsData);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [surveyModels, setSurveyModels] = useState<{ [key: string]: Model }>({});
  const [isGrading, setIsGrading] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  const { user } = useAuth();
  const { examId } = useParams<{ examId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { subjectId, attemptId: locationAttemptId } = location.state || {};

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);

  const [currentSharedMedia, setCurrentSharedMedia] = useState<any>(null);
  const [currentMediaQuestions, setCurrentMediaQuestions] = useState<Question[]>([]);
  const [sortedQuestions, setSortedQuestions] = useState<Question[]>([]);

  // State for timer
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Tìm và thiết lập attemptId từ location state hoặc localStorage
  useEffect(() => {
    if (examId) {
      if (locationAttemptId) {
        setAttemptId(locationAttemptId);
      } else {
        const savedAttemptId = localStorage.getItem(`exam_attempt_${examId}`);
        if (savedAttemptId) {
          setAttemptId(savedAttemptId);
        } else {
          toast.error('Không tìm thấy phiên làm bài hợp lệ');
          navigate(`/courses/${examId}/exams/instructions`, {
            state: { examId, courseId: subjectId }
          });
        }
      }
    }
  }, [examId, locationAttemptId, navigate, subjectId]);

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

  const sortQuestions = useCallback((questions: Question[]) => {
    const groups = groupQuestionsBySharedMedia(questions);
    const sorted: (Question | null)[] = [];
    const processedIds = new Set<string>();

    Object.values(groups).forEach(group => {
      if (group.length > 0 && group[0].sharedMedia) {
        const firstQuestionIndex = questions.findIndex(q => q.id === group[0].id);
        while (sorted.length <= firstQuestionIndex) {
          sorted.push(null);
        }
        group.forEach((q, groupIndex) => {
          const insertIndex = firstQuestionIndex + groupIndex;
          while (sorted.length <= insertIndex) {
            sorted.push(null);
          }
          sorted[insertIndex] = q;
          processedIds.add(q.id);
        });
      }
    });

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

    return sorted.filter((item): item is Question => item !== null);
  }, [groupQuestionsBySharedMedia]);

  useEffect(() => {
    if (questions.length > 0) {
      setSortedQuestions(sortQuestions(questions));
    }
  }, [questions, sortQuestions]);

  const handleSelectQuestion = (index: number) => {
    if (index >= 0 && index < sortedQuestions.length) {
      const question = sortedQuestions[index];
      const originalIndex = questions.findIndex(q => q.id === question.id);
      setCurrentQuestionIndex(originalIndex);
    }
  };

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion.sharedMedia) {
        const groups = groupQuestionsBySharedMedia(questions);
        const mediaId = currentQuestion.sharedMedia.id;
        setCurrentSharedMedia(currentQuestion.sharedMedia);
        setCurrentMediaQuestions(groups[mediaId] || []);
      } else {
        setCurrentSharedMedia(null);
        setCurrentMediaQuestions([currentQuestion]);
      }
    } else if (questions.length > 0 && sortedQuestions.length > 0) {
      // Handle initial load or invalid index by selecting the first sorted question
      const firstSortedQuestion = sortedQuestions[0];
      const originalIndex = questions.findIndex(q => q.id === firstSortedQuestion.id);
      if (originalIndex !== -1) {
        setCurrentQuestionIndex(originalIndex);
      }
    }
  }, [currentQuestionIndex, questions, groupQuestionsBySharedMedia, sortedQuestions]);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        if (subjectId) {
          const data = await getSubjectById(subjectId);
          setSubject(data);
        }
      } catch (error) {
        console.error('Error fetching subject:', error);
      }
    };
    fetchSubject();
  }, [subjectId]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!examId) {
          setQuestions([]);
          setLoadingQuestions(false);
          return;
        }

        setLoadingQuestions(true);

        const attemptResponse = await startExamAttempt(examId);
        const attempt = attemptResponse;

        // Lưu attemptId vào localStorage (nếu có attempt mới hoặc đang làm dở)
        if (attempt && attempt.id) {
          localStorage.setItem(`exam_attempt_${examId}`, attempt.id);
          setAttemptId(attempt.id);
        }

        // Lấy thông tin đề thi và câu hỏi
        const examDetailsResponse = await getExamQuestionsDetails(examId);
        setExam(examDetailsResponse.exam);
        let formattedQuestions: Question[] = examDetailsResponse.questions.map((q: any) => ({
          ...q,
          selectedOptionIndex: null,
          isFlagged: false,
        }));

        // Khởi tạo models cho các câu hỏi
        const models: { [key: string]: Model } = {};
        formattedQuestions.forEach(question => {
          const surveyJson: any = {
            elements: [{
              name: `question_${question.id}`,
              title: question.title,
              type: question.type === 'radio' ? 'radiogroup' :
                question.type === 'checkbox' ? 'checkbox' :
                  question.type === 'itemConnector' ? 'itemConnector' :
                    question.type === 'ranking' ? 'ranking' : 'text',
              choices: question.choices?.map((choice: ChoiceOption) => ({
                value: String(choice.value),
                text: choice.text,
              })),
            }]
          };

          if (question.type === 'itemConnector' && question.matchingColumns) {
            surveyJson.elements[0].leftItems = question.matchingColumns
              .filter(col => col.side === 'left')
              .map(col => ({ value: String(col.id), text: col.label }));
            surveyJson.elements[0].rightItems = question.matchingColumns
              .filter(col => col.side === 'right')
              .map(col => ({ value: String(col.id), text: col.label }));
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
          model.textUpdateMode = "onTyping";

          models[question.id] = model;
        });

        setSurveyModels(models);

        // Nếu attempt có trạng thái 'in_progress' và có startTime, khôi phục trạng thái
        if (attempt && attempt.status === 'in_progress' && attempt.startTime && attempt.duration !== undefined) {
          // Tính toán thời gian còn lại
          const startTime = new Date(attempt.startTime);
          const now = new Date();
          const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          const remainingSeconds = Math.max(0, attempt.duration * 60 - elapsedSeconds);
          setTimeLeft(remainingSeconds);
          setIsTimerActive(true);

          // Khôi phục các câu trả lời đã làm và cập nhật trạng thái câu hỏi
          if (attempt.savedAnswers) {
            const updatedQuestions = [...formattedQuestions];
            Object.entries(attempt.savedAnswers).forEach(([questionId, answer]) => {
              const model = models[questionId];
              if (model && answer !== "") {
                model.setValue(`question_${questionId}`, answer);

                const questionIndex = updatedQuestions.findIndex(q => q.id === questionId);
                if (questionIndex !== -1) {
                  updatedQuestions[questionIndex] = {
                    ...updatedQuestions[questionIndex],
                    selectedOptionIndex: 0
                  };
                }
              }
            });
            formattedQuestions = updatedQuestions;
          }
        } else if (examDetailsResponse.exam && examDetailsResponse.exam.durationMinutes > 0) {
          setTimeLeft(examDetailsResponse.exam.durationMinutes * 60);
          setIsTimerActive(true);
        }

        setQuestions(formattedQuestions); // Cập nhật state questions sau khi đã khôi phục đáp án

      } catch (error) {
        console.error('Error fetching exam details or starting attempt:', error);
        setQuestions([]);
        toast.error('Có lỗi xảy ra khi tải dữ liệu bài thi.');

        navigate(`/courses/${subjectId}/exams/instructions`, { state: { examId, courseId: subjectId } });
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [examId]);

  // Timer
  useEffect(() => {
    if (isTimerActive && timeLeft !== null && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime !== null ? Math.max(0, prevTime - 1) : null));
      }, 1000);
      return () => clearInterval(timerId);
    } else if (isTimerActive && timeLeft === 0) {
      setIsTimerActive(false);
      toast.error('Đã hết giờ làm bài! Bài của bạn sẽ được nộp tự động.');

      handleSubmit();
    }
  }, [isTimerActive, timeLeft]);

  const handleToggleFlag = () => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, idx) =>
        idx === currentQuestionIndex ? { ...q, isFlagged: !q.isFlagged } : q
      )
    );
  };

  const handleClearResponse = () => {
    if (currentQuestion) {
      const model = surveyModels[currentQuestion.id];
      if (model) {
        model.clearValue(`question_${currentQuestion.id}`);
        if (currentQuestion.type === 'itemConnector') {
          const itemConnectorComponent = document.querySelector(`[data-question-id="${currentQuestion.id}"] .item-connector`);
          if (itemConnectorComponent) {
            const event = new CustomEvent('connectionsChange', { detail: [] });
            itemConnectorComponent.dispatchEvent(event);
          }
        }
        setQuestions((prevQuestions) =>
          prevQuestions.map((q, idx) =>
            idx === currentQuestionIndex ? { ...q, selectedOptionIndex: null } : q
          )
        );
      }
    }
  };

  const answeredQuestionsCount = useMemo(
    () => {
      return questions.filter(q => {
        const model = surveyModels[q.id];
        if (!model) return false;
        const value = model.getValue(`question_${q.id}`);
        return value !== undefined && value !== null && value !== "" && (Array.isArray(value) ? value.length > 0 : true);
      }).length;
    },
    [questions, surveyModels]
  );

  const progressPercentage = useMemo(
    () => (questions.length > 0 ? (answeredQuestionsCount / questions.length) * 100 : 0),
    [answeredQuestionsCount, questions.length]
  );

  // Thêm debounce để tránh gọi API liên tục
  const debouncedSaveAnswer = useCallback(
    debounce(async (questionId: string, answer: any) => {
      if (!attemptId || !questionId) return;

      setSaveStatus('saving');
      try {
        await saveExamAnswer(attemptId, questionId, answer);
        setSaveStatus('saved');
        setLastSavedTime(new Date());
      } catch (error) {
        console.error('Lỗi khi lưu câu trả lời:', error);
        setSaveStatus('error');
      }
    }, 1000),
    [attemptId]
  );

  // Chỉnh sửa hàm xử lý khi giá trị survey thay đổi để lưu câu trả lời
  const handleSurveyValueChange = (questionId: string, model: Model) => {
    const value = model.getValue(`question_${questionId}`);
    const isAnswered = value !== undefined && value !== null &&
      (Array.isArray(value) ? value.length > 0 : value !== "");

    // Cập nhật UI
    if (isAnswered) {
      const questionIndex = questions.findIndex(q => q.id === questionId);
      if (questionIndex !== -1 && (questions[questionIndex].selectedOptionIndex === null || questions[questionIndex].selectedOptionIndex === undefined)) {
        setQuestions((prevQuestions) =>
          prevQuestions.map((q, idx) =>
            idx === questionIndex ? { ...q, selectedOptionIndex: 0 } : q
          )
        );
      }
    } else {
      const questionIndex = questions.findIndex(q => q.id === questionId);
      if (questionIndex !== -1) {
        setQuestions((prevQuestions) =>
          prevQuestions.map((q, idx) =>
            idx === questionIndex ? { ...q, selectedOptionIndex: null } : q
          )
        );
      }
    }

    // Lưu câu trả lời lên server
    if (value !== undefined && value !== null) {
      debouncedSaveAnswer(questionId, value);
    }
  };

  // Chỉnh sửa hàm nộp bài
  const submitExam = async () => {
    try {
      setIsGrading(true);
      setIsTimerActive(false);

      // Chắc chắn rằng tất cả câu trả lời đã được lưu
      const answersToSave = [];
      for (const question of questions) {
        const model = surveyModels[question.id];
        if (model) {
          const questionName = `question_${question.id}`;
          const value = model.getValue(questionName);

          if (value !== undefined && value !== null && (Array.isArray(value) ? value.length > 0 : value !== "")) {
            answersToSave.push({ questionId: question.id, value });
          }
        }
      }

      // Lưu các câu trả lời còn lại
      if (attemptId && answersToSave.length > 0) {
        await Promise.all(
          answersToSave.map(item => saveExamAnswer(attemptId, item.questionId, item.value))
        );
      }

      // Nộp bài
      if (attemptId) {
        await submitExamAttempt(attemptId);
      }

      // Xóa attemptId khỏi localStorage vì bài thi đã hoàn thành
      localStorage.removeItem(`exam_attempt_${examId}`);

      // Chuyển hướng sang trang chúc mừng
      navigate(`/attempts/${attemptId}/congratulation`, {
        state: {
          examId,
          courseId: subjectId,
          attemptId
        }
      });

    } catch (error) {
      console.error('Lỗi khi nộp bài:', error);
      setIsGrading(false);
      toast.error('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
    }
  };

  const handleSubmit = async () => {
    if (timeLeft !== null && timeLeft > 0) {
      setShowSubmitConfirm(true);
      return;
    }

    // Nếu hết thời gian rồi thì nộp bài luôn
    submitExam();
  };

  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false);
    submitExam();
  };

  // Helper function to format time
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loadingQuestions) {
    return <div>Đang tải câu hỏi...</div>;
  }

  if (!questions || questions.length === 0) {
    return <div>Không tìm thấy câu hỏi nào cho đề thi này.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const rootStyle = {
    "--checkbox-tick-svg": "url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(248,250,252)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')",
    "--radio-dot-svg": "url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(13,124,242)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3ccircle cx=%278%27 cy=%278%27 r=%273%27/%3e%3c/svg%3e')",
    fontFamily: 'Lexend, "Noto Sans", sans-serif',
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={rootStyle as React.CSSProperties}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 py-5">
          <div className="layout-content-container flex flex-col w-80">
            <div className="flex h-full min-h-[700px] flex-col justify-between bg-slate-50 p-4">
              <div className="flex flex-col gap-4">
                <div className="flex gap-3 items-center">
                  <img
                    src={user?.avatar ? `${baseURL}${user?.avatar}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'U')}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-[#d0dbe7]"
                  />
                  <div className="flex flex-col">
                    <h2 className="text-[#0d141c] text-sm text-[18px] font-medium leading-normal">{user?.name}</h2>
                    <p className="text-[#49719c] text-sm font-normal leading-normal">{user?.email}</p>
                  </div>
                </div>

                <div className="text-xs text-end">
                  {saveStatus === 'saving' && <span className="text-amber-500">Đang lưu...</span>}
                  {saveStatus === 'saved' && <span className="text-green-600">Đã lưu lúc {lastSavedTime?.toLocaleTimeString()}</span>}
                  {saveStatus === 'error' && <span className="text-red-500">Lỗi khi lưu!</span>}
                </div>

                <div className="flex flex-col gap-1 mb-2">
                  <div className="flex justify-between text-xs text-[#49719c]">
                    <span>Tiến độ</span>
                    <span>{answeredQuestionsCount}/{questions.length} câu</span>
                  </div>
                  <div className="rounded bg-[#cedbe8] h-2 w-full">
                    <div className="h-2 rounded bg-[#0d7cf2]" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {sortedQuestions.map((q, index) => {
                    const originalIndex = questions.findIndex(question => question.id === q.id);
                    let resultIcon = null;
                    let IconSource = DotRegularIcon;

                    if (q.isFlagged) {
                      IconSource = DotFillFlagIcon;
                    } else if (surveyModels[q.id]?.getValue(`question_${q.id}`) !== undefined) {
                      IconSource = DotFillIcon;
                    }

                    return (
                      <div
                        key={q.id}
                        onClick={() => handleSelectQuestion(index)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer ${originalIndex === currentQuestionIndex ? 'bg-[#e7edf4]' : 'hover:bg-slate-100'
                          }`}
                      >
                        <img src={IconSource} className='w-5 h-5' alt='status icon' />
                        <p className="text-[#0d141c] text-sm font-medium leading-normal flex-1">{`${index + 1}. ${q.title}`}</p>
                        {resultIcon}
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isGrading || (timeLeft === 0 && !isTimerActive)} // Disable submit if time is up and timer stopped
                  className="w-full mt-4 px-4 py-3 bg-[#0d7cf2] text-white text-base font-semibold rounded-xl shadow-sm hover:bg-[#0b68c3] focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isGrading ? 'Đang nộp bài...' : 'Nộp bài'}
                </button>
              </div>
            </div>
          </div>

          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-col gap-2 p-4 border-b border-slate-200">
              <h1 className="text-[#0d141c] font-bold leading-tight tracking-[-0.015em] text-xl">
                {exam?.title}
              </h1>
              <div className="flex justify-between items-center">
                <p className="text-[#49719c] font-normal leading-normal">
                  Môn học: {subject ? `${subject.name} - Lớp: ${subject.grade}` : 'Đang tải...'}
                </p>
                {exam && <span>Điểm tối đa: {exam.maxScore}</span>}
                {exam && (
                  <div className="flex gap-4 text-[#49719c] text-sm items-center">
                    {timeLeft !== null && !isGrading && (
                      <span
                        className={`font-semibold ${timeLeft <= 300 && timeLeft > 0 ? 'text-red-500' : 'text-[#0d141c]'}`}
                      >
                        Thời gian còn lại: {formatTime(timeLeft)}
                      </span>
                    )}

                  </div>
                )}
              </div>
            </div>

            {currentSharedMedia && (
              <div className="p-4 border-b border-slate-200">
                {currentSharedMedia.mediaType === 0 && currentSharedMedia.text && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{currentSharedMedia.text}</p>
                  </div>
                )}
                {currentSharedMedia.mediaType === 1 && currentSharedMedia.mediaUrl && (
                  <audio controls className="w-full">
                    <source src={`${baseURL}${currentSharedMedia.mediaUrl}`} type="audio/mpeg" />
                    Định dạng file không được hỗ trợ
                  </audio>
                )}
                {currentSharedMedia.mediaType === 2 && currentSharedMedia.mediaUrl && (
                  <video controls className="w-full">
                    <source src={`${baseURL}${currentSharedMedia.mediaUrl}`} type="video/mp4" />
                    Định dạng file không được hỗ trợ
                  </video>
                )}
                {currentSharedMedia.mediaType === 3 && currentSharedMedia.mediaUrl && (
                  <img
                    src={`${baseURL}${currentSharedMedia.mediaUrl}`}
                    alt="Question media"
                    className="max-w-full h-auto rounded-md"
                  />
                )}
              </div>
            )}

            <div className="overflow-y-auto">
              {currentQuestion && currentMediaQuestions.map((question) => (
                <div key={question.id} className="p-4 border-b border-slate-200">
                  {surveyModels[question.id] && (
                    <div className="survey-container mb-4">
                      <Survey
                        model={surveyModels[question.id]}
                        onValueChanged={(sender: Model, _: any) => {
                          const value = sender.getValue(`question_${question.id}`);
                          sender.data = { [`question_${question.id}`]: value };
                          handleSurveyValueChange(question.id, sender);
                        }}
                        readOnly={!isTimerActive}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {currentQuestion && (
              <div className="px-4 pb-4 flex justify-end gap-3">
                <button
                  onClick={handleToggleFlag}
                  title={currentQuestion.isFlagged ? "Bỏ đánh dấu câu hỏi" : "Đánh dấu câu hỏi để xem lại"}
                  className={`p-2 rounded-lg hover:bg-slate-200 ${currentQuestion.isFlagged ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'text-slate-600'}`}
                  disabled={(timeLeft === 0 && !isTimerActive)}
                >
                  <img src={currentQuestion.isFlagged ? FlagFillIcon : FlagIcon} className="size-5" alt="flag icon" />
                </button>
                <button
                  onClick={handleClearResponse}
                  title="Xóa lựa chọn"
                  className="p-2 rounded-lg text-slate-600 hover:bg-slate-200"
                  disabled={(timeLeft === 0 && !isTimerActive)}
                >
                  <img src={ClearIcon} className='w-5 h-5' alt="clear response" />
                </button>
              </div>
            )}

            <div className="flex justify-between p-4 border-t border-slate-200">
              <button
                onClick={() => handleSelectQuestion(sortedQuestions.findIndex(q => q.id === currentQuestion?.id) - 1)}
                disabled={sortedQuestions.findIndex(q => q.id === currentQuestion?.id) === 0 || (timeLeft === 0 && !isTimerActive)}
                className="px-6 py-3 bg-slate-200 text-slate-700 text-base font-semibold rounded-xl hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trở lại
              </button>
              <button
                onClick={() => handleSelectQuestion(sortedQuestions.findIndex(q => q.id === currentQuestion?.id) + 1)}
                disabled={sortedQuestions.findIndex(q => q.id === currentQuestion?.id) === sortedQuestions.length - 1 || (timeLeft === 0 && !isTimerActive)}
                className="px-6 py-3 bg-[#0d7cf2] text-white text-base font-semibold rounded-xl shadow-sm hover:bg-[#0b68c3] focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Tiếp theo
              </button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        title="Xác nhận nộp bài"
        message="Bạn vẫn chắc chắn muốn nộp bài khi vẫn còn thời gian chứ?"
        onConfirm={handleConfirmSubmit}
        confirmButtonText="Nộp bài"
        cancelButtonText="Tiếp tục làm"
        confirmButtonColorClass="bg-[#0d7cf2] hover:bg-[#0b68c3]"
      />
      <ToastContainer />
    </div>
  );
};

export default DoExamPage; 