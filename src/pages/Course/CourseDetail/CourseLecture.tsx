import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { Chapter } from '@/api/courseApi';
import type { CourseDetailContextType } from '@/pages/Course/CourseDetailPage';

const CourseLectures: React.FC = () => {
  const context = useOutletContext<CourseDetailContextType>();
  const navigate = useNavigate();
  if (!context) {
    return <div className="p-4 text-center">Không thể tải nội dung bài giảng. Vui lòng thử lại.</div>;
  }

  const { course, openChapterIds, handleToggleChapter, chapterLectures, subject, role } = context;

  if (!course) {
    return <div className="p-4">Đang tải thông tin bài giảng hoặc không tìm thấy khóa học...</div>;
  }

  return (
    <div className="course-lectures-content pb-10">
      <div className="flex flex-col md:flex-row @container rounded-lg mb-6 gap-4 items-start">
        <div
          className="bg-center bg-no-repeat aspect-video md:aspect-square bg-cover rounded-xl h-40 w-full md:h-32 md:w-32 shrink-0"
          style={{
            backgroundImage: course.avatar ? `url("${course.avatar}")` : 'none',
            backgroundColor: course.avatar ? 'transparent' : '#e7edf3'
          }}
        ></div>
        <div className="flex flex-col">
          <p className="text-[#0e141b] text-xl md:text-[22px] font-bold leading-tight tracking-[-0.015em]">
            Thông tin chi tiết
          </p>
          <div className="text-[#4e7397] text-base font-normal leading-normal mt-1">
            Giáo viên: {course.teacher?.name || 'N/A'}
          </div>
          <div className="text-[#4e7397] text-base font-normal leading-normal">
            Môn học: {subject ? `${subject.name} - Lớp ${subject.grade}` : 'N/A'}
          </div>
          {/* {role === 0 && (
            <div className="mt-3">
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto">
                <span className="truncate">Thêm vào danh sách yêu thích</span>
              </button>
            </div>
          )} */}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 rounded-lg mb-6">
        <div className="flex flex-col gap-1 rounded-lg border border-[#d0dbe7] p-3 items-center text-center">
          <p className="text-[#0e141b] tracking-light text-xl md:text-2xl font-bold leading-tight">{Number(course.averageRating).toFixed(1)}</p>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={`star-lectures-${i}`}
                className={`text-${i < Math.floor(course.averageRating || 0) ? '[#1980e6]' : '[#aec2d5]'}`}
                data-icon="Star" data-size="16px" data-weight={i < Math.floor(course.averageRating || 0) ? 'fill' : 'regular'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256"><path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path></svg>
              </div>
            ))}
          </div>
          <p className="text-[#4e7397] text-xs md:text-sm font-normal leading-normal">({Array.isArray(course.reviewIds) ? course.reviewIds.length : 0} đánh giá)</p>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-[#d0dbe7] p-3 items-center text-center">
          <p className="text-[#0e141b] tracking-light text-xl md:text-2xl font-bold leading-tight">{Array.isArray(course.students) ? course.students.length : 0}</p>
          <p className="text-[#4e7397] text-xs md:text-sm font-normal leading-normal">học viên</p>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-[#d0dbe7] p-3 items-center text-center">
          <p className="text-[#0e141b] tracking-light text-xl md:text-2xl font-bold leading-tight">{Array.isArray(course.chapters) ? course.chapters.length : 0}</p>
          <p className="text-[#4e7397] text-xs md:text-sm font-normal leading-normal">chương</p>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-[#d0dbe7] p-3 items-center text-center">
          <p className="text-[#0e141b] tracking-light text-xl md:text-2xl font-bold leading-tight">{(Array.isArray(course.teacherAssistants) ? course.teacherAssistants.length : 0) + 1}</p>
          <p className="text-[#4e7397] text-xs md:text-sm font-normal leading-normal">giáo viên</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4 border-b border-gray-200">
          Nội dung khóa học
        </h3>
        <div className="flex flex-col p-4">
          {Array.isArray(course.chapters) && course.chapters.length > 0 ? course.chapters.map((chapter: Chapter, chapterIndex: number) => (
            <details
              key={chapter.id || chapterIndex}
              className="flex flex-col border-t border-t-[#e7edf3] py-2 group first:border-t-0"
              open={openChapterIds.includes(chapter.id)}
              onToggle={(e) => {
                const detailsElement = e.target as HTMLDetailsElement;
                if (detailsElement.open && !openChapterIds.includes(chapter.id)) {
                  handleToggleChapter(chapter.id);
                } else if (!detailsElement.open && openChapterIds.includes(chapter.id)) {
                  handleToggleChapter(chapter.id);
                } else if (detailsElement.open) {
                  handleToggleChapter(chapter.id);
                }
              }}
            >
              <summary
                className="flex cursor-pointer items-center justify-between gap-6 py-3 list-none hover:bg-slate-50 rounded"
              >
                <p className="text-[#0e141b] text-base font-medium leading-normal">{chapter.name}</p>
                <div className={`text-[#0e141b] transition-transform duration-200 ${openChapterIds.includes(chapter.id) ? 'rotate-180' : ''}`} data-icon="CaretDown" data-size="20px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
              </summary>
              {openChapterIds.includes(chapter.id) && Array.isArray(chapter.lectureIds) && chapter.lectureIds.length > 0 && (
                <div className="flex flex-col pt-2 pl-4">
                  {chapterLectures[chapter.id] ? (
                    chapterLectures[chapter.id].map((lecture, lectureIndex) => (
                      <div
                        key={lecture.id}
                        className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-3 my-1 justify-between border border-transparent hover:border-slate-200 rounded-md cursor-pointer transition-all"
                        onClick={() => navigate(`/lectures/${lecture.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-[#1980e6] flex items-center justify-center rounded-full bg-[#e7edf3] shrink-0 size-10" data-icon="Play" data-size="20px" data-weight="fill">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256"><path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"></path></svg>
                          </div>
                          <div className="flex flex-col justify-center">
                            <p className="text-[#0e141b] text-sm font-medium leading-normal line-clamp-1">
                              {`Bài ${lectureIndex + 1}: ${lecture.name}`}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <p className="text-[#4e7397] text-xs font-normal leading-normal">{lecture.duration} phút</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-4 text-[#4e7397]">
                      Đang tải bài giảng...
                    </div>
                  )}
                  {chapterLectures[chapter.id] && chapterLectures[chapter.id].length === 0 && (
                    <p className="text-sm text-gray-500 py-3">Chương này chưa có bài giảng nào.</p>
                  )}
                </div>
              )}
              {openChapterIds.includes(chapter.id) && (!Array.isArray(chapter.lectureIds) || chapter.lectureIds.length === 0) && (
                <p className="text-sm text-gray-500 py-3 pl-4">Chương này chưa có bài giảng nào.</p>
              )}
            </details>
          )) : (
            <p className="text-center text-gray-500 py-6">Chưa có chương nào trong khóa học này.</p>
          )}
        </div>
      </div>

      {/* The existing review summary section can be added here for quick view
          or moved entirely to the CourseReviewsPage accessed via the drawer.
          For now, I'll keep it out of CourseLectures to make this component focused.
          If you want the review summary here, copy the relevant JSX from your original CourseDetailPage.
      */}
    </div>
  );
};
export default CourseLectures;