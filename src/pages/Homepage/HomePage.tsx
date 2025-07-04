import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { useAuth } from '@/contexts/AuthContext';
import { getHighlightCourses, getUpcomingExams } from '@/api/homeApi';
import type { Course } from '@/api/courseApi';
import { requestJoinCourse } from '@/api/courseApi';
import type { Exam } from '@/api/examApi';
import { useNavigate } from 'react-router-dom';
import CourseItem from '@/components/Course/CourseItem';
import ExamCard from '@/components/Exam/ExamCard';
import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog';
import { toast } from 'react-toastify';
import ViewAllButton from '@/components/Homepage/ViewAllButton';
import SlideToLeftIcon from '@/assets/slide_to_left.svg';
import SlideToRightIcon from '@/assets/slide_to_right.svg';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [heroSearchValue, setHeroSearchValue] = useState('');
  const [highlightCourses, setHighlightCourses] = useState<Course[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (user && user.role === 100) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    document.title = 'EduWorld - HomePage';
    const fetchData = async () => {
      try {
        const [courses, exams] = await Promise.all([
          getHighlightCourses(),
          getUpcomingExams()
        ]);
        setHighlightCourses(courses);
        setUpcomingExams(exams);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: highlightCourses.length > 5,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
    autoplay: highlightCourses.length > 5,
    autoplaySpeed: 3000,
    arrows: highlightCourses.length > 5,
    centerMode: false,
    centerPadding: '0px',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: highlightCourses.length > 3,
          arrows: highlightCourses.length > 3,
          centerMode: false,
          centerPadding: '0px',
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: highlightCourses.length > 2,
          arrows: highlightCourses.length > 2,
          centerMode: false,
          centerPadding: '0px',
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: highlightCourses.length > 1,
          arrows: false,
          centerMode: false,
          centerPadding: '0px',
        }
      }
    ],
    prevArrow: <img src={SlideToLeftIcon} alt="prev" />,
    nextArrow: <img src={SlideToRightIcon} alt="next" />,
  };

  const handleViewAllCourses = () => {
    navigate('/courses');
  };

  const handleViewAllExams = () => {
    navigate('/exams');
  };

  const handleHighlightCourseClick = (course: Course) => {
    const role = user?.role;
    const userId = user?.id;

    if (role === 0 && !course.students.some(student => student.id === userId)) {
      setSelectedCourse(course);
      setShowJoinDialog(true);
    } else {
      navigate(`/courses/${course.id}`);
    }
  };

  const handleJoinRequest = async () => {
    if (!selectedCourse) return;

    try {
      const response = await requestJoinCourse(selectedCourse.id);
      if (response === 200000) {
        toast.success('Gửi yêu cầu thành công');
      } else if (response === 200001) {
        toast.warning('Bạn đã gửi yêu cầu tham gia lớp học rồi');
      } else if (response === 200002) {
        toast.error('Bạn đã tham gia lớp học này. Hãy reload lại trang để truy cập lớp học');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setShowJoinDialog(false);
      setSelectedCourse(null);
    }
  };

  const handleUpcomingExamClick = (exam: Exam) => {
    navigate(`/courses/${exam.classId}/exams/${exam.id}/instructions`, {
      state: {
        examId: exam.id,
        courseId: exam.classId,
        examTitle: exam.title,
        courseName: exam.className,
        subjectName: exam.subjectName,
        subjectGrade: exam.grade,
        duration: exam.durationMinutes,
        numQuestions: exam.totalQuestions,
        subjectId: undefined,
      }
    });
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchValue.trim()) {
      navigate('/search', { state: { initialQuery: heroSearchValue } });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <div
        className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
              <div className="@container">
                <div className="@[480px]:p-4">
                  <div
                    className="flex min-h-[380px] sm:min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-start justify-end px-4 pb-10 @[480px]:px-10"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://online.njit.edu/sites/online/files/iStock-509114480.jpg")',
                    }}
                  >
                    <div className="flex flex-col gap-2 text-left">
                      <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                        Xin chào, {user?.name || 'Guest'}!
                      </h1>
                      <h2 className="text-white text-xs sm:text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                        Chào mừng bạn đến với EduWorld. Khám phá các khóa học, bài giảng và nhiều hơn nữa.
                      </h2>
                    </div>
                    <label className="flex flex-col min-w-40 h-12 sm:h-14 w-full max-w-[480px] @[480px]:h-16">
                      <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                        <div
                          className="text-[#4e7397] flex border border-[#d0dbe7] bg-slate-50 items-center justify-center pl-3 sm:pl-[15px] rounded-l-xl border-r-0"
                          data-icon="MagnifyingGlass"
                          data-size="20px"
                          data-weight="regular"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                          </svg>
                        </div>
                        <input
                          placeholder="Tìm kiếm khóa học hoặc bài giảng"
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-full placeholder:text-[#4e7397] px-3 sm:px-[15px] rounded-r-none border-r-0 pr-2 rounded-l-none border-l-0 pl-2 text-xs sm:text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal"
                          value={heroSearchValue}
                          onChange={(e) => setHeroSearchValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleHeroSearch(e);
                            }
                          }}
                        />
                        <div className="flex items-center justify-center rounded-r-xl border-l-0 border border-[#d0dbe7] bg-slate-50 pr-1 sm:pr-[7px]">
                          <button
                            type="submit"
                            onClick={handleHeroSearch}
                            className="flex min-w-[70px] sm:min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-9 sm:h-10 px-3 sm:px-4 @[480px]:h-12 @[480px]:px-5 bg-[#1980e6] text-slate-50 text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]"
                          >
                            <span className="truncate">Tìm kiếm</span>
                          </button>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center px-4 pt-5 pb-3">
                <h2 className="text-[#0e141b] text-xl sm:text-[22px] font-bold leading-tight tracking-[-0.015em]">Khoá học nổi bật</h2>
                <ViewAllButton onClick={handleViewAllCourses} />
              </div>
              <div className="p-4 pt-0">
                <div className="slider-container" style={{ textAlign: 'left' }}>
                  <Slider {...sliderSettings}>
                    {highlightCourses.map((course) => (
                      <div key={course.id} className="px-2" style={{ float: 'left' }}>
                        <CourseItem
                          course={course}
                          onClick={handleHighlightCourseClick}
                        />
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>

              <div className="flex justify-between items-center px-4 pt-5 pb-3">
                <h2 className="text-[#0e141b] text-xl sm:text-[22px] font-bold leading-tight tracking-[-0.015em]">Đề thi sắp tới</h2>
                <ViewAllButton onClick={handleViewAllExams} />
              </div>
              <div className="px-0 sm:px-4 pb-4">
                {upcomingExams.map((exam) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    onClick={() => handleUpcomingExamClick(exam)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={showJoinDialog}
        onClose={() => {
          setShowJoinDialog(false);
          setSelectedCourse(null);
        }}
        title="Yêu cầu tham gia lớp học"
        message="Bạn chưa tham gia vào lớp học này. Gửi yêu cầu vào lớp tới giáo viên chứ?"
        onConfirm={handleJoinRequest}
        confirmButtonText="Gửi yêu cầu"
        cancelButtonText="Hủy"
      />
    </>
  );
};

export default HomePage;