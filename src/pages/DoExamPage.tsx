import React, { useState, useEffect, useMemo } from 'react';

// Định nghĩa kiểu dữ liệu cho các câu hỏi và thông tin bài thi
interface AnswerOption {
  text: string;
}

interface Question {
  id: string;
  title: string;
  text: string;
  options: AnswerOption[];
  points: number;
  selectedOptionIndex: number | null;
  isFlagged: boolean;
}

const examDetails = {
  examTitle: "Bài kiểm tra giữa kỳ",
  subjectName: "Lịch sử 101",
  className: "Lớp 10A",
  totalTimeInSeconds: 60 * 45, // 45 phút
};

const initialQuestionsData: Question[] = [
  {
    id: 'q1',
    title: 'Câu hỏi 1',
    text: 'Sự kiện nào sau đây đánh dấu sự bắt đầu của Chiến tranh thế giới thứ nhất?',
    options: [
      { text: 'Vụ ám sát Thái tử Franz Ferdinand' },
      { text: 'Trận chiến Stalingrad' },
      { text: 'Cuộc tấn công Trân Châu Cảng' },
      { text: 'Sự sụp đổ của Bức tường Berlin' },
    ],
    points: 10,
    selectedOptionIndex: null,
    isFlagged: false,
  },
  {
    id: 'q2',
    title: 'Câu hỏi 2',
    text: 'Thủ đô của Pháp là gì?',
    options: [{ text: 'London' }, { text: 'Paris' }, { text: 'Berlin' }, { text: 'Madrid' }],
    points: 5,
    selectedOptionIndex: null, // Trong HTML gốc, 'London' được chọn. Đặt là null để bắt đầu mới.
    isFlagged: false,
  },
  {
    id: 'q3',
    title: 'Câu hỏi 3',
    text: 'Ai là tổng thống đầu tiên của Hoa Kỳ?',
    options: [
      { text: 'Thomas Jefferson' },
      { text: 'Abraham Lincoln' },
      { text: 'George Washington' },
      { text: 'John Adams' },
    ],
    points: 10,
    selectedOptionIndex: null,
    isFlagged: false,
  },
  {
    id: 'q4',
    title: 'Câu hỏi 4',
    text: 'Sông nào dài nhất thế giới?',
    options: [{ text: 'Sông Nile' }, { text: 'Sông Amazon' }, { text: 'Sông Dương Tử' }, { text: 'Sông Mississippi' }],
    points: 5,
    selectedOptionIndex: null,
    isFlagged: false,
  },
];

// --- SVG Icons ---
const LogoIcon: React.FC = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
      fill="currentColor"
    ></path>
  </svg>
);

const BellIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
  </svg>
);

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

const ClearIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className || "size-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.502 0A48.097 48.097 0 0 1 9.25 5.397M5.11 5.79m0 0a2.25 2.25 0 0 1 2.11-.155M5.11 5.79m0 0a2.25 2.25 0 0 0-2.11.155m2.11-.155A2.25 2.25 0 0 1 5.11 5.79m0 0A2.25 2.25 0 0 1 3 5.11m0 0a2.25 2.25 0 0 1 .11-.49m0 0a2.25 2.25 0 0 1 1.99-1.59M3.648 3.648A2.25 2.25 0 0 1 5.11 3m13.78 0a2.25 2.25 0 0 1 1.462.648m-14.456 0a2.25 2.25 0 0 0-1.462.648m11.528 11.528a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0A48.108 48.108 0 0 0-3.478-.397m-12.502 0A48.097 48.097 0 0 1 9.25 5.397M5.11 5.79m0 0a2.25 2.25 0 0 1 2.11-.155M5.11 5.79m0 0a2.25 2.25 0 0 0-2.11.155m2.11-.155A2.25 2.25 0 0 1 5.11 5.79m0 0A2.25 2.25 0 0 1 3 5.11m0 0a2.25 2.25 0 0 1 .11-.49m0 0a2.25 2.25 0 0 1 1.99-1.59m3.648 3.648A2.25 2.25 0 0 1 5.11 3m13.78 0a2.25 2.25 0 0 1 1.462.648m-14.456 0a2.25 2.25 0 0 0-1.462.648" />
  </svg>
);


// --- Main Exam Screen Component ---
const DoExamPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestionsData);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(examDetails.totalTimeInSeconds);

  const maxScore = useMemo(() => questions.reduce((sum, q) => sum + q.points, 0), [questions]);

  // Timer countdown logic
  useEffect(() => {
    if (timeLeft <= 0) {
      // Handle time up (e.g., auto-submit)
      alert("Hết giờ làm bài!");
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const currentQuestion = questions[currentQuestionIndex];

  // CSS variables for custom radio/checkbox styling (from original HTML)
  const rootStyle = {
    "--checkbox-tick-svg": "url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(248,250,252)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')",
    "--radio-dot-svg": "url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(13,124,242)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3ccircle cx=%278%27 cy=%278%27 r=%273%27/%3e%3c/svg%3e')",
    fontFamily: 'Lexend, "Noto Sans", sans-serif',
  };

  if (!currentQuestion) {
    return <div>Đang tải câu hỏi...</div>; // Or some other loading/error state
  }

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
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                    style={{ backgroundImage: 'url("https://cdn.usegalileo.ai/replicate/44054395-3f26-4fc6-b930-e2ca89e11e0c.png")' }}
                  ></div>
                  <div className="flex flex-col">
                    <h1 className="text-[#0d141c] text-base font-medium leading-normal">{examDetails.examTitle}</h1>
                    <p className="text-[#49719c] text-sm font-normal leading-normal">{examDetails.subjectName}</p>
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
              <h1 className="text-[#0d141c] text-xl font-bold leading-tight tracking-[-0.015em]">
                {examDetails.examTitle}
              </h1>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[#49719c] text-sm font-normal leading-normal">
                    Môn học: {examDetails.subjectName} | Lớp: {examDetails.className}
                  </p>
                  <p className="text-[#49719c] text-sm font-normal leading-normal">
                    Tổng điểm tối đa: {maxScore}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#49719c] text-sm font-normal leading-normal">Thời gian còn lại:</p>
                  <p className="text-[#0d141c] text-2xl font-bold text-red-600">{formatTime(timeLeft)}</p>
                </div>
              </div>
            </div>

            {/* Current Question */}
            <h1 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-1 pt-5">
              {currentQuestion.title}
              <span className="text-sm font-medium text-slate-500 ml-2">({currentQuestion.points} điểm)</span>
            </h1>
            <p className="text-[#0d141c] text-base font-normal leading-normal pb-3 pt-1 px-4">
              {currentQuestion.text}
            </p>

            {/* Answer Options */}
            <div className="flex flex-col gap-3 p-4">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center gap-4 rounded-xl border border-solid border-[#cedbe8] p-[15px] hover:border-[#0d7cf2] cursor-pointer has-[:checked]:border-[#0d7cf2] has-[:checked]:bg-blue-50"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    className="h-5 w-5 border-2 border-[#cedbe8] bg-transparent text-transparent checked:border-[#0d7cf2] checked:bg-[image:--radio-dot-svg] focus:outline-none focus:ring-0 focus:ring-offset-0 checked:focus:border-[#0d7cf2]"
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
            <div className="px-4 mt-auto pb-4 flex justify-end gap-3">
              <button
                onClick={handleToggleFlag}
                title={currentQuestion.isFlagged ? "Bỏ đánh dấu câu hỏi" : "Đánh dấu câu hỏi này"}
                className={`p-2 rounded-lg hover:bg-slate-200 ${currentQuestion.isFlagged ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'text-slate-600'}`}
              >
                <FlagIcon className="size-5" />
              </button>
              <button
                onClick={handleClearResponse}
                title="Xóa lựa chọn"
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-200"
              >
                <ClearIcon className="size-5" />
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

export default DoExamPage;