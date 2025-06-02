import React, { useState, useEffect } from 'react';
import { getSubjectsByGrade } from '@/api/courseApi';
import type { Subject } from '@/api/courseApi';
import { getFavouriteCourses, getFavouriteLectures, getFavouriteExams, addFavorite, removeFavorite } from '@/api/favouriteApi';
import type { FavouriteCourseResponse, FavouriteLectureResponse, FavouriteExamResponse } from '@/api/favouriteApi';
import type { Course } from '@/api/courseApi';
import type { LectureResponse } from '@/api/lectureApi';
import type { Exam } from '@/api/examApi';
import RatingStars from '@/components/Common/RatingStars';
import { toast } from 'react-toastify';
import ExamIcon from '@/assets/exam.svg';
import LectureIcon from '@/assets/lecture.svg';

// Item Card Components
const CourseCard: React.FC<Course> = ({ name, description, avatar, teacher, allCategories, averageRating }) => {
  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 rounded-xl bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-[2_2_0px] flex-col gap-3 p-5">
          <div className="flex flex-col gap-1">
            <p className="text-[#0e141b] text-xl font-bold leading-tight">{name}</p>
            <p className="text-[#4e7297] text-sm font-normal leading-normal">{description}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <img src={teacher.avatar} alt={teacher.name} className="size-9 rounded-full border border-slate-200" />
            <span className="text-[#0e141b] text-sm font-semibold">{teacher.name}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {allCategories.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-full">{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <RatingStars rating={averageRating} />
            <span className="text-[#0e141b] text-sm font-bold">{averageRating.toFixed(1)}</span>
          </div>
          <button
            className="mt-auto flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-[#1980e6] text-white text-sm font-medium leading-normal w-fit hover:bg-[#1367b8] transition-colors duration-200"
          >
            <span className="truncate">Continue</span>
          </button>
        </div>
        <div
          className="w-full md:w-1/3 bg-center bg-no-repeat aspect-video md:aspect-auto bg-cover rounded-r-xl min-h-[200px] md:min-h-full"
          style={{ backgroundImage: `url("${avatar || 'https://via.placeholder.com/300x200'}")` }}
        ></div>
      </div>
    </div>
  );
};

