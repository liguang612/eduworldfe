import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LectureItem from '@/components/Lecture/LectureItem';
import { getSubjectsByGrade } from '@/api/courseApi';
import { searchCourses, searchLectures, searchExams } from '@/api/searchApi';
import type { SearchExam, SortBy, SortOrder } from '@/api/searchApi';
import type { Subject, Course } from '@/api/courseApi';
import type { LectureResponse } from '@/api/lectureApi';
import CourseResultItem from '@/components/Homepage/CourseResultItem';
import ExamResultItem from '@/components/Homepage/ExamResultItem';
import Sidebar from '@/components/Homepage/Sidebar';

// --- TYPES & DATA ---

export type StudyMode = 'Course' | 'Lecture' | 'Exam';
export type SortOption = 'name-asc' | 'name-desc' | 'rating-desc' | 'rating-asc' | 'time-asc' | 'time-desc' | 'none';

const grades = ['Tất cả', 'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'];

// --- HELPER & CHILD COMPONENTS ---

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ initialQuery }) => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<StudyMode>('Course');
  const [selectedGrade, setSelectedGrade] = useState(grades[0]);
  const [selectedSubject, setSelectedSubject] = useState('Tất cả môn học');
  const [keyword, setKeyword] = useState(initialQuery);
  const [prevKeyword, setPrevKeyword] = useState(initialQuery);
  const [sortOption, setSortOption] = useState<SortOption>('rating-desc');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lectures, setLectures] = useState<LectureResponse[]>([]);
  const [exams, setExams] = useState<SearchExam[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedGrade === grades[0]) {
      setSubjects([]);
      setSelectedSubject('Tất cả môn học');
      return;
    }
    const fetchSubjects = async () => {
      try {
        const gradeNumber = parseInt(selectedGrade.replace('Lớp ', ''));
        const data = await getSubjectsByGrade(gradeNumber);
        const sortedData = data.slice().sort((a, b) => a.name.localeCompare(b.name));
        setSubjects(sortedData);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, [selectedGrade]);

  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      const selectedSubjectObj = subjects.find(s => s.name === selectedSubject);
      const gradeNumber = selectedGrade === grades[0] ? undefined : parseInt(selectedGrade.replace('Lớp ', ''));

      let sortBy: SortBy | undefined;
      let sortOrder: SortOrder | undefined;

      if (sortOption !== 'none') {
        [sortBy, sortOrder] = sortOption.split('-') as [SortBy, SortOrder];
      }

      const params = {
        subjectId: selectedSubjectObj?.id,
        grade: gradeNumber,
        sortBy: sortBy,
        sortOrder: sortOrder,
        keyword: keyword || undefined,
      };

      if (activeMode === 'Course') {
        const data = await searchCourses(params);
        setCourses(data);
        setLectures([]); setExams([]);
      } else if (activeMode === 'Lecture') {
        const data = await searchLectures(params);
        setLectures(data);
        setCourses([]); setExams([]);
      } else if (activeMode === 'Exam') {
        const data = await searchExams(params);
        setExams(data);
        setCourses([]); setLectures([]);
      }
    } catch (error) {
      console.error('Error searching content:', error);
      setCourses([]); setLectures([]); setExams([]);
    } finally {
      setLoading(false);
    }
  }, [activeMode, selectedGrade, selectedSubject, sortOption, subjects, keyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword) {
      setPrevKeyword(keyword);
      performSearch();
    }
  };

  // Perform search on initial load and when filters change
  useEffect(() => {
    if (keyword) {
      performSearch();
    }
  }, [activeMode, selectedGrade, selectedSubject, sortOption, subjects]);

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(e.target.value);
    setSelectedSubject('Tất cả môn học');
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
  };

  const sortedAndFilteredResults = useMemo(() => {
    if (sortOption === 'none') {
      switch (activeMode) {
        case 'Course': return courses;
        case 'Lecture': return lectures;
        case 'Exam': return exams;
        default: return [];
      }
    }

    switch (activeMode) {
      case 'Course':
        return courses.sort((a, b) => {
          switch (sortOption) {
            case 'name-asc':
              return a.name.localeCompare(b.name);
            case 'name-desc':
              return b.name.localeCompare(a.name);
            case 'rating-desc':
              return b.averageRating - a.averageRating;
            case 'rating-asc':
              return a.averageRating - b.averageRating;
            default:
              return 0;
          }
        });
      case 'Lecture':
        return lectures.sort((a, b) => {
          switch (sortOption) {
            case 'name-asc':
              return a.name.localeCompare(b.name);
            case 'name-desc':
              return b.name.localeCompare(a.name);
            case 'rating-desc':
              return b.averageRating - a.averageRating;
            case 'rating-asc':
              return a.averageRating - b.averageRating;
            default:
              return 0;
          }
        });
      case 'Exam':
        return exams.sort((a, b) => {
          switch (sortOption) {
            case 'name-asc':
              return a.title.localeCompare(b.title);
            case 'name-desc':
              return b.title.localeCompare(a.title);
            case 'time-asc':
              return new Date(a.openTime).getTime() - new Date(b.openTime).getTime();
            case 'time-desc':
              return new Date(b.openTime).getTime() - new Date(a.openTime).getTime();
            default:
              return 0;
          }
        });
      default:
        return [];
    }
  }, [activeMode, courses, lectures, exams, sortOption]);

  // Get the count for display
  const getResultsCount = () => {
    switch (activeMode) {
      case 'Course':
        return courses.length;
      case 'Lecture':
        return lectures.length;
      case 'Exam':
        return exams.length;
      default:
        return 0;
    }
  };

  // Render results based on activeMode
  const renderResults = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    const resultsCount = getResultsCount();

    if (resultsCount === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-slate-500">
            Không tìm thấy kết quả nào. Vui lòng thử lại với từ khóa hoặc bộ lọc khác.
          </p>
        </div>
      );
    }

    switch (activeMode) {
      case 'Course':
        return (
          <div className="space-y-3">
            {sortedAndFilteredResults.map(item => (
              <CourseResultItem key={(item as Course).id} item={item as Course} onClick={() => navigate(`/courses/${(item as Course).id}`)} />
            ))}
          </div>
        );
      case 'Lecture':
        return (
          <div className="space-y-3">
            {sortedAndFilteredResults.map(item => (
              <LectureItem
                key={(item as LectureResponse).id}
                id={(item as LectureResponse).id}
                title={(item as LectureResponse).name}
                duration={(item as LectureResponse).duration}
                rating={(item as LectureResponse).averageRating}
                questionCount={(item as LectureResponse).endQuestions.length}
                subjectName={(item as LectureResponse).subjectName}
                grade={(item as LectureResponse).grade}
                onClick={() => navigate(`/lectures/${(item as LectureResponse).id}`)}
              />
            ))}
          </div>
        );
      case 'Exam':
        return (
          <div className="space-y-3">
            {sortedAndFilteredResults.map(item => {
              const exam = item as SearchExam;
              return (
                <ExamResultItem
                  key={exam.id}
                  item={exam}
                  onClick={() => navigate(`/courses/${exam.classId}/exams/${exam.id}/instructions`, {
                    state: {
                      examId: exam.id,
                      courseId: exam.classId,
                      duration: exam.durationMinutes,
                      numQuestions: exam.totalQuestions,
                      courseName: exam.className,
                      subjectName: exam.subjectName,
                      subjectGrade: exam.grade,
                      examTitle: exam.title,
                      subjectId: exam.subjectId
                    }
                  })}
                />
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  // Reset sort option when mode changes
  const handleModeChange = (mode: StudyMode) => {
    setActiveMode(mode);
    setSortOption(mode === 'Exam' ? 'time-asc' : 'rating-desc');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeMode={activeMode}
          onModeChange={handleModeChange}
          selectedGrade={selectedGrade}
          onGradeChange={handleGradeChange}
          selectedSubject={selectedSubject}
          onSubjectChange={handleSubjectChange}
          sortOption={sortOption}
          onSortChange={(e) => setSortOption(e.target.value as SortOption)}
          subjects={subjects}
          grades={grades}
        />
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" />Quay lại trang chủ
            </button>

            <form className="relative flex items-center gap-2 mb-4">
              <Search className="absolute w-5 h-5 text-slate-400 top-1/2 left-4 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học, bài giảng, đề thi"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onSubmit={handleSearch}
                className="w-full pl-12 pr-4 py-3 text-base bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex-shrink-0 cursor-pointer"
                onClick={handleSearch}
              >
                Search
              </button>
            </form>

            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                {loading ? 'Đang tìm kiếm...' : `${getResultsCount()} kết quả cho "${prevKeyword}"`}
              </h2>

              {renderResults()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

interface SearchResultsPageProps {
  initialQuery: string;
}

export default SearchResultsPage;