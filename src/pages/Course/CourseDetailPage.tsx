import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import type { Course } from '@/api/courseApi';
import { getCourseById, deleteCourse, getSubjectById } from '@/api/courseApi';
import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog';
import { toast } from 'react-toastify';
import { getLecturesByIds, type LectureResponse } from '@/api/lectureApi';
import CourseDrawer from '@/components/Course/CourseDrawer';

interface Subject {
  id: string;
  name: string;
  grade: number;
}

export interface CourseDetailContextType {
  courseId: string | undefined;
  role: number | null;
  isCourseLoading: boolean;
  course: Course | null;
  subject: Subject | null;
  subjectId: string | undefined;
  openChapterIds: string[];
  handleToggleChapter: (chapterId: string) => Promise<void>;
  chapterLectures: { [key: string]: LectureResponse[] };
  favorite: boolean;
}

const CourseDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: courseIdFromParams } = useParams<{ id: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [isCourseLoading, setIsCourseLoading] = useState(true);
  const [openChapterIds, setOpenChapterIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapterLectures, setChapterLectures] = useState<{ [key: string]: LectureResponse[] }>({});

  const courseId = courseIdFromParams;

  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role as number | null;

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) {
        setIsCourseLoading(false);
        toast.error('Không tìm thấy khóa học.');
        navigate('/courses');
        return;
      }
      setIsCourseLoading(true);
      setCourse(null);
      setSubject(null);
      setOpenChapterIds([]);
      setChapterLectures({});

      try {
        const courseData = await getCourseById(courseId);
        setCourse(courseData);

        if (courseData?.subjectId) {
          try {
            const subjectData = await getSubjectById(courseData.subjectId);
            setSubject(subjectData);
          } catch (subjectError) {
            console.error('Error fetching subject:', subjectError);
            toast.warn('Không thể tải thông tin môn học.'); // Non-critical error
          }
        }

        // Automatically navigate to the 'lectures' sub-route if on the base course/:id path
        const basePath = `/courses/${courseId}`;
        if (location.pathname === basePath || location.pathname === `${basePath}/`) {
          navigate('lectures', { replace: true, relative: 'path' });
        }

      } catch (error) {
        console.error('Error fetching course details:', error);
        toast.error('Không thể tải thông tin khóa học. Vui lòng thử lại.');
        navigate('/courses');
      } finally {
        setIsCourseLoading(false);
      }
    };
    fetchCourseDetails();
  }, [courseId, navigate, location.pathname]);

  const handleToggleChapter = useCallback(async (chapterId: string) => {
    setOpenChapterIds(prevOpenChapterIds => {
      const isOpen = prevOpenChapterIds.includes(chapterId);
      if (isOpen) {
        return prevOpenChapterIds.filter(id => id !== chapterId);
      } else {
        const currentChapter = course?.chapters.find(c => c.id === chapterId);
        if (currentChapter && currentChapter.lectureIds && currentChapter.lectureIds.length > 0 && !chapterLectures[chapterId]) {
          getLecturesByIds(currentChapter.lectureIds)
            .then(lectures => {
              setChapterLectures(prevLectures => ({ ...prevLectures, [chapterId]: lectures }));
            })
            .catch(error => {
              console.error('Error fetching lectures for chapter:', chapterId, error);
              toast.error('Không thể tải danh sách bài giảng cho chương này.');
            });
        }
        return [...prevOpenChapterIds, chapterId];
      }
    });
  }, [course, chapterLectures]);


  const openDeleteDialog = () => setIsDeleteDialogOpen(true);
  const closeDeleteDialog = () => setIsDeleteDialogOpen(false);

  const handleConfirmDelete = async () => {
    if (!courseId) return;
    try {
      await deleteCourse(courseId);
      toast.success('Xóa lớp học thành công!');
      navigate('/courses');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Không thể xóa lớp học. Vui lòng thử lại sau.');
    } finally {
      closeDeleteDialog();
    }
  };

  if (isCourseLoading && !course) {
    return <div className="flex justify-center items-center min-h-screen bg-slate-50">Đang tải thông tin khóa học...</div>;
  }

  if (!course && !isCourseLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy khóa học</h1>
        <p className="text-gray-600 mb-6">Có vẻ như khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <button
          onClick={() => navigate('/courses')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại danh sách khóa học
        </button>
      </div>
    );
  }

  const contextValue: CourseDetailContextType = {
    course,
    subject,
    role: userRole,
    openChapterIds,
    handleToggleChapter,
    chapterLectures,
    courseId,
    isCourseLoading,
    subjectId: course?.subjectId,
    favorite: course?.favourite || false,
  };

  return (
    <>
      <div className="relative flex min-h-screen bg-slate-50 group/design-root">
        <CourseDrawer />
        <main className="flex-1 layout-container flex flex-col overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8 flex-1">
            {course && (
              <div className="flex flex-wrap justify-between items-center gap-3 pb-4 mb-4 border-b border-slate-200 sticky top-0 bg-slate-50 z-10 px-1">
                <div className="flex-grow min-w-0">
                  <p className="text-4xl font-bold text-[#0d141c] truncate" title={course.name}>{course.name}</p>
                  {subject && <p className="text-sm text-gray-500">{`${subject.name} - Lớp ${subject.grade}`}</p>}
                </div>
                {userRole === 1 && (
                  <div className="flex gap-2 shrink-0 ">
                    <button
                      className="flex items-center justify-center text-sm font-bold rounded-lg h-9 px-3 bg-slate-200 hover:bg-slate-300 text-[#0e141b] transition-colors"
                      onClick={() => navigate(`/courses/${courseId}/edit`)}
                    >
                      Sửa lớp học
                    </button>
                    <button
                      className="flex items-center justify-center text-sm font-bold rounded-lg h-9 px-3 bg-red-500 hover:bg-red-600 text-white transition-colors"
                      onClick={openDeleteDialog}
                    >
                      Xoá lớp học
                    </button>
                  </div>
                )}
              </div>
            )}
            {isCourseLoading && !location.pathname.endsWith('/lectures') ? (
              <div className="flex justify-center items-center py-10"><span className="text-gray-500">Đang tải nội dung...</span></div>
            ) : (
              <Outlet context={contextValue} />
            )}
          </div>
        </main>
      </div>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        title="Xác nhận xoá lớp học"
        message={`Bạn có chắc chắn muốn xoá lớp học "${course?.name || 'này'}"? Hành động này không thể hoàn tác và có thể ảnh hưởng đến dữ liệu liên quan.`}
        confirmButtonText="Xác nhận xoá"
        cancelButtonText="Huỷ"
        onConfirm={handleConfirmDelete}
        confirmButtonColorClass="bg-red-600 hover:bg-red-700"
      />
    </>
  );
};

export default CourseDetailPage;