const LectureCard: React.FC<LectureResponse> = ({ name, description, duration, teacher }) => {
  return (
    <div className="p-4">
      <div className="flex items-start gap-4 rounded-xl p-5 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <img src={LectureIcon} alt="Lecture" className="w-8 h-8" />
        <div className="flex flex-col flex-grow gap-1">
          <p className="text-[#0e141b] text-xl font-bold leading-tight">{name}</p>
          <p className="text-[#4e7297] text-sm font-normal leading-normal mt-1">
            <span className="font-medium text-slate-600">Thời gian:</span> {Math.floor(duration / 60) === 0 ? '' : Math.floor(duration / 60) + 'giờ '} {duration % 60} phút
          </p>
          <div className="flex items-center gap-2 mt-2">
            <img src={teacher.avatar} alt={teacher.name} className="w-10 h-10 rounded-full" />
            <span className="text-[#0e141b] text-sm font-semibold">Giáo viên: {teacher.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExamCard: React.FC<Exam & {
  isFavorited: boolean;
  onToggleFavorite: (id: string, isFavorited: boolean) => void
}> = ({ title, durationMinutes, easyCount, mediumCount, hardCount, veryHardCount, easyScore, mediumScore, hardScore, veryHardScore, openTime, closeTime }) => {
  let status = "";
  let statusColor = "text-slate-600";
  let statusBgColor = "bg-slate-100";

  const totalQuestions = easyCount + mediumCount + hardCount + veryHardCount;
  const totalScore = easyCount * easyScore + mediumCount * mediumScore + hardCount * hardScore + veryHardCount * veryHardScore;

  if (closeTime) {
    const now = new Date();
    const close = new Date(closeTime);
    if (now > close) {
      status = "Đã kết thúc: " + close.toLocaleString();
      statusColor = "text-red-700";
      statusBgColor = "bg-red-100";
    } else {
      const timeLeft = Math.floor((close.getTime() - now.getTime()) / (1000 * 60));
      status = `Đang diễn ra, kết thúc trong ${timeLeft / 60 === 0 ? '' : timeLeft / 60 + 'giờ '} ${timeLeft % 60} phút`;
      statusColor = "text-green-700";
      statusBgColor = "bg-green-100";
    }
  } else if (openTime) {
    const now = new Date();
    const open = new Date(openTime);
    if (now < open) {
      status = "Thời gian mở đề: " + open.toLocaleString();
      statusColor = "text-slate-600";
      statusBgColor = "bg-slate-100";
    } else {
      status = "Đang diễn ra";
      statusColor = "text-green-700";
      statusBgColor = "bg-green-100";
    }
  } else {
    status = "Đang diễn ra";
    statusColor = "text-green-700";
    statusBgColor = "bg-green-100";
  }

  return (
    <div className="p-4">
      <div className="flex items-start gap-4 rounded-xl p-5 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <img src={ExamIcon} alt="Exam" className="w-8 h-8" />
        <div className="flex flex-col flex-grow gap-1">
          <p className="text-[#0e141b] text-xl font-bold leading-tight">{title}</p>
          <p className="text-[#4e7297] text-sm font-normal leading-normal mt-1">
            <span className="font-medium text-slate-600">Tổng số câu hỏi:</span> {totalQuestions}
          </p>
          <p className="text-[#4e7297] text-sm font-normal leading-normal">
            <span className="font-medium text-slate-600">Tổng điểm:</span> {totalScore} • <span className="font-medium text-slate-600">Thời gian:</span> {durationMinutes} phút
          </p>
          <p className={`text-sm font-bold leading-normal mt-2 inline-block px-2 py-0.5 rounded ${statusBgColor} ${statusColor}`}>
            {status}
          </p>
        </div>
      </div>
    </div>
  );
};

const FavouritesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'lectures' | 'exams'>('courses');
  const grades = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'];
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [_, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [favouriteCourses, setFavouriteCourses] = useState<FavouriteCourseResponse[]>([]);
  const [favouriteLectures, setFavouriteLectures] = useState<FavouriteLectureResponse[]>([]);
  const [favouriteExams, setFavouriteExams] = useState<FavouriteExamResponse[]>([]);

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
        const [courses, lectures, exams] = await Promise.all([
          getFavouriteCourses(selectedSubjectId),
          getFavouriteLectures(selectedSubjectId),
          getFavouriteExams(selectedSubjectId)
        ]);

        setFavouriteCourses(courses);
        setFavouriteLectures(lectures);
        setFavouriteExams(exams);
      } catch (error) {
        console.error('Error fetching favourites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [selectedSubjectId]);

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

  const handleToggleFavoriteExam = async (examId: string, isCurrentlyFavorited: boolean) => {
    try {
      if (isCurrentlyFavorited) {
        await removeFavorite(examId, 4); // 4 for Exam
        toast.success('Đã bỏ yêu thích đề thi');
      } else {
        await addFavorite(examId, 4); // 4 for Exam
        toast.success('Đã thêm vào danh sách yêu thích đề thi');
      }
      // Optimistically update UI or refetch exams
      setFavouriteExams(prevExams =>
        prevExams.filter(favourite => favourite.targetId !== examId)
      );

    } catch (error) {
      console.error('Error toggling exam favorite status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật yêu thích.');
    }
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
                    <p className={`text-sm font-bold leading-normal tracking-[0.015em] capitalize`}>
                      {tab}
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
                          />
                        ))
                      ) : (
                        <p className="p-10 text-center text-slate-500">No favorite courses yet.</p>
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
                          />
                        ))
                      ) : (
                        <p className="p-10 text-center text-slate-500">No favorite lectures yet.</p>
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
                            isFavorited={favourite.details.favourite}
                            onToggleFavorite={handleToggleFavoriteExam}
                          />
                        ))
                      ) : (
                        <p className="p-10 text-center text-slate-500">No favorite exams yet.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FavouritesPage;