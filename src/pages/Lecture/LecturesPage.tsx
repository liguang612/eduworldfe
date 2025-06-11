import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubjectsByGrade } from '@/api/courseApi';
import type { Subject } from '@/api/courseApi';
import { getLectures, type LectureResponse } from '@/api/lectureApi';
import { ToastContainer } from 'react-toastify';
import LectureItem from '@/components/Lecture/LectureItem';

const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const LectureListPage: React.FC = () => {
  const role = JSON.parse(localStorage.getItem('user') || '{}').role;
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [lectures, setLectures] = useState<LectureResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getSubjectsByGrade(selectedGrade);
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
    const fetchLectures = async () => {
      if (!selectedSubjectId) return;

      setLoading(true);
      try {
        const data = await getLectures(selectedSubjectId, searchKeyword);
        setLectures(data);
      } catch (error) {
        console.error('Error fetching lectures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, [selectedSubjectId, searchKeyword]);

  const handleGradeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const gradeNumber = parseInt(event.target.value);
    setSelectedGrade(gradeNumber);
  };

  const handleSubjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubjectId(event.target.value);
  };

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setSearchKeyword(event.currentTarget.value);
    }
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Danh sách bài giảng</p>
              {role == 1 && <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal"
                onClick={() => navigate('/lectures/create')}
              >
                <span className="truncate">Tạo bài giảng</span>
              </button>}
            </div>

            <div className="px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                  <div
                    className="text-[#4e7397] flex border-none bg-[#e7edf3] items-center justify-center pl-4 rounded-l-xl border-r-0"
                    data-icon="MagnifyingGlass"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                    </svg>
                  </div>
                  <input
                    placeholder="Tìm kiếm bài giảng"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-full placeholder:text-[#4e7397] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    defaultValue=""
                    onKeyDown={handleSearch}
                  />
                </div>
              </label>
            </div>

            <div className="flex gap-6 p-4 flex-wrap pr-4">
              <div className="flex items-center">
                <label htmlFor="grade-select" className="sr-only">Chọn khối lớp</label>
                <select
                  id="grade-select"
                  name="grade"
                  defaultValue="Lớp 1"
                  onChange={handleGradeChange}
                  className=" appearance-none cursor-pointer bg-transparent border-none  text-[#0e141b] text-sm font-medium  focus:outline-none focus:ring-0  p-0 pr-5 sm:pr-6 bg-[image:var(--select-button-svg-black)] bg-no-repeat bg-right center leading-tight"
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
                  {subjects
                    .map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1980e6]"></div>
              </div>
            ) : (
              lectures.map((lecture) => (
                <LectureItem
                  key={lecture.id}
                  id={lecture.id}
                  title={lecture.name}
                  duration={lecture.duration}
                  rating={lecture.averageRating}
                  questionCount={lecture.endQuestions.length}
                  onClick={() => navigate(`/lectures/${lecture.id}`)}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LectureListPage;