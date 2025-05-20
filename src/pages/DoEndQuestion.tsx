import React, { useState, useEffect, useMemo } from 'react';
import ClearIcon from '@/assets/clear.svg';
import { useAuth } from '@/contexts/AuthContext';
import { baseURL } from '@/config/axios';
import { useLocation } from 'react-router-dom';
import { getSubjectById, type Subject } from '../api/courseApi';
import { getQuestionsDetails } from '../api/questionApi';

// Define types based on API response
interface ChoiceOption {
  id: string;
  text: string;
  value: string;
  questionId: string;
  orderIndex: number | null;
  isCorrect: boolean; // API might return this, but we might not need it for the test taking screen
}

interface Question {
  id: string;
  title: string;
  text: string;
  choices: ChoiceOption[];
  points: number;
  subjectId: string;
  type: string;
  selectedOptionIndex: number | null; // Local state to track user's selection
  isFlagged: boolean; // Local state for flagging
}

const initialQuestionsData: Question[] = []; // Initialize with empty array as questions will be fetched

const DotRegularIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Z"></path>
  </svg>
);

const DotFillIcon: React.FC<{ color?: string }> = ({ color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill={color} viewBox="0 0 256 256">
    <path d="M128,80a48,48,0,1,0,48,48A48,48,0,0,0,128,80Zm0,60a12,12,0,1,1,12-12A12,12,0,0,1,128,140Z"></path>
  </svg>
);

const FlagIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "size-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
  </svg>
);

// --- Main Exam Screen Component ---
const DoEndQuestion: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestionsData);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const { user } = useAuth();
  const location = useLocation();
  const { lectureName, subjectId, endQuestionIds } = location.state as { lectureName: string; subjectId: string; endQuestionIds: string[] };

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

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
    console.log(endQuestionIds);
    const fetchQuestions = async () => {
      try {
        if (endQuestionIds && endQuestionIds.length > 0) {
          setLoadingQuestions(true);
          const data = await getQuestionsDetails(endQuestionIds);
          const formattedQuestions = data.map((q: any) => ({
            ...q,
            selectedOptionIndex: null,
            isFlagged: false,
          }));
          setQuestions(formattedQuestions);
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

  const handleSelectQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleAnswerChange = (optionIndex: number) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, idx) =>
        idx === currentQuestionIndex ? { ...q, selectedOptionIndex: optionIndex } : q
      )
    );
  };

  const handleToggleFlag = () => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, idx) =>
        idx === currentQuestionIndex ? { ...q, isFlagged: !q.isFlagged } : q
      )
    );
  };

  const handleClearResponse = () => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, idx) =>
        idx === currentQuestionIndex ? { ...q, selectedOptionIndex: null } : q
      )
    );
  };

  const answeredQuestionsCount = useMemo(
    () => questions.filter((q) => q.selectedOptionIndex !== null).length,
    [questions]
  );

  const progressPercentage = useMemo(
    () => (questions.length > 0 ? (answeredQuestionsCount / questions.length) * 100 : 0),
    [answeredQuestionsCount, questions.length]
  );

  if (loadingQuestions) {
    return <div>Đang tải câu hỏi...</div>;
  }

  if (!questions || questions.length === 0) {
    return <div>Không tìm thấy câu hỏi ôn tập nào cho bài giảng này.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  // CSS variables for custom radio/checkbox styling (from original HTML)
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
                {/* User Info & Exam Icon (from original HTML) */}
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
                  {questions.map((q, index) => {
                    let dotColor = "currentColor"; // Default for DotRegularIcon
                    let IconComponent = DotRegularIcon;

                    if (q.isFlagged) {
                      dotColor = "rgb(249, 115, 22)"; // Orange color for flag
                      IconComponent = () => <DotFillIcon color={dotColor} />;
                    } else if (q.selectedOptionIndex !== null) {
                      dotColor = "rgb(13, 124, 242)"; // Blue color for answered
                      IconComponent = () => <DotFillIcon color={dotColor} />;
                    }

                    return (
                      <div
                        key={q.id}
                        onClick={() => handleSelectQuestion(index)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer ${index === currentQuestionIndex ? 'bg-[#e7edf4]' : 'hover:bg-slate-100'
                          }`}
                      >
                        <div className={`text-[${dotColor}]`}> <IconComponent /> </div>
                        <p className="text-[#0d141c] text-sm font-medium leading-normal">{q.title}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Question Display */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Exam Info and Timer */}
            <div className="flex flex-col gap-2 p-4 border-b border-slate-200">
              <h1 className="text-[#0d141c] font-bold leading-tight tracking-[-0.015em]">
                {lectureName}
              </h1>
              <div className="flex justify-between items-center">
                <p className="text-[#49719c] font-normal leading-normal">
                  Môn học: {subject ? `${subject.name} - Lớp: ${subject.grade}` : 'Đang tải...'}
                </p>
              </div>
            </div>

            {/* Current Question */}
            <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-1 pt-8">
              {currentQuestion.title}
            </h2>
            <p className="text-[#0d141c] text-base font-normal leading-normal pb-3 pt-1 px-4">
              {currentQuestion.text}
            </p>

            {/* Answer Options */}
            <div className="flex flex-col gap-3 p-4">
              {currentQuestion.choices.map((option, index) => (
                <label
                  key={option.id}
                  className="flex items-center gap-4 rounded-xl border border-solid border-[#cedbe8] p-[15px] hover:border-[#0d7cf2] cursor-pointer has-[:checked]:border-[#0d7cf2] has-[:checked]:bg-blue-50"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    className="h-5 w-5 border-2 border-[#cedbe8] bg-transparent text-transparent checked:border-[#0d7cf2] checked:bg-[image:var(--radio-dot-svg)] focus:outline-none focus:ring-0 focus:ring-offset-0 checked:focus:border-[#0d7cf2]"
                    checked={currentQuestion.selectedOptionIndex === index}
                    onChange={() => handleAnswerChange(index)}
                  />
                  <div className="flex grow flex-col">
                    <p className="text-[#0d141c] text-sm font-medium leading-normal">{option.text}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Action Buttons for Question */}
            <div className="px-4 pb-4 flex justify-end gap-3">
              <button
                onClick={handleToggleFlag}
                title={currentQuestion.isFlagged ? "Bỏ đánh dấu câu hỏi" : "Đánh dấu câu hỏi để xem lại"}
                className={`p-2 rounded-lg hover:bg-slate-200 ${currentQuestion.isFlagged ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'text-slate-600'}`}
              >
                <FlagIcon className="size-5" />
              </button>
              <button
                onClick={handleClearResponse}
                title="Xóa lựa chọn"
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-200"
              >
                <img src={ClearIcon} className='w-5 h-5' />
              </button>
            </div>

            {/* Navigation buttons (Example) */}
            <div className="flex justify-between p-4 border-t border-slate-200">
              <button
                onClick={() => handleSelectQuestion(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50"
              >
                Trở lại
              </button>
              <button
                onClick={() => handleSelectQuestion(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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