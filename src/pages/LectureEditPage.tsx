import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MyEditor from '../components/Lecture/MyEditor';
import type { MyEditorRef } from '../components/Lecture/MyEditor';
import { uploadFile, getLectureById, updateLecture } from '../api/lectureApi';
import type { LectureResponse } from '../api/lectureApi';
import { toast, ToastContainer } from 'react-toastify';
import { baseURL } from '@/config/axios';

const LectureEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<MyEditorRef>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lecture, setLecture] = useState<LectureResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);

  useEffect(() => {
    const fetchLecture = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await getLectureById(id);
        setLecture(data);

        // Set form values
        if (nameInputRef.current) nameInputRef.current.value = data.name;
        if (descriptionTextareaRef.current) descriptionTextareaRef.current.value = data.description;
        if (editorRef.current) editorRef.current = (data.contents ? JSON.parse(data.contents) : undefined);

        // Set duration
        const totalMinutes = data.duration;
        setDurationHours(Math.floor(totalMinutes / 60));
        setDurationMinutes(totalMinutes % 60);
      } catch (error) {
        console.error('Error fetching lecture:', error);
        toast.error('Không thể tải thông tin bài giảng');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLecture();
  }, [id]);

  const handleHoursChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDurationHours(parseInt(event.target.value));
  };

  const handleMinutesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDurationMinutes(parseInt(event.target.value));
  };

  const handleMedia = async (contents: any[]) => {
    const newContents = [...contents]; // Create a new array copy

    for (let i = 0; i < newContents.length; i++) {
      let content = { ...newContents[i] }; // Create a new object copy

      if (content.isUpload && content.url.startsWith('blob:')) {
        const response = await fetch(content.url);
        const blob = await response.blob();

        const metadata = blob.type.split('/');
        const fileName = content.name && content.name !== '' ? content.name : `uploaded_file_${Date.now()}.${metadata[1] || 'bin'}`;
        const file = new File([blob], fileName, { type: blob.type });

        setStatusMessage(`Đang tải ${metadata[0] === 'image' ? 'hình ảnh' : metadata[0] === 'video' ? 'video' : metadata[0] === 'audio' ? 'âm thanh' : 'file'}`);
        const fileUrl = await uploadFile(file, metadata[0]);

        content.url = `${baseURL}${fileUrl}`;
        delete content.placeholderId;
      }

      if (content.children && content.children.length > 0) {
        content.children = await handleMedia(content.children);
      }

      newContents[i] = content;
    }

    return newContents;
  };

  const handleSave = async () => {
    const editorValue = editorRef.current?.getValue();
    console.log(editorValue);

    if (!editorValue) return;

    const lectureName = nameInputRef.current?.value || '';
    const lectureDescription = descriptionTextareaRef.current?.value || '';

    setLoading(true);
    setStatusMessage(null);

    try {
      const contents = [...editorValue];
      const processedContents = await handleMedia(contents);

      setStatusMessage('Đang cập nhật bài giảng');
      const lectureData = {
        name: lectureName,
        description: lectureDescription,
        contents: JSON.stringify(processedContents),
        duration: durationHours * 60 + durationMinutes
      };

      await updateLecture(id!, lectureData);
      toast.success('Sửa bài giảng thành công');
      setLoading(false);
      setStatusMessage(null);
      navigate(`/lectures/${id}`);
    } catch (error) {
      console.error('Error saving lecture:', error);
      setLoading(false);
      setStatusMessage(null);
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau.');
      toast.warning('Bạn có thể export bài giảng dưới dạng HTML (khuyến nghị) hoặc Markdown để import lại sau.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="text-blue-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
        style={{
          "--select-button-svg-black": "url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2720%27 height=%2720%27 fill=%27none%27%3e%3cpath d=%27M6 8l4 4 4-4%27 stroke=%27%230e141b%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3e%3c/svg%3e')",
          fontFamily: 'Inter, "Noto Sans", sans-serif',
        } as React.CSSProperties}
      >
        <div className="layout-container flex h-full grow flex-col">
          <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            {/* Left Column: Form */}
            <div className="layout-content-container flex flex-col max-w-[920px] flex-1">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <div className="flex min-w-72 flex-col gap-3">
                  <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight">Chỉnh sửa bài giảng</p>
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Tên bài giảng</p>
                  <input
                    className="form-input bg-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                    ref={nameInputRef}
                    defaultValue={lecture?.name}
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Mô tả</p>
                  <textarea
                    className="form-input bg-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] focus:border-[#d0dbe7] min-h-36 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                    ref={descriptionTextareaRef}
                    defaultValue={lecture?.description}
                  ></textarea>
                </label>
              </div>

              {/* Grade, Subject, and Duration Selectors Row */}
              <div className="flex flex-wrap items-end gap-4 px-4 py-3 justify-end">
                <div className="flex items-center gap-2">
                  <p className="text-[#0e141b] text-sm font-bold leading-normal whitespace-nowrap"><b>Thời lượng:</b></p>
                  <div className="flex items-center">
                    <label htmlFor="duration-hours" className="sr-only">Giờ</label>
                    <select
                      id="duration-hours"
                      name="durationHours"
                      value={durationHours}
                      onChange={handleHoursChange}
                      className="appearance-none cursor-pointer bg-transparent border-none text-[#0e141b] text-sm font-medium focus:outline-none focus:ring-0 p-0 pr-5 bg-[image:var(--select-button-svg-black)] bg-no-repeat bg-right center leading-tight"
                    >
                      {hourOptions.map((hour) => (
                        <option key={hour} value={hour}>
                          {String(hour).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <span className="text-[#0e141b] text-sm font-medium mx-1">giờ</span>
                  </div>
                  <div className="flex items-center">
                    <label htmlFor="duration-minutes" className="sr-only">Phút</label>
                    <select
                      id="duration-minutes"
                      name="durationMinutes"
                      value={durationMinutes}
                      onChange={handleMinutesChange}
                      className="appearance-none cursor-pointer bg-transparent border-none text-[#0e141b] text-sm font-medium focus:outline-none focus:ring-0 p-0 pr-5 bg-[image:var(--select-button-svg-black)] bg-no-repeat bg-right center leading-tight"
                    >
                      {minuteOptions.map((minute) => (
                        <option key={minute} value={minute}>
                          {String(minute).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <span className="text-[#0e141b] text-sm font-medium ml-1">phút</span>
                  </div>
                </div>
              </div>

              <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] p-4">
                Câu hỏi ôn tập
              </h3>

              <div className="flex px-4 py-3 flex-col items-end gap-2">
                {statusMessage && (
                  <div className="text-sm text-blue-600 font-medium mb-2 w-full text-right">{statusMessage}</div>
                )}
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Đang xử lý...</span>
                  ) : (
                    <span className="truncate">Sửa</span>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Plate.js Editor */}
            <div className="layout-content-container flex flex-col flex-2 min-w-[400px] ml-6 max-h-[calc(70%)]">
              <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] pb-4 pt-4">
                Nội dung
              </h3>
              <div className='max-h-[calc(70%)]'>
                {lecture && (
                  <MyEditor
                    ref={editorRef}
                    initValue={lecture.contents ? JSON.parse(lecture.contents) : undefined}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default LectureEditPage;