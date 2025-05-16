// QuestionBankPage.tsx

import React, { useState, useEffect } from 'react';
import { getSubjectsByGrade } from '../api/courseApi';
import type { Subject } from '../api/courseApi';
import { useNavigate } from 'react-router-dom';
// Định nghĩa interface cho dữ liệu câu hỏi để đảm bảo type safety
interface Question {
  id: string;
  text: string;
  level: 'Easy' | 'Medium' | 'Hard';
  created: string;
  categories: string;
  imageUrl: string;
}

// Dữ liệu mẫu cho câu hỏi - trong ứng dụng thực tế, dữ liệu này sẽ từ API
const initialQuestions: Question[] = [
  {
    id: '1',
    text: 'What is the most common cause of SBO?',
    level: 'Easy',
    created: '2 days ago',
    categories: 'GI, Surgery, abc abcb ded ede de de de ',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/97eb846b-5bc3-4c15-9fad-957229c80b26.png',
  },
  {
    id: '2',
    text: 'What are the major risk factors for CAD?',
    level: 'Medium',
    created: '3 days ago',
    categories: 'Cardiology',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/a60885b3-bb10-4937-9480-953d09d00177.png',
  },
  {
    id: '3',
    text: 'What is the management of a patient with COPD exacerbation?',
    level: 'Hard',
    created: '1 week ago',
    categories: 'Pulmonology',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/1b68e2c5-48e1-48e6-8ad7-5c12de852340.png',
  },
  {
    id: '4',
    text: 'Describe the pathophysiology of Rheumatoid Arthritis',
    level: 'Medium',
    created: '2 weeks ago',
    categories: 'Rheumatology',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/cf8334dd-292d-4e95-be21-fecb29ba775c.png',
  },
  {
    id: '5',
    text: 'What are the clinical features of Acute Pancreatitis?',
    level: 'Easy',
    created: '4 days ago',
    categories: 'Gastroenterology',
    imageUrl: 'https://cdn.usegalileo.ai/sdxl10/d0122a9f-d6f7-49d1-9f40-d395e7ff04ea.png',
  },
];

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const QuestionBankPage: React.FC = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(questions[0] || null);

  const [selectedGrade, setSelectedGrade] = useState<string>(grades[0]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getSubjectsByGrade(parseInt(selectedGrade));
        const sortData = data
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name));
        setSubjects(sortData);
        if (sortData.length > 0) {
          setSelectedSubjectId(sortData[0].id);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
  }, [selectedGrade]);

  const handleGradeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(event.target.value);
  };

  const handleSubjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubjectId(event.target.value);
  };

  const handleViewQuestion = (question: Question) => {
    setSelectedQuestion(question);
  };

  const handleCreateQuestion = () => {
    if (!selectedSubjectId) {
      alert('Please select a subject first');
      return;
    }
    navigate('/question-bank/new', { state: { subjectId: selectedSubjectId } });
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{
        // @ts-ignore
        '--select-button-svg': `url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724px%27 height=%2724px%27 fill=%27rgb(78,115,151)%27 viewBox=%270 0 256 256%27%3e%3cpath d=%27M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z%27%3e%3c/path%3e%3c/svg%3e')`,
        // @ts-ignore
        '--select-button-svg-black': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%230e141b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        fontFamily: 'Inter, "Noto Sans", sans-serif',
      }}
    >
      <div className="flex h-full grow flex-row">
        {/* Khung bên trái - Tăng chiều rộng lên 40% */}
        <div className="layout-content-container flex flex-col w-2/5 border-r border-solid border-r-[#e7edf3]">
          <div className="flex flex-wrap justify-between items-center gap-3 p-4 border-b border-solid border-b-[#e7edf3]">
            <p className="text-[#0e141b] tracking-light text-[28px] font-bold leading-tight">Question Banks</p>
            <button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal"
              onClick={handleCreateQuestion}
            >
              <span className="truncate">Câu hỏi mới</span>
            </button>
          </div>

          {/* Khu vực tìm kiếm và bộ lọc */}
          <div className="p-4 border-b border-solid border-b-[#e7edf3]">
            <label className="flex flex-col min-w-40 !h-10 max-w-full mb-4">
              <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                <div
                  className="text-[#4e7397] flex border-none bg-[#e7edf3] items-center justify-center pl-4 rounded-l-xl border-r-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path
                      d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                    ></path>
                  </svg>
                </div>
                <input
                  placeholder="Search Questions"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-full placeholder:text-[#4e7397] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                  defaultValue=""
                />
              </div>
            </label>

            {/* Dropdown chọn khối lớp và môn học */}
            <div className="flex gap-x-6 gap-y-3 flex-wrap">
              <div className="flex items-center">
                <label htmlFor="grade-select" className="sr-only">Chọn khối lớp</label>
                <select
                  id="grade-select"
                  name="grade"
                  value={selectedGrade}
                  onChange={handleGradeChange}
                  className="appearance-none cursor-pointer bg-transparent border-none text-[#0e141b] text-sm font-medium focus:outline-none focus:ring-0 p-0 pr-5 sm:pr-6 bg-[image:var(--select-button-svg-black)] bg-no-repeat bg-right center leading-tight"
                >
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {`Lớp ${grade}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label htmlFor="subject-select" className="sr-only">Chọn môn học</label>
                <select
                  id="subject-select"
                  name="subject"
                  value={selectedSubjectId}
                  onChange={handleSubjectChange}
                  className="appearance-none cursor-pointer bg-transparent border-none text-[#0e141b] text-sm font-medium focus:outline-none focus:ring-0 p-0 pr-5 sm:pr-6 bg-[image:var(--select-button-svg-black)] bg-no-repeat bg-right center leading-tight"
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 overflow-y-auto flex-grow">
            <div className="flex overflow-hidden rounded-xl border border-[#d0dbe7] bg-slate-50">
              <table className="flex-1 w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-left text-[#0e141b] w-[40%] text-sm font-bold leading-normal">Question</th>
                    <th className="px-4 py-3 text-left text-[#0e141b] w-[15%] text-sm font-bold leading-normal">Level</th>
                    <th className="px-4 py-3 text-left text-[#0e141b] w-[20%] text-sm font-bold leading-normal">Created</th>
                    <th className="px-4 py-3 text-left text-[#0e141b] w-[25%] text-sm font-bold leading-normal">Categories</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr
                      key={q.id}
                      className="border-t border-t-[#d0dbe7] hover:bg-slate-100 cursor-pointer"
                      onClick={() => handleViewQuestion(q)}
                    >
                      <td className="h-[72px] px-4 py-2 text-[#0e141b] text-sm font-normal leading-normal align-top pt-3">
                        {q.text}
                      </td>
                      <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal align-top pt-3">
                        <button
                          className="flex min-w-[70px] max-w-[120px] cursor-default items-center justify-center overflow-hidden rounded-md h-7 px-3 bg-[#d0dbe7] text-[#0e141b] text-xs font-medium leading-normal w-full"
                        >
                          <span className="truncate">{q.level}</span>
                        </button>
                      </td>
                      <td className="h-[72px] px-4 py-2 text-[#4e7397] text-sm font-normal leading-normal align-top pt-3">
                        {q.created}
                      </td>
                      <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal align-top pt-3">
                        <span className="block max-w-[150px]">{q.categories}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Phân trang đã được bỏ */}
        </div>

        {/* Khung bên phải - Chiều rộng còn lại (60%) */}
        <div className="layout-content-container flex flex-col w-3/5 flex-1 overflow-y-auto">
          {selectedQuestion ? (
            <div className="p-6"> {/* Tăng padding cho khung bên phải */}
              <div className="flex flex-col lg:flex-row items-start justify-between gap-6 rounded-xl bg-white shadow-lg p-6"> {/* Responsive và tăng gap, shadow */}
                <div className="flex flex-col gap-2 flex-[2_2_0px] lg:order-1"> {/* Tăng gap */}
                  <p className="text-[#0e141b] text-xl font-bold leading-tight">{selectedQuestion.text}</p>
                  <p className="text-[#4e7397] text-base font-normal leading-normal"> {/* Tăng font-size */}
                    <strong>Level:</strong> {selectedQuestion.level} <br />
                    <strong>Created:</strong> {selectedQuestion.created} <br />
                    <strong>Categories:</strong> {selectedQuestion.categories}
                  </p>
                  <div className="mt-4">
                    <h3 className="text-[#0e141b] text-lg font-semibold mb-2">Details:</h3> {/* Tăng font-size */}
                    <p className="text-[#4e7397] text-base leading-relaxed"> {/* Tăng font-size, leading */}
                      This section can contain more detailed information about the selected question.
                      For instance, if it's a multiple-choice question, the options could be listed here.
                      The correct answer and an explanation or solution could also be provided.
                      This area is flexible and can be customized to display any relevant content
                      associated with the question.
                    </p>
                  </div>
                </div>
                <div
                  className="w-full lg:max-w-md bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1 lg:order-2" /* max-width trên desktop */
                  style={{ backgroundImage: `url("${selectedQuestion.imageUrl}")` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="p-6 flex justify-center items-center h-full">
              <p className="text-[#4e7397] text-lg">Select a question to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionBankPage;