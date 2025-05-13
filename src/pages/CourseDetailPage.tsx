import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Course } from '../api/courseApi';
import { getCourseById, deleteCourse } from '../api/courseApi';
import { baseURL } from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { ConfirmationDialog } from '../components/Common/ConfirmationDialog';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CourseDetailPage: React.FC = () => {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [openChapterId, setOpenChapterId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const role = JSON.parse(localStorage.getItem('user') || '{}').role;

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        console.log('Course ID is missing from params.');
        setLoading(false);
        return;
      }

      try {
        const data = await getCourseById(id);
        setCourse(data);

        if (data && data.chapters && data.chapters.length > 0) {
          setOpenChapterId(data.chapters[0].id);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]); // Thêm id vào dependency array để fetch lại nếu id thay đổi

  const handleToggleChapter = (chapterId: string) => {
    setOpenChapterId(prevOpenChapterId => prevOpenChapterId === chapterId ? null : chapterId);
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    try {
      await deleteCourse(id);
      toast.success('Xóa lớp học thành công!');
      navigate('/courses'); // Navigate to the courses list page
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Không thể xóa lớp học. Vui lòng thử lại.'); // Or display an error message on the page
    } finally {
      closeDeleteDialog();
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Đang tải...</div>;
  }

  if (!course) {
    return <div className="flex justify-center items-center min-h-screen">Không tìm thấy khóa học.</div>;
  }

  return (
    <>
      <div
        className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              {/* Course Info */}
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <div className="flex-100 min-w-72 flex-col gap-3">
                  <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight">
                    {course.name}
                  </p>
                  <p className="text-[#4e7397] text-sm font-normal leading-normal">
                    {course.description}
                  </p>
                </div>
                {role == 1 && < button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal"
                  onClick={() => navigate(`/courses/${id}/edit`)}
                >
                  <span className="truncate">Sửa lớp học</span>
                </button>}
                {role == 1 && <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#E52020] text-slate-50 text-sm font-bold leading-normal"
                  onClick={openDeleteDialog}
                >
                  <span className="truncate">Xoá lớp học</span>
                </button>}
              </div>
              <div className="flex p-4 @container">
                <div className="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between">
                  <div className="flex gap-4">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl min-h-32 w-32"
                      style={{
                        backgroundImage: course.avatar ? `url("${baseURL}${course.avatar}")` : 'none',
                        backgroundColor: course.avatar ? 'transparent' : '#e7edf3'
                      }}
                    ></div>
                    <div className="flex flex-col">
                      <p className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em]">
                        {course.name}
                      </p>
                      <p className="text-[#4e7397] text-base font-normal leading-normal">
                        Giáo viên: {course.teacher?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {role == 0 && <div className="flex w-full max-w-[480px] gap-3 @[480px]:w-auto">
                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto">
                      <span className="truncate">Thêm vào danh sách yêu thích</span>
                    </button>
                  </div>}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 px-4 py-3">
                <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-[#d0dbe7] p-3 items-center text-center">
                  <p className="text-[#0e141b] tracking-light text-2xl font-bold leading-tight">{Number(course.averageRating).toFixed(1)}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[#4e7397] text-sm font-normal leading-normal">({Array.isArray(course.reviewIds) ? course.reviewIds.length : 0} đánh giá)</p>
                  </div>
                </div>
                <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-[#d0dbe7] p-3 items-center text-center">
                  <p className="text-[#0e141b] tracking-light text-2xl font-bold leading-tight">{Array.isArray(course.students) ? course.students.length : 0}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[#4e7397] text-sm font-normal leading-normal">học viên</p>
                  </div>
                </div>
                <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-[#d0dbe7] p-3 items-center text-center">
                  <p className="text-[#0e141b] tracking-light text-2xl font-bold leading-tight">{Array.isArray(course.chapters) ? course.chapters.length : 0}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[#4e7397] text-sm font-normal leading-normal">chương</p>
                  </div>
                </div>
                <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-[#d0dbe7] p-3 items-center text-center">
                  <p className="text-[#0e141b] tracking-light text-2xl font-bold leading-tight">{(Array.isArray(course.teacherAssistants) ? course.teacherAssistants.length : 0) + 1}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[#4e7397] text-sm font-normal leading-normal">giáo viên</p>
                  </div>
                </div>
              </div>

              <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                Nội dung khóa học
              </h3>
              <div className="flex flex-col p-4">
                {Array.isArray(course.chapters) && course.chapters.map((chapter, chapterIndex) => (
                  <details
                    key={chapter.id || chapterIndex}
                    className="flex flex-col border-t border-t-[#d0dbe7] py-2 group"
                    open={openChapterId === chapter.id}
                    onToggle={(e) => {
                      const currentTarget = e.target as HTMLDetailsElement;
                      if (currentTarget.open) {
                        setOpenChapterId(chapter.id);
                      } else if (openChapterId === chapter.id) {
                        setOpenChapterId(null);
                      }
                    }}
                  >
                    <summary
                      className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none"
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleChapter(chapter.id);
                      }}
                    >
                      <p className="text-[#0e141b] text-sm font-medium leading-normal">{chapter.name}</p>
                      <div className={`text-[#0e141b] transition-transform duration-200 ${openChapterId === chapter.id ? 'rotate-180' : ''}`} data-icon="CaretDown" data-size="20px" data-weight="regular">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                        </svg>
                      </div>
                    </summary>
                    {openChapterId === chapter.id && Array.isArray(chapter.lectures) && chapter.lectures.map((lecture, lectureIndex) => (
                      <div
                        key={lecture.id || lectureIndex}
                        className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between border-b border-b-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-12" data-icon="Play" data-size="24px" data-weight="regular">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                              <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"></path>
                            </svg>
                          </div>
                          <div className="flex flex-col justify-center">
                            <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                              {lecture.number}
                            </p>
                            <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">
                              {lecture.title}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <p className="text-[#4e7397] text-sm font-normal leading-normal">{lecture.duration}</p>
                        </div>
                      </div>
                    ))}
                  </details>
                ))}
              </div>

              <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Đánh giá</h3>
              <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-[#0e141b] text-4xl font-black leading-tight tracking-[-0.033em]">
                    {Number(course.averageRating).toFixed(1)}
                  </p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={`star-${i}`}
                        className={`text-${i < Math.floor(course.averageRating) ? '[#1980e6]' : '[#aec2d5]'}`}
                        data-icon="Star" data-size="20px" data-weight={i < Math.floor(course.averageRating) ? 'fill' : 'regular'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                        </svg>
                      </div>
                    ))}
                  </div>
                  <p className="text-[#0e141b] text-base font-normal leading-normal">({Array.isArray(course.reviewIds) ? course.reviewIds.length : 0} đánh giá)</p>
                </div>
                <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
                  <p className="text-[#0e141b] text-sm font-normal leading-normal">5</p>
                  <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#d0dbe7]">
                    <div className="rounded-full bg-[#1980e6]" style={{ width: '62%' }}></div>
                  </div>
                  <p className="text-[#4e7397] text-sm font-normal leading-normal text-right">62%</p>

                  <p className="text-[#0e141b] text-sm font-normal leading-normal">4</p>
                  <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#d0dbe7]">
                    <div className="rounded-full bg-[#1980e6]" style={{ width: '25%' }}></div>
                  </div>
                  <p className="text-[#4e7397] text-sm font-normal leading-normal text-right">25%</p>

                  <p className="text-[#0e141b] text-sm font-normal leading-normal">3</p>
                  <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#d0dbe7]">
                    <div className="rounded-full bg-[#1980e6]" style={{ width: '25%' }}></div>
                  </div>
                  <p className="text-[#4e7397] text-sm font-normal leading-normal text-right">25%</p>

                  <p className="text-[#0e141b] text-sm font-normal leading-normal">2</p>
                  <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#d0dbe7]">
                    <div className="rounded-full bg-[#1980e6]" style={{ width: '25%' }}></div>
                  </div>
                  <p className="text-[#4e7397] text-sm font-normal leading-normal text-right">25%</p>

                  <p className="text-[#0e141b] text-sm font-normal leading-normal">1</p>
                  <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#d0dbe7]">
                    <div className="rounded-full bg-[#1980e6]" style={{ width: '25%' }}></div>
                  </div>
                  <p className="text-[#4e7397] text-sm font-normal leading-normal text-right">25%</p>
                </div>
              </div>
              <div className="flex justify-stretch">
                <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-4 py-3">
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] w-full">
                    <span className="truncate">Viết đánh giá</span>
                  </button>
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] w-full">
                    <span className="truncate">Xem tất cả đánh giá</span>
                  </button>
                </div>
              </div>
              <div className="flex px-4 py-3 justify-end">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]">
                  <span className="truncate">Load more</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div >

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        title="Xác nhận xoá lớp học"
        message="Nếu xoá lớp học các bài gỉang, câu hỏi ôn tập, và đề thi vẫn có thể tìm thấy ở các trang quản lý tương ứng."
        onConfirm={handleConfirmDelete}
        confirmButtonText="Xác nhận xoá"
        cancelButtonText="Huỷ"
        confirmButtonColorClass="bg-red-600 hover:bg-red-700"
      />
      <ToastContainer />
    </>
  );
};

export default CourseDetailPage;