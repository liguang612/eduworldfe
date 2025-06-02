import React, { useState, useEffect } from 'react';
import { getSubjectsByGrade } from '@/api/courseApi';
import type { Subject } from '@/api/courseApi';
import { getFavouriteCourses, getFavouriteLectures, getFavouriteExams, addFavorite, removeFavorite } from '@/api/favouriteApi';
import type { FavouriteCourseResponse, FavouriteLectureResponse, FavouriteExamResponse } from '@/api/favouriteApi';
import { toast } from 'react-toastify';
import CourseCard from '../../components/Favourite/CourseCard';
import LectureCard from '../../components/Favourite/LectureCard';
import ExamCard from '../../components/Favourite/ExamCard';
import ProfileDialog from '@/components/Auth/UserInformationPopup';
import type { User } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const FavouritesPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'courses' | 'lectures' | 'exams'>('courses');
  const grades = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'];
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [favouriteCourses, setFavouriteCourses] = useState<FavouriteCourseResponse[]>([]);
  const [favouriteLectures, setFavouriteLectures] = useState<FavouriteLectureResponse[]>([]);
  const [favouriteExams, setFavouriteExams] = useState<FavouriteExamResponse[]>([]);

  const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
    const fetchFavourites = async () => {
      if (!selectedSubjectId) return;

      setLoading(true);
      try {
        switch (activeTab) {
          case 'courses':
            const courses = await getFavouriteCourses(selectedSubjectId, searchKeyword);
            setFavouriteCourses(courses);
            break;
          case 'lectures':
            const lectures = await getFavouriteLectures(selectedSubjectId, searchKeyword);
            setFavouriteLectures(lectures);
            break;
          case 'exams':
            const exams = await getFavouriteExams(selectedSubjectId, searchKeyword);
            setFavouriteExams(exams);
            break;
        }
      } catch (error) {
        console.error('Error fetching favourites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [selectedSubjectId, activeTab, searchKeyword]);

  const handleGradeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const gradeNumber = parseInt(event.target.value.replace('Lớp ', ''));
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      setSearchKeyword('');
    }
  };

  const handleToggleFavoriteExam = async (examId: string, isCurrentlyFavorited: boolean) => {
    try {
      if (isCurrentlyFavorited) {
        await removeFavorite(examId, 4);
        toast.success('Đã bỏ yêu thích đề thi');
      } else {
        await addFavorite(examId, 4);
        toast.success('Đã thêm vào danh sách yêu thích đề thi');
      }

      setFavouriteExams(prevExams =>
        prevExams.filter(favourite => favourite.targetId !== examId)
      );

    } catch (error) {
      console.error('Error toggling exam favorite status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật yêu thích.');
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setIsUserPopupOpen(true);
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-100 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <main className="px-4 sm:px-6 lg:px-8 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[1024px] flex-1">
            {/* Title */}
            <div className="flex flex-wrap justify-between gap-3 p-4 items-center">
              <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">{activeTab === 'courses' ? 'Lớp học' : activeTab === 'lectures' ? 'Bài giảng' : 'Đề thi'} yêu thích</p>
            </div>
            {/* Search bar and filter */}
            <div className="mx-4">
              <div className="flex flex-row gap-4 items-center">
                <input
                  type="text"
                  placeholder="Tìm kiếm ..."
                  className="flex-6 form-input md:col-span-1 rounded-lg border-slate-300 focus:border-[#1980e6] focus:ring focus:ring-[#1980e6]/30 p-2.5 h-11 text-sm bg-white rounded-xl border-none shadow-sm"
                  onKeyDown={handleSearch}
                  onChange={handleInputChange}
                />
                <div className="flex items-center">
                  <label htmlFor="grade-select" className="sr-only">Chọn khối lớp</label>
                  <select
                    id="grade-select"
                    name="grade"
                    defaultValue="Lớp 1"
                    onChange={handleGradeChange}
                    className="appearance-none cursor-pointer bg-transparent border-none text-[#0e141b] text-sm font-medium focus:outline-none focus:ring-0 p-0 pr-5 sm:pr-6 bg-[image:var(--select-button-svg-black)] bg-no-repeat bg-right center leading-tight"
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
                    <option value="">Tất cả môn học</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="pb-0 border-b border-[#d0dbe7]">
              <div className="flex px-4 gap-8">
                {(['courses', 'lectures', 'exams'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 transition-all duration-200 ease-out ${activeTab === tab
                      ? 'border-b-[#1568c1] text-[#0e141b]'
                      : 'border-b-transparent text-[#4e7297] hover:text-[#0e141b] hover:border-b-slate-300'
                      }`}
                  >
                    <p className={`text-sm font-bold leading-normal tracking-[0.015em]`}>
                      {tab === 'courses' ? 'Lớp học' : tab === 'lectures' ? 'Bài giảng' : 'Đề thi'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-1">
              {loading ? (
                <div className="flex justify-center items-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1980e6]"></div>
                </div>
              ) : (
                <>
                  {activeTab === 'courses' && (
                    <div>
                      {favouriteCourses.length > 0 ? (
                        favouriteCourses.map(favourite => (
                          <CourseCard
                            key={favourite.id}
                            {...favourite.details}
                            onClick={() => navigate(`/courses/${favourite.details.id}/lectures`)}
                            onSelectUser={handleSelectUser}
                          />
                        ))
                      ) : (
                        <p className="p-10 text-center text-slate-500">Bạn chưa thêm lớp học nào vào danh sách yêu thích</p>
                      )}
                    </div>
                  )}
                  {activeTab === 'lectures' && (
                    <div>
                      {favouriteLectures.length > 0 ? (
                        favouriteLectures.map(favourite => (
                          <LectureCard
                            key={favourite.id}
                            {...favourite.details}
                            onClick={() => navigate(`/lectures/${favourite.details.id}`)}
                            onSelectUser={handleSelectUser}
                          />
                        ))
                      ) : (
                        <p className="p-10 text-center text-slate-500">Bạn chưa thêm bài giảng nào vào danh sách yêu thích</p>
                      )}
                    </div>
                  )}
                  {activeTab === 'exams' && (
                    <div>
                      {favouriteExams.length > 0 ? (
                        favouriteExams.map(favourite => (
                          <ExamCard
                            key={favourite.id}
                            {...favourite.details}
                            onClick={() => navigate(`/courses/${favourite.details.classId}/exams/${favourite.details.id}/instructions`, {
                              state: {
                                examId: favourite.details.id,
                                courseId: favourite.details.classId,
                                examTitle: favourite.details.title,
                                courseName: favourite.details.className,
                                subjectName: favourite.details.subjectName,
                                subjectGrade: favourite.details.grade,
                                duration: favourite.details.durationMinutes,
                                numQuestions: favourite.details.totalQuestions,
                              }
                            })}
                            onToggleFavorite={handleToggleFavoriteExam}
                          />
                        ))
                      ) : (
                        <p className="p-10 text-center text-slate-500">Bạn chưa thêm đề thi nào vào danh sách yêu thích</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
        <ProfileDialog
          isOpen={isUserPopupOpen}
          onClose={() => setIsUserPopupOpen(false)}
          user={selectedUser}
        />
      </div>
    </div>
  );
};

export default FavouritesPage;