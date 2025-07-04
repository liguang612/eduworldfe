import React, { useState, useEffect, useRef } from 'react';
import { getQuestions, getQuestionDetail, type Question } from '@/api/questionApi';
import { type Subject, getSubjectsByGrade } from '@/api/courseApi';
import { useNavigate } from 'react-router-dom';
import QuestionDetailPreview from '@/components/Question/QuestionDetailPreview';
import { searchQuestions } from '@/api/lectureApi';
import { toast } from 'react-toastify';
import { QuestionUploadDialog } from '@/components/Question/QuestionUploadDialog';

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const levelColorClasses: { [key: string]: string } = {
  'Nhận biết': 'bg-green-100 text-green-800',
  'Thông hiểu': 'bg-blue-100 text-blue-800',
  'Vận dụng': 'bg-orange-100 text-orange-800',
  'Vận dụng cao': 'bg-red-100 text-red-800',
};

const QuestionBankPage: React.FC = () => {
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    const savedGrade = localStorage.getItem('selectedGrade');
    return savedGrade || grades[0];
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    const savedSubjectId = localStorage.getItem('selectedSubjectId');
    return savedSubjectId || '';
  });
  const [searchKeyword, _] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

        if (selectedSubjectId) {
          const subjectExists = sortData.some(subject => subject.id === selectedSubjectId);
          if (!subjectExists) {
            const newSubjectId = sortData[0]?.id || '';
            setSelectedSubjectId(newSubjectId);
            localStorage.setItem('selectedSubjectId', newSubjectId);
          }
        } else if (sortData.length > 0) {
          const newSubjectId = sortData[0].id;
          setSelectedSubjectId(newSubjectId);
          localStorage.setItem('selectedSubjectId', newSubjectId);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
  }, [selectedGrade]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedSubjectId || !userId) return;

      setLoading(true);
      try {
        const data = await getQuestions(userId, selectedSubjectId);

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
    const newGrade = event.target.value;
    setSelectedGrade(newGrade);
    localStorage.setItem('selectedGrade', newGrade);
  };

  const handleSubjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubjectId = event.target.value;
    setSelectedSubjectId(newSubjectId);
    localStorage.setItem('selectedSubjectId', newSubjectId);
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
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'createdAt' ? 'desc' : 'asc');
    }
  };

  const getLevelText = (level: number) => {
    switch (level) {
      case 1:
        return 'Nhận biết';
      case 2:
        return 'Thông hiểu';
      case 3:
        return 'Vận dụng';
      case 4:
        return 'Vận dụng cao';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hôm nay';
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'tuần' : 'tuần'} trước`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    if (sortColumn === 'title') {
      return a.title.localeCompare(b.title) * direction;
    } else if (sortColumn === 'level') {
      return (a.level - b.level) * direction;
    } else if (sortColumn === 'createdAt') {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
    }
    return 0;
  });

  const handleQuestionDeleted = () => {
    setSelectedQuestion(null);
    if (selectedSubjectId && userId) {
      getQuestions(userId, selectedSubjectId).then(data => {
        setQuestions(data);
      }).catch(error => {
        console.error('Error refreshing questions:', error);
      });
    }
  };

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsSearching(true);
      try {
        if (!userId || !selectedSubjectId) return;

        const data = await searchQuestions(searchInput, selectedSubjectId, userId);
        setQuestions(data);
      } catch (error) {
        console.error('Error searching questions:', error);
        toast.error('Có lỗi xảy ra khi tìm kiếm câu hỏi');
      } finally {
        setIsSearching(false);
      }
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
            <div className="relative inline-flex rounded-xl shadow-sm" ref={dropdownRef}>
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-l-xl h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal hover:bg-blue-700"
                onClick={handleCreateQuestion}
              >
                <span className="truncate">Câu hỏi mới</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  className="flex items-center justify-center h-10 w-10 bg-[#1980e6] text-slate-50 rounded-r-xl border-l border-blue-500 hover:bg-blue-700"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1" role="none">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCreateQuestion();
                          setIsDropdownOpen(false);
                        }}
                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Tạo thủ công
                      </a>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsUploadDialogOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Upload file
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
      <QuestionUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        title="Upload câu hỏi từ file"
        selectedSubjectId={selectedSubjectId}
      />
    </div>
  );
};

export default QuestionBankPage;