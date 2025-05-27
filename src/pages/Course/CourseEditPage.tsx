import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, searchUserByEmail, type SearchUser, updateCourse, updateCoruseAvatar, createChapter, rejectJoinRequest, approveJoinRequest } from '@/api/courseApi';
import type { Chapter, Course } from '@/api/courseApi';
import { SearchableDialog } from '@/components/Common/SearchableDialog';
import { InputDialog } from '@/components/Common/InputDialog';
import AddIcon from '@/assets/add.svg';
import RemoveIcon from '@/assets/remove.svg';
import ApproveIcon from '@/assets/approve.svg';
import RejectIcon from '@/assets/reject.svg';
import { toast, ToastContainer } from 'react-toastify';
import { baseURL } from '@/config/axios';
import { ChapterItem } from '@/components/Course/ChapterItem';
import { useAuth } from '@/contexts/AuthContext';

interface MemberItemProps {
  id: string;
  name: string;
  avatar: string;
  email: string;
  onRemove: ((id: string) => void) | undefined;
  onReject: (id: string) => void;
  onApprove: (id: string) => void;
}

const AssistantItem: React.FC<MemberItemProps> = ({ id, name, avatar, email, onRemove }) => {
  return (
    <div
      key={id}
      className="w-full sm:w-[calc((100%_-_16px)_/_2)] lg:w-[calc((100%_-_32px)_/_3)] bg-slate-50 px-4 py-2 min-h-[72px] rounded-lg flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div
          className="bg-center bg-no-repeat bg-cover aspect-square h-14 w-14 rounded-full"
          style={{ backgroundImage: `url("${baseURL}${avatar}")` }}
        ></div>
        <div className="flex flex-col justify-center">
          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">{name}</p>
          <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">{email}</p>
        </div>
      </div>
      {onRemove && <button
        type="button"
        onClick={() => onRemove(id)}
        className="text-[#0e141b] flex items-center justify-center size-7 rounded-md hover:bg-gray-100 active:bg-gray-200 transition shrink-0"
        aria-label="Remove member"
      >
        <img src={RemoveIcon} alt="Remove" className="size-5" />
      </button>}
    </div>
  );
};

const StudentItem: React.FC<MemberItemProps> = ({ id, name, avatar, email, onRemove }) => {
  return (
    <div
      key={id}
      className="w-full sm:w-[calc((100%_-_16px)_/_2)] lg:w-[calc((100%_-_32px)_/_3)] bg-slate-50 px-4 py-2 min-h-[72px] rounded-lg flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div
          className="bg-center bg-no-repeat bg-cover aspect-square h-14 w-14 rounded-full"
          style={{ backgroundImage: `url("${baseURL}${avatar}")` }}
        ></div>
        <div className="flex flex-col justify-center">
          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">{name}</p>
          <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">{email}</p>
        </div>
      </div>
      {onRemove && <button
        type="button"
        onClick={() => onRemove(id)}
        className="text-[#0e141b] flex items-center justify-center size-7 rounded-md hover:bg-gray-100 active:bg-gray-200 transition shrink-0"
        aria-label="Remove member"
      >
        <img src={RemoveIcon} alt="Remove" className="size-5" />
      </button>}
    </div>
  );
};

const RequestItem: React.FC<MemberItemProps> = ({ id, name, avatar, email, onReject, onApprove }) => {
  return (
    <div
      key={id}
      className="w-full sm:w-[calc((100%_-_16px)_/_2)] lg:w-[calc((100%_-_32px)_/_3)] bg-slate-50 px-4 py-2 min-h-[72px] rounded-lg flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div
          className="bg-center bg-no-repeat bg-cover aspect-square h-14 w-14 rounded-full"
          style={{ backgroundImage: `url("${baseURL}${avatar}")` }}
        ></div>
        <div className="flex flex-col justify-center">
          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">{name}</p>
          <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">{email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onReject(id)}
        className="text-[#0e141b] flex items-center justify-center size-7 rounded-md hover:bg-gray-100 active:bg-gray-200 transition shrink-0"
        aria-label="Reject request"
      >
        <img src={RejectIcon} alt="Reject" className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => onApprove(id)}
        className="text-[#0e141b] flex items-center justify-center size-7 rounded-md hover:bg-gray-100 active:bg-gray-200 transition shrink-0"
        aria-label="Approve request"
      >
        <img src={ApproveIcon} alt="Approve" className="size-5" />
      </button>
    </div>
  );
};

