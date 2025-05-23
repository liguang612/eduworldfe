// QuestionBankPage.tsx

import React, { useState, useEffect } from 'react';
import { getQuestions, getQuestionDetail, type Question } from '../api/questionApi';
import { type Subject, getSubjectsByGrade } from '../api/courseApi';
import { useNavigate } from 'react-router-dom';
import QuestionDetailPreview from '../components/Question/QuestionDetailPreview';

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const levelColorClasses: { [key: string]: string } = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-blue-100 text-blue-800',
  Hard: 'bg-orange-100 text-orange-800',
  VeryHard: 'bg-red-100 text-red-800',
};

const QuestionBankPage: React.FC = () => {
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [selectedGrade, setSelectedGrade] = useState<string>(grades[0]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchInput, setSearchInput] = useState<string>('');

  const [sortColumn, setSortColumn] = useState<'title' | 'level' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
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

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedSubjectId || !userId) return;

      setLoading(true);
      try {
        const data = await getQuestions(userId, selectedSubjectId);
        // Lọc câu hỏi dựa trên từ khóa tìm kiếm
        const filteredData = searchKeyword
          ? data.filter(q => q.title.toLowerCase().includes(searchKeyword.toLowerCase()))
          : data;
        setQuestions(filteredData);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedSubjectId, userId, searchKeyword]);

  const handleGradeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(event.target.value);
  };

  const handleSubjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubjectId(event.target.value);
  };

  const handleViewQuestion = async (question: Question) => {
    setLoadingDetail(true);
    try {
      const detail = await getQuestionDetail(question.id);
      setSelectedQuestion(detail);
    } catch (error) {
      console.error('Error fetching question detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreateQuestion = () => {
    if (!selectedSubjectId) {
      alert('Please select a subject first');
      return;
    }
    navigate('/question-bank/new', { state: { subjectId: selectedSubjectId } });
  };

  const handleSort = (column: 'title' | 'level' | 'createdAt') => {
    if (sortColumn === column) {
      // Reverse
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'createdAt' ? 'desc' : 'asc');
    }
  };

  const getLevelText = (level: number) => {
    switch (level) {
      case 1:
        return 'Easy';
      case 2:
        return 'Medium';
      case 3:
        return 'Hard';
      case 4:
        return 'VeryHard';
      default:
        return 'Unknown';
    }
  };

  // Hàm format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Sắp xếp danh sách câu hỏi trước khi hiển thị
  const sortedQuestions = [...questions].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    if (sortColumn === 'title') {
      return a.title.localeCompare(b.title) * direction;
    } else if (sortColumn === 'level') {
      return (a.level - b.level) * direction;
    } else if (sortColumn === 'createdAt') {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
    }
    return 0; // Không sắp xếp nếu cột không hợp lệ
  });

  const handleQuestionDeleted = () => {
    setSelectedQuestion(null);
    // Refresh the questions list
    if (selectedSubjectId && userId) {
      getQuestions(userId, selectedSubjectId).then(data => {
        setQuestions(data);
      }).catch(error => {
        console.error('Error refreshing questions:', error);
      });
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsSearching(true);
      setSearchKeyword(searchInput);
      // Thêm timeout để hiển thị loading indicator
      setTimeout(() => {
        setIsSearching(false);
      }, 500);
    }
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
        <div className="layout-content-container flex flex-col w-2/5 border-r border-solid border-r-[#e7edf3]">
          <div className="flex flex-wrap justify-between items-center gap-3 p-4 border-b border-solid border-b-[#e7edf3]">
            <p className="text-[#0e141b] tracking-light text-[28px] font-bold leading-tight">Ngân hàng câu hỏi</p>
            <button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal"
              onClick={handleCreateQuestion}
            >
              <span className="truncate">Câu hỏi mới</span>
            </button>
          </div>

          <div className="p-4 border-b border-solid border-b-[#e7edf3]">
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

            <div className="mt-4">
              <div className="relative bg-white">
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi... (Nhấn Enter)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearch}
                  className="w-full px-4 py-2 rounded-lg border border-[#d0dbe7] focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:border-transparent text-sm"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0d7cf2]"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 overflow-y-auto flex-grow">
            {loading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1980e6]"></div>
              </div>
            ) : (
              <div className="flex overflow-hidden rounded-xl border border-[#d0dbe7] bg-white">
                <table className="flex-1 w-full">
                  <thead>
                    <tr className="bg-white">
                      <th
                        className="px-4 py-3 text-left text-[#0e141b] w-[40%] text-sm font-bold leading-normal cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('title')}
                      >
                        Câu hỏi
                        {sortColumn === 'title' && (
                          <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                        )}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-[#0e141b] w-[15%] text-sm font-bold leading-normal cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('level')}
                      >
                        Độ khó
                        {sortColumn === 'level' && (
                          <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                        )}
                      </th>
                      <th
                        className="px-4 py-3 text-left text-[#0e141b] w-[20%] text-sm font-bold leading-normal cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        Ngày tạo
                        {sortColumn === 'createdAt' && (
                          <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                        )}
                      </th>
                      <th className="px-4 py-3 text-left text-[#0e141b] w-[25%] text-sm font-bold leading-normal">
                        Tag
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedQuestions.map((q) => (
                      <tr
                        key={q.id}
                        className="border-t border-t-[#d0dbe7] hover:bg-slate-100 cursor-pointer"
                        onClick={() => handleViewQuestion(q)}
                      >
                        <td className="h-[72px] px-4 py-2 text-[#0e141b] text-sm font-normal leading-normal align-top pt-3">
                          {q.title}
                        </td>
                        <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal align-top pt-3">
                          <button
                            className={`flex min-w-[70px] max-w-[120px] cursor-default items-center justify-center overflow-hidden rounded-md h-7 px-3 text-xs font-medium leading-normal w-full ${levelColorClasses[getLevelText(q.level)] || 'bg-[#d0dbe7] text-[#0e141b]'}`}
                          >
                            <span className="truncate">{getLevelText(q.level)}</span>
                          </button>
                        </td>
                        <td className="h-[72px] px-4 py-2 text-[#4e7397] text-sm font-normal leading-normal align-top pt-3">
                          {formatDate(q.createdAt)}
                        </td>
                        <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal align-top pt-3  ">
                          <span className="block max-w-[150px]">{q.categories.join(' ') || 'No categories'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="layout-content-container flex flex-col w-3/5 flex-1 overflow-y-auto">
          {loadingDetail ? (
            <div className="p-6 flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1980e6]"></div>
            </div>
          ) : selectedQuestion ? (
            <div className="p-6">
              <QuestionDetailPreview
                question={selectedQuestion}
                onQuestionDeleted={handleQuestionDeleted}
              />
            </div>
          ) : (
            <div className="p-6 pt-20 flex justify-center h-full">
              <p className="text-[#4e7397] text-lg">Chọn câu hỏi để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionBankPage;