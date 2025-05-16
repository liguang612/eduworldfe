import React, { useState } from 'react';

interface QuestionData {
  questionText: string;
  level: string;
  category: string[];
  questionType: string;
}

const QuestionPreview: React.FC<{ data: QuestionData }> = ({ data }) => {
  // Mapping for level to Tailwind CSS color classes
  const levelColorClasses: { [key: string]: string } = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-blue-100 text-blue-700',
    Hard: 'bg-orange-100 text-orange-700',
    VeryHard: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg h-full">
      <h2 className="text-xl font-bold mb-4 text-[#0e141b]">Question Preview</h2>
      {data.questionText ? (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 mb-2">
            <strong>Question:</strong>
          </p>
          <div className="p-3 border rounded-md bg-gray-50 min-h-[100px]">
            {data.questionText.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 italic">Type your question to see a preview.</p>
      )}
      {data.level && (
        <p className="mt-4 text-gray-700">
          <strong>Level:</strong> <span className={`font-normal px-2 py-1 rounded-full text-xs ${levelColorClasses[data.level]}`}>{data.level}</span>
        </p>
      )}
      {data.questionType && (
        <p className="mt-3 text-gray-700">
          <strong>Type:</strong> <span className="font-normal bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">{data.questionType}</span>
        </p>
      )}
      {data.category.length > 0 && (
        <div className="mt-3">
          <p className="text-gray-700 mb-1"><strong>Categories:</strong></p>
          <div className="flex flex-wrap gap-2">
            {data.category.map((cat, index) => (
              <span key={index} className="font-normal bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Thêm các phần hiển thị khác cho media, options (nếu là multiple choice), etc. */}
      <div className="mt-6 p-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">This is a basic preview. More details will appear as you fill out the form.</p>
      </div>
    </div>
  );
};


const QuestionCreatePage: React.FC = () => {
  const [questionText, setQuestionText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Medium');
  const [selectedQuestionType, setSelectedQuestionType] = useState('Multiple Choice');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const availableCategories = ["Algebra", "Geometry", "Trigonometry", "Calculus", "Statistics", "Probability", "Pre-Algebra"];


  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const previewData: QuestionData = {
    questionText: questionText,
    level: selectedLevel,
    category: selectedCategories,
    questionType: selectedQuestionType,
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-100 group/design-root overflow-x-hidden" // Thay đổi bg một chút để dễ phân biệt
      style={{
        fontFamily: 'Inter, "Noto Sans", sans-serif',
      }}
    >
      <div className="flex flex-1 pt-5 pb-5 pr-5">
        {/* Left Pane: Form */}
        <div className="flex-1 max-w-[60%] pl-5 pr-2.5 overflow-y-auto">
          <div className="p-6 shadow-md rounded-lg bg-white">
            <div className="layout-content-container flex flex-col flex-1">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <div className="flex min-w-72 flex-col gap-3">
                  <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight">Create Question</p>
                  <p className="text-[#4e7397] text-sm font-normal leading-normal">
                    You&apos;re creating a question for your exam. You can add text and media, set the level and category, and select the question type.
                  </p>
                </div>
              </div>
              <div className="flex max-w-[90%] flex-wrap items-end gap-4 px-4 py-3"> {/* Tăng max-width của textarea container */}
                <label className="flex flex-col min-w-40 flex-1">
                  <textarea
                    placeholder="Type your question here"
                    className="form-input flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-2 focus:ring-blue-500 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] min-h-36 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                  ></textarea>
                </label>
              </div>
              <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Optional Media</h3>
              <div className="flex px-4 py-3 max-w-[90%]">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#e7edf3] text-[#0e141b] gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-300">
                  <div className="text-[#0e141b]" data-icon="Image" data-size="20px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,172l52-52,80,80H40Zm176,28H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z"></path>
                    </svg>
                  </div>
                  <span className="truncate">Attach image</span>
                </button>
              </div>
              <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Level</h3>
              <div className="flex px-4 py-3">
                <div className="flex h-10 flex-1 items-center justify-center rounded-xl bg-[#e7edf3] p-1 max-w-[90%]">
                  {[
                    { label: 'Nhận biết', value: 'Easy' },
                    { label: 'Thông hiểu', value: 'Medium' },
                    { label: 'Vận dụng', value: 'Hard' },
                    { label: 'Vận dụng cao', value: 'VeryHard' }
                  ].map(level => (
                    <label key={level.value} className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-medium leading-normal
                                          ${selectedLevel === level.value ? 'bg-slate-50 shadow-[0_0_4px_rgba(0,0,0,0.1)] text-[#0e141b]' : 'text-[#4e7397] hover:bg-slate-200'}`}>
                      <span className="truncate">{level.label}</span>
                      <input
                        type="radio"
                        name="level-radio-group" // Đổi name để tránh xung đột với các group khác nếu có
                        className="invisible w-0"
                        value={level.value}
                        checked={selectedLevel === level.value}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Category</h3>
              <div className="flex gap-2 p-3 flex-wrap pr-4 max-w-[90%]">
                {availableCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl px-3 py-1 text-sm font-medium leading-normal
                                ${selectedCategories.includes(category) ? 'bg-blue-500 text-white' : 'bg-[#e7edf3] text-[#0e141b] hover:bg-slate-300'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Question Type</h3>



              <div className="flex flex-col gap-3 p-4 max-w-[90%]">
                {[
                  { value: "Multiple Choice", title: "Multiple Choice", description: "Choose one correct answer from a list of options" },
                  { value: "Matching", title: "Matching", description: "Match items from two columns" },
                  { value: "Sorting", title: "Sorting", description: "Order items in a sequence" },
                  { value: "Drag and Drop", title: "Drag and Drop", description: "Place items in a target area" },
                  { value: "Fill in the Blank", title: "Fill in the Blank", description: "Enter the correct answer" },
                  { value: "Free Response", title: "Free Response", description: "Write a short response" },
                ].map(qType => (
                  <label key={qType.value} className={`flex items-center gap-4 rounded-xl border border-solid p-[15px] cursor-pointer hover:border-blue-400 ${selectedQuestionType === qType.value ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-[#d0dbe7]'}`}>
                    <input
                      type="radio"
                      className="h-5 w-5 border-2 border-[#d0dbe7] bg-transparent text-transparent checked:border-[#1980e6] checked:bg-[image:var(--radio-dot-svg)] focus:outline-none focus:ring-0 focus:ring-offset-0 checked:focus:border-[#1980e6]"
                      name="question-type-radio-group" // Đổi name
                      value={qType.value}
                      checked={selectedQuestionType === qType.value}
                      onChange={(e) => setSelectedQuestionType(e.target.value)}
                    />
                    <div className="flex grow flex-col">
                      <p className="text-[#0e141b] text-sm font-medium leading-normal">{qType.title}</p>
                      <p className="text-[#4e7397] text-sm font-normal leading-normal">{qType.description}</p>
                    </div>
                  </label>
                ))}
              </div>



            </div>
          </div>
        </div>

        {/* Right Pane: Preview */}
        <div className="flex-1 pl-2.5 pr-5 gap-8 flex-col overflow-y-auto">
          <div className="sticky gap-6 flex flex-col">
            <QuestionPreview data={previewData} />
            <div className="flex w-full max-w-[calc(100%-20px)] px-5 justify-between">
              <button
                className="flex min-w-[84px] max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-300"
              >
                <span className="truncate">Cancel</span>
              </button>
              <button
                className="flex min-w-[84px] max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700"
              >
                <span className="truncate">Save Question</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="flex justify-center py-3 bg-white border-t border-solid border-b-[#e7edf3]">

      </footer>
    </div>
  );
};

export default QuestionCreatePage;