const CourseEditPage: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [_, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'chapters' | 'members'>('general');
  const [selectedAvatarPreview, setSelectedAvatarPreview] = useState<string>('');
  const [hidden, setHidden] = useState<boolean>(false);
  const { user } = useAuth();

  // State cho teacher assistants và students
  const [isTeacherSearchOpen, setIsTeacherSearchOpen] = useState(false);
  const [isStudentSearchOpen, setIsStudentSearchOpen] = useState(false);
  const [selectedAssistants, setSelectedAssistants] = useState<SearchUser[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<SearchUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<SearchUser[]>([]);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // State cho chapters
  const [chaptersData, setChaptersData] = useState<Chapter[]>([]);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false); // New state for chapter creation loading

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for course name and description
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) {
        navigate('/courses');
        return;
      }
      try {
        const courseData = await getCourseById(courseId);
        setCourse(courseData);
        setSelectedAvatarPreview(courseData.avatar ? `${baseURL}${courseData.avatar}` : '');
        setHidden(courseData.hidden);
        setSelectedAssistants(courseData.teacherAssistants);
        setSelectedStudents(courseData.students);
        setPendingRequests(courseData.pendingStudents || []);

        setCourseName(courseData.name);
        setCourseDescription(courseData.description);

        setChaptersData(courseData.chapters);
      } catch (error) {
        console.error('Failed to load course:', error);
        setError('Không thể tải dữ liệu khóa học.');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, navigate]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    document.getElementById('avatarUpload')?.click();
  };

  const handlePrivacyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHidden(event.target.value === 'private');
  };

  // Handlers cho teacher assistants
  const openTeacherSearchDialog = () => {
    setIsTeacherSearchOpen(true);
  };

  const handleTeacherSelected = (teacher: SearchUser) => {
    if (!selectedAssistants.find(t => t.id === teacher.id)) {
      setSelectedAssistants(prev => [...prev, teacher]);
    }
  };

  // Handlers cho students
  const openStudentSearchDialog = () => {
    setIsStudentSearchOpen(true);
  };

  const handleStudentSelected = (student: SearchUser) => {
    if (!selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents(prev => [...prev, student]);
    }
  };

  // Render function cho dialog items
  const renderUserItemDialog = (user: SearchUser, onSelect: (user: SearchUser) => void) => (
    <div
      key={user.id}
      className="w-full bg-slate-50 px-4 py-3 min-h-[72px] rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
      onClick={() => onSelect(user)}
    >
      <div className="flex items-center gap-4">
        <div
          className="bg-center bg-no-repeat bg-cover aspect-square h-12 w-12 rounded-full"
          style={{ backgroundImage: `url("${baseURL}${user.avatar}")` }}
        ></div>
        <div className="flex flex-col justify-center">
          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">{user.name}</p>
          <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">{user.email}</p>
        </div>
      </div>
    </div>
  );

  const handleNewChapter = async (chapterTitle: string) => {
    if (!courseId) return;
    setIsCreatingChapter(true);
    try {
      const newChapter = await createChapter({
        name: chapterTitle,
        courseId: courseId,
      });
      setChaptersData(prev => [...prev, newChapter]);
      toast.success('Thêm Chapter mới thành công!');
    } catch (error: any) {
      console.error('Failed to create chapter:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm Chapter mới');
    } finally {
      setIsCreatingChapter(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!course) return;

    try {
      setIsSubmitting(true);

      // Upload avatar if changed
      if (selectedFile) {
        await updateCoruseAvatar(course.id, selectedFile);
      }

      // Update course details
      await updateCourse(course.id, {
        name: courseName,
        description: courseDescription,
        hidden: hidden,
        teacherAssistantIds: selectedAssistants.map(ta => ta.id),
        studentIds: selectedStudents.map(student => student.id)
      });

      toast.success('Cập nhật khóa học thành công!');
      navigate(-1);
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật khóa học');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChapterUpdated = async (chapter: Chapter) => {
    setChaptersData(prev => prev.map(c => c.id === chapter.id ? chapter : c));
  };

  const handleRejectRequest = async (studentId: string) => {
    if (!courseId) return;
    try {
      setIsRejecting(true);
      const updatedCourse = await rejectJoinRequest(courseId, studentId);
      setPendingRequests(updatedCourse.pendingStudents || []);
      toast.success('Từ chối yêu cầu tham gia thành công!');
    } catch (error: any) {
      console.error('Failed to reject request:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi từ chối yêu cầu');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleApproveRequest = async (studentId: string) => {
    if (!courseId) return;
    try {
      setIsApproving(true);
      const updatedCourse = await approveJoinRequest(courseId, studentId);
      setPendingRequests(updatedCourse.pendingStudents || []);
      setSelectedStudents(updatedCourse.students);
      toast.success('Chấp nhận yêu cầu tham gia thành công!');
    } catch (error: any) {
      console.error('Failed to approve request:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi chấp nhận yêu cầu');
    } finally {
      setIsApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#0e141b] text-lg">Loading...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#0e141b] text-lg">Course not found</p>
      </div>
    );
  }

  const handleChapterDeleted = async (chapterId: string) => {
    setChaptersData(prev => prev.filter(chapter => chapter.id !== chapterId));
  };


  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Header đã được bỏ */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] py-5 flex-1"> {/* Thay đổi width để rộng hơn */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight">Chỉnh sửa khóa học</p>
                <p className="text-[#4e7397] text-sm font-normal leading-normal">
                  Chỉnh sửa chi tiết khóa học như quản lý chương, quản lý thành viên, và thông tin cơ bản.
                </p>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="pb-3">
              <div className="flex border-b border-[#d0dbe7] px-4 gap-8">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === 'general' ? 'border-b-[#1980e6] text-[#0e141b]' : 'border-b-transparent text-[#4e7397]'
                    }`}
                >
                  <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTab === 'general' ? 'text-[#0e141b]' : 'text-[#4e7397]'
                    }`}>Thông tin chung</p>
                </button>
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === 'chapters' ? 'border-b-[#1980e6] text-[#0e141b]' : 'border-b-transparent text-[#4e7397]'
                    }`}
                >
                  <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTab === 'chapters' ? 'text-[#0e141b]' : 'text-[#4e7397]'
                    }`}>Chương và bài giảng</p>
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === 'members' ? 'border-b-[#1980e6] text-[#0e141b]' : 'border-b-transparent text-[#4e7397]'
                    }`}
                >
                  <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTab === 'members' ? 'text-[#0e141b]' : 'text-[#4e7397]'
                    }`}>Quản lý thành viên</p>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'general' && (
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 md:w-2/3">
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Tên khóa học</p>
                      <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Mô tả khóa học</p>
                      <textarea
                        placeholder="Mô tả khóa học"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] focus:border-[#d0dbe7] min-h-36 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                      ></textarea>
                    </label>
                  </div>
                </div>

                <div className="md:w-1/3 flex flex-col items-center px-4 py-3">
                  <div
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-colors aspect-square max-w-xs mx-auto"
                    onClick={handleAvatarClick}
                  >
                    {selectedAvatarPreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={selectedAvatarPreview}
                          alt="Selected avatar"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-gray-400 mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-[#0e141b] text-base font-medium leading-normal mb-1">Ảnh đại diện khóa học</p>
                        <p className="text-[#4e7397] text-sm font-normal leading-normal">
                          Kéo và thả hoặc <span className="text-blue-600 font-semibold">click để tải lên</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF</p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png, image/jpeg, image/gif"
                      onChange={handleAvatarChange}
                      id="avatarUpload"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <>
                {/* Privacy Section - vẫn ở tab thứ nhất */}
                <div className="px-4"> {/* Thêm px-4 để căn chỉnh */}
                  <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">Cài đặt</h3>
                  <p className="text-[#0e141b] text-base font-normal leading-normal pb-3 pt-1">
                    Khi khóa học là công khai, nó sẽ có thể tìm thấy bởi mọi học sinh. Khi khóa học bị ẩn, chỉ học sinh đã được thêm vào khóa học mới có thể nhìn thấy.
                  </p>
                  <div className="flex flex-wrap gap-3 pb-4 pt-1"> {/* Đổi p-4 thành pb-4 pt-1 */}
                    <label
                      className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-4 h-11 text-[#0e141b] relative cursor-pointer ${hidden === false ? 'border-[3px] px-3.5 border-[#1980e6]' : 'border-[#d0dbe7]'
                        }`}
                    >
                      Công khai
                      <input
                        type="radio"
                        className="invisible absolute"
                        name="privacy"
                        value="public"
                        checked={!hidden}
                        onChange={handlePrivacyChange}
                      />
                    </label>
                    <label
                      className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-4 h-11 text-[#0e141b] relative cursor-pointer ${hidden === true ? 'border-[3px] px-3.5 border-[#1980e6]' : 'border-[#d0dbe7]'
                        }`}
                    >
                      Ẩn
                      <input
                        type="radio"
                        className="invisible absolute"
                        name="privacy"
                        value="private"
                        checked={hidden}
                        onChange={handlePrivacyChange}
                      />
                    </label>
                  </div>
                </div>
              </>
            )}


            {activeTab === 'chapters' && (
              <div>
                <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Chương và bài giảng</h3>
                <div className="flex flex-col p-4">
                  {chaptersData.map((chapter, index) => (
                    <ChapterItem
                      key={chapter.id}
                      index={index}
                      chapter={chapter}
                      onChapterUpdated={handleChapterUpdated}
                      onChapterDeleted={handleChapterDeleted}
                      subjectId={course.subjectId}
                      isOwner={course.teacher?.id === user?.id}
                    />
                  ))}
                </div>
                <div className="flex px-4 py-3">
                  <button
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setIsChapterDialogOpen(true)}
                    disabled={isCreatingChapter || (course?.teacher?.id !== user?.id)}
                  >
                    <span className="truncate">
                      {isCreatingChapter
                        ? 'Đang tạo...'
                        : (course?.teacher?.id !== user?.id
                          ? 'Chỉ có giáo viên tạo lớp học mới có quyền sửa đổi chương và bài giảng'
                          : 'Chương mới'
                        )
                      }
                    </span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div>
                <div className="flex flex-row gap-4 items-center">
                  <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Trợ giảng</h3>
                  <button
                    type="button"
                    className="text-[#0e141b] flex items-center justify-center size-7 rounded-md hover:bg-gray-100 active:bg-gray-200 transition"
                    aria-label="Add teacher"
                    onClick={openTeacherSearchDialog}
                  >
                    <img src={AddIcon} alt="" className="size-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-4 px-4">
                  {selectedAssistants.map((assistant) => (
                    <AssistantItem
                      key={assistant.id}
                      id={assistant.id}
                      name={assistant.name}
                      avatar={assistant.avatar}
                      email={assistant.email}
                      onRemove={course.teacher?.id === user?.id ? (id) => setSelectedAssistants(prev => prev.filter(t => t.id !== id)) : undefined}
                      onReject={(_) => { }}
                      onApprove={(_) => { }}
                    />
                  ))}
                </div>

                {/* Students Section */}
                <div className="flex flex-row gap-4 items-center">
                  <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Học sinh</h3>
                  <button
                    type="button"
                    className="text-[#0e141b] flex items-center justify-center size-7 rounded-md hover:bg-gray-100 active:bg-gray-200 transition"
                    aria-label="Add student"
                    onClick={openStudentSearchDialog}
                  >
                    <img src={AddIcon} alt="" className="size-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-4 px-4">
                  {selectedStudents.map((student) => (
                    <StudentItem
                      key={student.id}
                      id={student.id}
                      name={student.name}
                      avatar={student.avatar}
                      email={student.email}
                      onRemove={(id) => setSelectedStudents(prev => prev.filter(s => s.id !== id))}
                      onReject={(_) => { }}
                      onApprove={(_) => { }}
                    />
                  ))}
                </div>

                {/* Request Section */}
                <div className="flex flex-row gap-4 items-center">
                  <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Yêu cầu tham gia</h3>
                </div>
                <div className="flex flex-wrap gap-4 px-4">
                  {pendingRequests.map((request) => (
                    <RequestItem
                      key={request.id}
                      id={request.id}
                      name={request.name}
                      avatar={request.avatar}
                      email={request.email}
                      onRemove={(_) => { }}
                      onReject={handleRejectRequest}
                      onApprove={handleApproveRequest}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab !== 'chapters' && <div className="flex px-4 py-3">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSaveChanges}
                disabled={isSubmitting}
              >
                <span className="truncate">{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
            </div>}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <SearchableDialog<SearchUser>
        isOpen={isTeacherSearchOpen}
        onClose={() => setIsTeacherSearchOpen(false)}
        title="Tìm kiếm giáo viên"
        searchPlaceholder="Nhập email giáo viên (+ enter)"
        onSearch={(email) => searchUserByEmail(email, 1)}
        renderItem={renderUserItemDialog}
        onItemSelected={handleTeacherSelected}
        itemContainerClassName="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 overflow-y-auto max-h-[50vh]"
      />
      <SearchableDialog<SearchUser>
        isOpen={isStudentSearchOpen}
        onClose={() => setIsStudentSearchOpen(false)}
        title="Tìm kiếm học sinh"
        searchPlaceholder="Nhập email học sinh (+ enter)"
        onSearch={(email) => searchUserByEmail(email, 0)}
        renderItem={renderUserItemDialog}
        onItemSelected={handleStudentSelected}
        itemContainerClassName="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 overflow-y-auto max-h-[50vh]"
      />

      <InputDialog
        isOpen={isChapterDialogOpen}
        onClose={() => setIsChapterDialogOpen(false)}
        title="Thêm Chapter mới"
        placeholder="Nhập tên Chapter"
        onSubmit={handleNewChapter}
        submitButtonText="Tạo"
      />
      <ToastContainer />
    </div>
  );
};

export default CourseEditPage;