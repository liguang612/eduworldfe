import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ClearIcon from '@/assets/clear.svg';
import DotRegularIcon from '@/assets/dot_regular.svg';
import DotFillIcon from '@/assets/dot_fill.svg';
import DotFillFlagIcon from '@/assets/dot_fill_flag.svg';
import DotFillTrueIcon from '@/assets/dot_fill_true.svg';
import DotFillFalseIcon from '@/assets/dot_fill_false.svg';
import FlagIcon from '@/assets/flag.svg';
import FlagFillIcon from '@/assets/flag_fill.svg';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { getSubjectById, type Subject } from '@/api/courseApi';
import { getQuestionsDetails, type Question } from '@/api/questionApi';
import { gradeAnswers } from '@/api/gradingApi';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { BorderlessLight } from 'survey-core/themes';
import 'survey-core/survey-core.css';
import '@/components/Question/survey-custom.css';
import { toast } from 'react-toastify';
import { type ChoiceOption } from '@/api/questionApi';
import FormatCorrectAnswer from '@/components/Question/FormatCorrectAnswer';

const initialQuestionsData: Question[] = [];

const DoEndQuestion: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestionsData);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [surveyModels, setSurveyModels] = useState<{ [key: string]: Model }>({});
  const [gradingResults, setGradingResults] = useState<{ [key: string]: boolean }>({});
  const [correctAnswers, setCorrectAnswers] = useState<{ [key: string]: any }>({});
  const [isGrading, setIsGrading] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { lectureName, subjectId, endQuestionIds } = location.state as { lectureName: string; subjectId: string; endQuestionIds: string[] };

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const [currentSharedMedia, setCurrentSharedMedia] = useState<any>(null);
  const [currentMediaQuestions, setCurrentMediaQuestions] = useState<Question[]>([]);

  const [sortedQuestions, setSortedQuestions] = useState<Question[]>([]);

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
    const question = sortedQuestions[index];
    const originalIndex = questions.findIndex(q => q.id === question.id);
    setCurrentQuestionIndex(originalIndex);
  };

  useEffect(() => {
    if (questions.length > 0) {
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
    }
  }, [currentQuestionIndex, questions, groupQuestionsBySharedMedia]);

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
        if (endQuestionIds && endQuestionIds.length > 0) {
          setLoadingQuestions(true);
          const data = await getQuestionsDetails(endQuestionIds);
          const formattedQuestions: Question[] = data.map((q: any) => ({
            ...q,
            selectedOptionIndex: null,
            isFlagged: false,
          }));
          setQuestions(formattedQuestions);

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

            models[question.id] = model;
          });

          setSurveyModels(models);
        } else {
          setQuestions([]);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [endQuestionIds]);

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

  const handleSurveyValueChange = (questionId: string, model: Model) => {
    const value = model.getValue(`question_${questionId}`);
    const isAnswered = value !== undefined && value !== null &&
      (Array.isArray(value) ? value.length > 0 : value !== "");

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
  };

  const handleSubmit = async () => {
    try {
      setIsGrading(true);
      const answersToGrade: { [key: string]: any } = {};
      const updatedSurveyModels = { ...surveyModels };

      questions.forEach(question => {
        const model = updatedSurveyModels[question.id];
        if (model) {
          const questionName = `question_${question.id}`;
          const value = model.getValue(questionName);

          if (value !== undefined && value !== null && (Array.isArray(value) ? value.length > 0 : value !== "")) {
            answersToGrade[`${question.id}`] = value;
          }
          model.data = { [questionName]: value };
        }
      });

      if (Object.keys(answersToGrade).length !== questions.length) {
        toast.warning('Vui lòng trả lời tất cả câu hỏi trước khi nộp bài');
        return;
      }

      const response = await gradeAnswers({ answers: answersToGrade });
      setGradingResults(response.results);
      setCorrectAnswers(response.correctAnswers);
    } catch (error) {
      console.error('Error grading answers:', error);
    } finally {
      setIsGrading(false);
    }
  };

  if (loadingQuestions) {
    return <div>Đang tải câu hỏi...</div>;
  }

  if (!questions || questions.length === 0) {
    return <div>Không tìm thấy câu hỏi ôn tập nào cho bài giảng này.</div>;
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
          {/* Cột trái  */}
          <div className="layout-content-container flex flex-col w-80">
            <div className="flex h-full min-h-[700px] flex-col justify-between bg-slate-50 p-4">
              <div className="flex flex-col gap-4">
                {/* User Info & Exam Icon */}
                <div className="flex gap-3 items-center">
                  <img
                    src={user?.avatar ? `${user?.avatar}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'U')}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-[#d0dbe7]"
                  />
                  <div className="flex flex-col">
                    <h2 className="text-[#0d141c] text-sm text-[18px] font-medium leading-normal">{user?.name}</h2>
                    <p className="text-[#49719c] text-sm font-normal leading-normal">{user?.email}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex flex-col gap-1 mb-2">
                  <div className="flex justify-between text-xs text-[#49719c]">
                    <span>Tiến độ</span>
                    <span>{answeredQuestionsCount}/{questions.length} câu</span>
                  </div>
                  <div className="rounded bg-[#cedbe8] h-2 w-full">
                    <div className="h-2 rounded bg-[#0d7cf2]" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                </div>

                {/* Question List */}
                <div className="flex flex-col gap-2">
                  {sortedQuestions.map((q, index) => {
                    const originalIndex = questions.findIndex(question => question.id === q.id);
                    let resultIcon = null;
                    let IconSource = DotRegularIcon;

                    if (q.isFlagged) {
                      IconSource = DotFillFlagIcon;
                    } else if (surveyModels[q.id]?.getValue(`question_${q.id}`) !== undefined) {
                      if (gradingResults[q.id] !== undefined) {
                        IconSource = gradingResults[q.id] ? DotFillTrueIcon : DotFillFalseIcon;
                        resultIcon = gradingResults[q.id] ? (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        );
                      } else {
                        IconSource = DotFillIcon;
                      }
                    }

                    return (
                      <div
                        key={q.id}
                        onClick={() => handleSelectQuestion(index)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer ${originalIndex === currentQuestionIndex ? 'bg-[#e7edf4]' : 'hover:bg-slate-100'
                          }`}
                      >
                        <img src={IconSource} className='w-5 h-5' alt='status icon' />
                        <p className="text-[#0d141c] text-sm font-medium leading-normal flex-1">{q.title}</p>
                        {resultIcon}
                      </div>
                    );
                  })}
                </div>
                {Object.keys(gradingResults).length === 0 && <button
                  onClick={handleSubmit}
                  disabled={isGrading}
                  className="w-full mt-4 px-4 py-3 bg-[#0d7cf2] text-white text-base font-semibold rounded-xl shadow-sm hover:bg-[#0b68c3] focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Nộp bài
                </button>}
              </div>
            </div>
          </div>

          {/* Cột phải: Hiển thị câu hỏi */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Thông tin bài giảng */}
            <div className="flex flex-col gap-2 p-4 border-b border-slate-200">
              <h1 className="text-[#0d141c] font-bold leading-tight tracking-[-0.015em] text-xl">
                {lectureName}
              </h1>
              <div className="flex justify-between items-center">
                <p className="text-[#49719c] font-normal leading-normal">
                  Môn học: {subject ? `${subject.name} - Lớp: ${subject.grade}` : 'Đang tải...'}
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
                        onValueChanged={() => handleSurveyValueChange(question.id, surveyModels[question.id])}
                        readOnly={Object.keys(gradingResults).length > 0}
                      />
                    </div>
                  )}
                  {/* ĐÁP ÁN ĐÚNG */}
                  {Object.keys(gradingResults).length > 0 && correctAnswers[question.id] !== undefined && (
                    <div className="p-3 border rounded-md bg-green-50 border-green-300 shadow">
                      <h4 className="text-md font-semibold text-green-800 mb-2">Đáp án đúng:</h4>
                      <FormatCorrectAnswer
                        correctAnswerData={correctAnswers[question.id]}
                        question={question}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons for Question */}
            {Object.keys(gradingResults).length === 0 && (
              <div className="px-4 pb-4 flex justify-end gap-3">
                <button
                  onClick={handleToggleFlag}
                  title={currentQuestion.isFlagged ? "Bỏ đánh dấu câu hỏi" : "Đánh dấu câu hỏi để xem lại"}
                  className={`p-2 rounded-lg hover:bg-slate-200 ${currentQuestion.isFlagged ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'text-slate-600'}`}
                >
                  <img src={currentQuestion.isFlagged ? FlagFillIcon : FlagIcon} className="size-5" alt="flag icon" />
                </button>
                <button
                  onClick={handleClearResponse}
                  title="Xóa lựa chọn"
                  className="p-2 rounded-lg text-slate-600 hover:bg-slate-200"
                >
                  <img src={ClearIcon} className='w-5 h-5' alt="clear response" />
                </button>
              </div>
            )}

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
                onClick={() => handleSelectQuestion(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
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

export default DoEndQuestion;