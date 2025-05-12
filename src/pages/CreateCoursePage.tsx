import React, { useEffect, useState } from 'react';
import { getSubjectsByGrade, updateCoruseAvatar, type Subject } from '../api/courseApi';
import AddIcon from '../assets/add.svg';
import RemoveIcon from '../assets/remove.svg';
import { SearchableDialog } from '../components/Common/SearchableDialog';
import type { SearchUser } from '../api/courseApi';
import { searchUserByEmail } from '../api/courseApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedAvatarPreview, setSelectedAvatarPreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [className, setClassName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classNameError, setClassNameError] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  const grades = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'];
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const [isTeacherSearchOpen, setIsTeacherSearchOpen] = useState(false);
  const [selectedAssistants, setSelectedTeachers] = useState<SearchUser[]>([]);

  const [isStudentSearchOpen, setIsStudentSearchOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<SearchUser[]>([]);

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

  const handleGradeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const gradeNumber = parseInt(event.target.value.replace('Lớp ', ''));
    setSelectedGrade(gradeNumber);
  };

  const handleSubjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubjectId(event.target.value);
  };

  const openTeacherSearchDialog = () => {
    setIsTeacherSearchOpen(true);
  };

  const openStudentSearchDialog = () => {
    setIsStudentSearchOpen(true);
  };

  const renderTeacherItemDialog = (teacher: SearchUser, onSelect: (teacher: SearchUser) => void) => (
    <div
      key={teacher.id}
      className="w-full bg-slate-50 px-4 py-3 min-h-[72px] rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
      onClick={() => onSelect(teacher)}
    >
      <div className="flex items-center gap-4">
        <div
          className="bg-center bg-no-repeat bg-cover aspect-square h-12 w-12 rounded-full"
          style={{ backgroundImage: `url("${teacher.avatar}")` }}
        ></div>
        <div className="flex flex-col justify-center">
          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">{teacher.name}</p>
          <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">{teacher.email}</p>
        </div>
      </div>
    </div>
  );


  const handleTeacherSelected = (teacher: SearchUser) => {
    if (!selectedAssistants.find(t => t.id === teacher.id)) {
      setSelectedTeachers(prevTeachers => [...prevTeachers, teacher]);
    }
    console.log('Teacher selected:', teacher);
  };

  const handleStudentSelected = (student: SearchUser) => {
    if (!selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents(prev => [...prev, student]);
    }
  };

  const handleClassNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClassName(e.target.value);
    if (e.target.value.trim()) {
      setClassNameError(null);
    }
  };

  const handleSubmit = async () => {
    if (!className.trim()) {
      setClassNameError('Tên lớp học là bắt buộc');
      return;
    }

    setIsSubmitting(true);
    try {
      // Tạo lớp học
      const response = await fetch('http://localhost:8080/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: className,
          subjectId: selectedSubjectId,
          tAIds: selectedAssistants.map(ta => ta.id),
          studentIds: selectedStudents.map(student => student.id),
          hidden: !isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      const courseData = await response.json();

      // Nếu có file avatar, cập nhật avatar
      if (selectedFile) {
        try {
          const isAvatarUpdated = await updateCoruseAvatar(courseData.id, selectedFile);
          if (!isAvatarUpdated) {
            toast.warning('Lớp học đã được tạo nhưng không thể cập nhật avatar');
          }
        } catch (error) {
          toast.warning('Lớp học đã được tạo nhưng không thể cập nhật avatar');
        }
      }

      toast.success('Tạo lớp học thành công');
      navigate('/courses');
    } catch (error) {
      toast.error('Không thể tạo lớp học. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden"
        style={{
          '--select-button-svg': "url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724px%27 height=%2724px%27 fill=%27rgb(78,115,151)%27 viewBox=%270 0 256 256%27%3e%3cpath d=%27M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z%27%3e%3c/path%3e%3c/svg%3e')",
          fontFamily: 'Inter, "Noto Sans", sans-serif',
        } as React.CSSProperties} // Ép kiểu để TypeScript chấp nhận biến CSS tùy chỉnh
      >
        <div className="flex h-full grow flex-col">
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col py-5 flex-1">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <div className="flex min-w-72 flex-col gap-3">
                  <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight">Create a class</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-8 p-4">
                {/* Avatar */}
                <div className="md:w-1/3 flex flex-col items-center">
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
                        <p className="text-[#0e141b] text-base font-medium leading-normal mb-1">Class avatar</p>
                        <p className="text-[#4e7397] text-sm font-normal leading-normal">
                          Drag & drop or <span className="text-blue-600 font-semibold">click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
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
                <div className="flex-grow md:w-2/3 flex flex-col gap-4">
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <input
                        placeholder="Class name"
                        className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border ${classNameError ? 'border-red-500' : 'border-[#d0dbe7]'} bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal`}
                        value={className}
                        onChange={handleClassNameChange}
                      />
                      {classNameError && <p className="text-red-500 text-sm mt-1">{classNameError}</p>}
                    </label>
                  </div>
                  <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                    <label className="flex flex-col min-w-40 flex-1">
                      <textarea
                        placeholder="Class description"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] focus:border-[#d0dbe7] min-h-36 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                        defaultValue=""
                      ></textarea>
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
                </div>
              </div>
              <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4 w-fit">Teachers</h3>
              <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-fit"
                    style={{ backgroundImage: `url("${user?.avatar || ''}")` }}
                  ></div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">{user?.name || 'Unknown'}</p>
                    <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">{user?.email || 'No email'}</p>
                  </div>
                </div>
              </div>
              {/* Teacher assistants */}
              <div className="flex flex-row gap-4 items-center">
                <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4 w-fit">
                  Teacher assistants
                </h3>
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
                {selectedAssistants.map((teacher, _) => (
                  <div
                    key={teacher.id}
                    className="w-full sm:w-[calc((100%_-_16px)_/_2)] lg:w-[calc((100%_-_32px)_/_3)] bg-slate-50 px-4 py-2 min-h-[72px] rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="bg-center bg-no-repeat bg-cover aspect-square h-14 w-14 rounded-full"
                        style={{ backgroundImage: `url("${teacher.avatar}")` }}
                      ></div>
                      <div className="flex flex-col justify-center">
                        <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">{teacher.name}</p>
                        <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">{teacher.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTeachers(prev => prev.filter(t => t.id !== teacher.id))} // Nút xóa
                      className="text-[#0e141b] flex items-center justify-center size-7 rounded-md hover:bg-gray-100 active:bg-gray-200 transition shrink-0"
                      aria-label="Remove teacher"
                    >
                      <img src={RemoveIcon} alt="Remove" className="size-5" /> {/* Giả sử bạn có RemoveIcon */}
                    </button>
                  </div>
                ))}
              </div>
              {/* Students */}
              <div className="flex flex-row gap-4 items-center">
                <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4 w-fit">Students</h3>
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
                {selectedStudents.map((student, _) => (
                  <div
                    key={student.id}
                    className="w-full sm:w-[calc((100%_-_16px)_/_2)] lg:w-[calc((100%_-_32px)_/_3)] bg-slate-50 px-4 py-2 min-h-[72px] rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="bg-center bg-no-repeat bg-cover aspect-square h-14 w-14 rounded-full"
                        style={{ backgroundImage: `url("${student.avatar}")` }}
                      ></div>
                      <div className="flex flex-col justify-center">
                        <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">{student.name}</p>
                        <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">{student.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStudents(prev => prev.filter(s => s.id !== student.id))}
                      className="text-[#0e141b] flex items-center justify-center size-7 rounded-md hover:bg-gray-100 active:bg-gray-200 transition shrink-0"
                      aria-label="Remove student"
                    >
                      <img src={RemoveIcon} alt="Remove" className="size-5" />
                    </button>
                  </div>
                ))}
              </div>

              <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Cài đặt</h3>
              <div className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between">
                <div className="flex flex-col justify-center">
                  <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">Công khai</p>
                  <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">Tất cả học sinh đều có thể nhìn thấy lớp học này</p>
                </div>
                <div className="shrink-0">
                  <label
                    className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-[#e7edf3] p-0.5 has-[:checked]:justify-end has-[:checked]:bg-[#1980e6]"
                  >
                    <div className="h-full w-[27px] rounded-full bg-white" style={{ boxShadow: 'rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px' }}></div>
                    <input
                      type="checkbox"
                      className="invisible absolute"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                    />
                  </label>
                </div>
              </div>
              <div className="flex justify-stretch">
                <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-end">
                  <button
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-transparent text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]"
                    onClick={() => navigate("/courses")}
                  >
                    <span className="truncate">Cancel</span>
                  </button>
                  <button
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    <span className="truncate">{isSubmitting ? 'Đang xử lý...' : 'Next'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SearchableDialog<SearchUser>
        isOpen={isTeacherSearchOpen}
        onClose={() => setIsTeacherSearchOpen(false)}
        title="Tìm kiếm giáo viên"
        searchPlaceholder="Nhập email giáo viên (+ enter)"
        onSearch={(email) => searchUserByEmail(email, 1)}
        renderItem={renderTeacherItemDialog}
        onItemSelected={handleTeacherSelected}
        itemContainerClassName="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 overflow-y-auto max-h-[50vh]"
      />
      <SearchableDialog<SearchUser>
        isOpen={isStudentSearchOpen}
        onClose={() => setIsStudentSearchOpen(false)}
        title="Tìm kiếm học sinh"
        searchPlaceholder="Nhập email học sinh (+ enter)"
        onSearch={(email) => searchUserByEmail(email, 0)}
        renderItem={renderTeacherItemDialog}
        onItemSelected={handleStudentSelected}
        itemContainerClassName="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 overflow-y-auto max-h-[50vh]"
      />
    </>
  );
};

export default CreateCoursePage;