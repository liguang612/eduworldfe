import React, { useState, useEffect, useRef } from 'react';
import StarRatingDisplay from '../components/Course/StarRatingDisplay';
import { getSubjectsByGrade, getCoursesBySubject } from '../api/courseApi';
import type { Course, Subject } from '../api/courseApi';
import { useNavigate } from 'react-router-dom';

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const API_URL = 'http://localhost:8080';
  const grades = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'];
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getSubjectsByGrade(selectedGrade);
        setSubjects(data);
        if (data.length > 0) {
          setSelectedSubjectId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
  }, [selectedGrade]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedSubjectId) return;

      setLoading(true);
      try {
        const data = await getCoursesBySubject(selectedSubjectId, enrolledCourses, searchKeyword);
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedSubjectId, enrolledCourses, searchKeyword]);

  const handleGradeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const gradeNumber = parseInt(event.target.value.replace('Lớp ', ''));
    setSelectedGrade(gradeNumber);
  };

  const handleSubjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubjectId(event.target.value);
    setSearchKeyword('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setSearchKeyword(event.currentTarget.value);
    }
  };

  return (
    <>
      <div
        className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden flex h-full grow flex-col"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div className="px-40 flex flex-1 justify-center py-5 bg-[#ffffff]">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Danh sách lớp học</p>
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal"
                onClick={() => navigate('/courses/new')}
              >
                <span className="truncate">Tạo lớp học</span>
              </button>
            </div>
            {JSON.parse(localStorage.getItem('user') || '{}').role === 0 && <div className="flex border-b border-[#d0dbe7] px-4 justify-between">
              <button
                onClick={() => setEnrolledCourses(false)}
                className={`flex flex-col items-center justify-center pb-[13px] pt-4 flex-1 border-b-[3px] ${!enrolledCourses ? 'border-b-[#1980e6] text-[#0e141b]' : 'border-b-transparent text-[#4e7397]'
                  }`}
              >
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                  Tất cả
                </p>
              </button>
              <button
                onClick={() => setEnrolledCourses(true)}
                className={`flex flex-col items-center justify-center pb-[13px] pt-4 flex-1 border-b-[3px] ${enrolledCourses ? 'border-b-[#1980e6] text-[#0e141b]' : 'border-b-transparent text-[#4e7397]'
                  }`}
              >
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                  Đã tham gia
                </p>
              </button>
            </div>}
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
                    ref={searchInputRef}
                    placeholder="Tìm kiếm lớp học"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-full placeholder:text-[#4e7397] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    onKeyDown={handleSearch}
                    defaultValue=""
                  />
                </div>
              </label>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-6 sm:gap-x-8 px-4 py-3">
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
                      {grade}
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
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4">
                {courses.map((course) => (
                  <div key={course.id} className="flex flex-col gap-3 pb-3 max-w-[300px]">
                    <div
                      className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                      style={{ backgroundImage: `url("${API_URL}${course.avatar}")` }}
                    ></div>
                    <div>
                      <p className="text-[#0e141b] text-base font-medium leading-normal">{course.name}</p>
                      <div className="text-[#4e7397] text-sm font-normal leading-normal mt-1">
                        <p>Teacher: {course.teacher.name}</p>
                        <p>Students: {course.students.length}</p>
                        <div className="flex items-center mt-0.5">
                          <StarRatingDisplay rating={course.averageRating} />
                          <span className="ml-1.5">({course.averageRating.toFixed(1)})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursesPage;