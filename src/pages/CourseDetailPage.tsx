import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Chapter, Course } from '../api/courseApi'; // Đổi tên để tránh trùng lặp nếu cần
import { getCourseById } from '../api/courseApi';
import { baseURL } from '../config/axios';


const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Sử dụng 'id' như trong code bạn cung cấp
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [openChapterId, setOpenChapterId] = useState<string | null>(null);

  const mockChapters: Chapter[] = [
    {
      id: '1',
      name: 'Chapter 1',
      lectures: [
        {
          id: '1',
          number: '1',
          title: 'Lecture 1',
          duration: '10:00'
        },
        {
          id: '2',
          number: '2',
          title: 'Lecture 2',
          duration: '10:00'
        }
      ]
    },
    {
      id: '2',
      name: 'Chapter 2',
      lectures: [
        {
          id: '2',
          number: '2',
          title: 'Lecture 2',
          duration: '10:00'
        },
        {
          id: '3',
          number: '3',
          title: 'Lecture 3',
          duration: '10:00'
        },
        {
          id: '4',
          number: '4',
          title: 'Lecture 4',
          duration: '10:00'
        }
      ]
    },
    {
      id: '3',
      name: 'Chapter 3',
      lectures: [
        {
          id: '3',
          number: '3',
          title: 'Lecture 3',
          duration: '10:00'
        }
      ]
    },
    {
      id: '4',
      name: 'Chapter 4',
      lectures: [
        {
          id: '4',
          number: '4',
          title: 'Lecture 4',
          duration: '10:00'
        },
        {
          id: '5',
          number: '5',
          title: 'Lecture 5',
          duration: '10:00'
        },
        {
          id: '6',
          number: '6',
          title: 'Lecture 6',
          duration: '10:00'
        }
      ]
    }
  ]
  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        console.log('Course ID is missing from params.');
        setLoading(false);
        return;
      }
      console.log('Fetching course with ID:', id);
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

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!course) {
    return <div className="flex justify-center items-center min-h-screen">Course not found.</div>;
  }

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Course Info */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight">
                  {course.name}
                </p>
                <p className="text-[#4e7397] text-sm font-normal leading-normal">
                  {course.allCategories.join(' ')}
                </p>
              </div>
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-medium leading-normal">
                <span className="truncate">Start course</span>
              </button>
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
                      Teacher: {course.teacher?.name || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex w-full max-w-[480px] gap-3 @[480px]:w-auto">
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto">
                    <span className="truncate">Share</span>
                  </button>
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto">
                    <span className="truncate">Add to list</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 px-4 py-3">
              <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-[#d0dbe7] p-3 items-center text-center">
                <p className="text-[#0e141b] tracking-light text-2xl font-bold leading-tight">{Number(course.averageRating).toFixed(1)}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[#4e7397] text-sm font-normal leading-normal">({Array.isArray(course.reviewIds) ? course.reviewIds.length : 0} ratings)</p>
                </div>
              </div>
              <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-[#d0dbe7] p-3 items-center text-center">
                <p className="text-[#0e141b] tracking-light text-2xl font-bold leading-tight">{Array.isArray(course.students) ? course.students.length : 0}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[#4e7397] text-sm font-normal leading-normal">students</p>
                </div>
              </div>
              <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-[#d0dbe7] p-3 items-center text-center">
                <p className="text-[#0e141b] tracking-light text-2xl font-bold leading-tight">{Array.isArray(course.chapters) ? course.chapters.length : 0}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[#4e7397] text-sm font-normal leading-normal">chapters</p>
                </div>
              </div>
              <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-2 rounded-lg border border-[#d0dbe7] p-3 items-center text-center">
                <p className="text-[#0e141b] tracking-light text-2xl font-bold leading-tight">{(Array.isArray(course.teacherAssistants) ? course.teacherAssistants.length : 0) + 1}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[#4e7397] text-sm font-normal leading-normal">teachers</p>
                </div>
              </div>
            </div>

            <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Course content
            </h3>
            <div className="flex flex-col p-4">
              {Array.isArray(mockChapters) && mockChapters.map((chapter, chapterIndex) => (
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
                  <div className="pt-2 flex flex-col">
                    {Array.isArray(chapter.lectures) && chapter.lectures.map((lecture, lectureIndex) => (
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
                  </div>
                </details>
              ))}
            </div>

            <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Reviews</h3>
            <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
              <div className="flex flex-col gap-2">
                <p className="text-[#0e141b] text-4xl font-black leading-tight tracking-[-0.033em]">
                  {Number(course.averageRating).toFixed(1)}
                </p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={i < Math.round(course.averageRating) ? "text-[#1980e6]" : "text-[#aec2d5]"} data-icon="Star" data-size="18px" data-weight={i < Math.round(course.averageRating) ? "fill" : "regular"}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                        {i < Math.round(course.averageRating) ? (
                          <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                        ) : (
                          <path d="M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Zm-15.22,5-45.1,39.36a16,16,0,0,0-5.08,15.71L187.35,216v0l-51.07-31a15.9,15.9,0,0,0-16.54,0l-51,31h0L82.2,157.4a16,16,0,0,0-5.08-15.71L32,102.35a.37.37,0,0,1,0-.09l59.44-5.14a16,16,0,0,0,13.35-9.75L128,32.08l23.2,55.29a16,16,0,0,0,13.35,9.75L224,102.26S224,102.32,224,102.33Z"></path>
                        )}
                      </svg>
                    </div>
                  ))}
                </div>
                <p className="text-[#0e141b] text-base font-normal leading-normal">({Array.isArray(course.reviewIds) ? course.reviewIds.length : 0} ratings)</p>
              </div>
            </div>
            <div className="flex justify-stretch">
              <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-4 py-3">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] w-full">
                  <span className="truncate">Write a review</span>
                </button>
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] w-full">
                  <span className="truncate">View all reviews</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-8 overflow-x-hidden bg-slate-50 p-4">
              {/* Review 1 */}
              <div className="flex flex-col gap-3 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                    style={{
                      backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/f4228942-728e-4d8c-85bc-d8959d7fa10b.png")',
                    }}
                  ></div>
                  <div className="flex-1">
                    <p className="text-[#0e141b] text-base font-medium leading-normal">Sarah</p>
                    <p className="text-[#4e7397] text-sm font-normal leading-normal">Jan 1 2023</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {/* 5 Star Icons */}
                  {[...Array(5)].map((_, i) => (
                    <div key={`sarah-star-${i}`} className="text-[#1980e6]" data-icon="Star" data-size="20px" data-weight="fill">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                      </svg>
                    </div>
                  ))}
                </div>
                <p className="text-[#0e141b] text-base font-normal leading-normal">
                  This course is great! It&apos;s very practical and easy to understand. The teacher is very patient and
                  explains things clearly. I would recommend it to anyone who wants to learn data analysis.
                </p>
              </div>

              {/* Review 2 */}
              <div className="flex flex-col gap-3 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                    style={{
                      backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/c42d874e-4790-484e-afbf-1b61e82b34eb.png")',
                    }}
                  ></div>
                  <div className="flex-1">
                    <p className="text-[#0e141b] text-base font-medium leading-normal">John</p>
                    <p className="text-[#4e7397] text-sm font-normal leading-normal">Dec 20 2022</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(4)].map((_, i) => ( // 4 filled stars
                    <div key={`john-star-filled-${i}`} className="text-[#1980e6]" data-icon="Star" data-size="20px" data-weight="fill">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                      </svg>
                    </div>
                  ))}
                  <div className="text-[#aec2d5]" data-icon="Star" data-size="20px" data-weight="regular"> {/* 1 regular star */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Zm-15.22,5-45.1,39.36a16,16,0,0,0-5.08,15.71L187.35,216v0l-51.07-31a15.9,15.9,0,0,0-16.54,0l-51,31h0L82.2,157.4a16,16,0,0,0-5.08-15.71L32,102.35a.37.37,0,0,1,0-.09l59.44-5.14a16,16,0,0,0,13.35-9.75L128,32.08l23.2,55.29a16,16,0,0,0,13.35,9.75L224,102.26S224,102.32,224,102.33Z"></path>
                    </svg>
                  </div>
                </div>
                <p className="text-[#0e141b] text-base font-normal leading-normal">
                  This course is good for beginners. It covers the basics of data analysis with Excel. The only downside
                  is that the video quality is not very good.
                </p>
              </div>

              {/* Review 3 */}
              <div className="flex flex-col gap-3 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                    style={{
                      backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/8fb87f7b-d1a2-434f-8d1d-16185d4ea4e0.png")',
                    }}
                  ></div>
                  <div className="flex-1">
                    <p className="text-[#0e141b] text-base font-medium leading-normal">Helen</p>
                    <p className="text-[#4e7397] text-sm font-normal leading-normal">Dec 1 2022</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(4)].map((_, i) => ( // 4 filled stars
                    <div key={`helen-star-filled-${i}`} className="text-[#1980e6]" data-icon="Star" data-size="20px" data-weight="fill">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                      </svg>
                    </div>
                  ))}
                  <div className="text-[#aec2d5]" data-icon="Star" data-size="20px" data-weight="regular"> {/* 1 regular star */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Zm-15.22,5-45.1,39.36a16,16,0,0,0-5.08,15.71L187.35,216v0l-51.07-31a15.9,15.9,0,0,0-16.54,0l-51,31h0L82.2,157.4a16,16,0,0,0-5.08-15.71L32,102.35a.37.37,0,0,1,0-.09l59.44-5.14a16,16,0,0,0,13.35-9.75L128,32.08l23.2,55.29a16,16,0,0,0,13.35,9.75L224,102.26S224,102.32,224,102.33Z"></path>
                    </svg>
                  </div>
                </div>
                <p className="text-[#0e141b] text-base font-normal leading-normal">
                  I enjoyed the course. The examples are very helpful and the pace is just right. The teacher is
                  knowledgeable and engaging. I learned a lot from this course.
                </p>
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
    </div>
  );
};

export default CourseDetailPage;