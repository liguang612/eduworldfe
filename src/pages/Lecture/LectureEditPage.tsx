import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MyEditor from '@/components/Lecture/MyEditor';
import type { MyEditorRef } from '@/components/Lecture/MyEditor';
import { uploadFile, getLectureById, updateLecture, searchQuestions } from '@/api/lectureApi';
import { deleteFile } from '@/api/fileApi';
import { getQuestionsDetails, type Question } from '@/api/questionApi';
import type { LectureResponse } from '@/api/lectureApi';
import { toast } from 'react-toastify';
import AddIcon from '@/assets/add.svg';
import { SearchableDialogMulti } from '@/components/Common/SearchableDialogMulti';
import { useAuth } from '@/contexts/AuthContext';
import RemoveIcon from '@/assets/remove.svg';

const LectureEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [lectureName, setLectureName] = useState('');
  const [lectureDescription, setLectureDescription] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<MyEditorRef>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lecture, setLecture] = useState<LectureResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'general' | 'reviewQuestions'>('general');
  const [isReviewQuestionSearchOpen, setIsReviewQuestionSearchOpen] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [selectedReviewQuestions, setSelectedReviewQuestions] = useState<Question[]>([]);

  const { user } = useAuth();

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);

  const [mediaUsageMap, setMediaUsageMap] = useState<Map<string, boolean>>(new Map());

  const collectMediaUrls = (contents: any[]) => {
    const urls = new Map<string, boolean>();

    const processContent = (content: any) => {
      if (content.isUpload && content.url && content.url.startsWith("https://storage.googleapis.com")) {
        urls.set(content.url, false);
      }

      if (content.children && content.children.length > 0) {
        content.children.forEach(processContent);
      }
    };

    contents.forEach(processContent);
    return urls;
  };

  useEffect(() => {
    const fetchLecture = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const data = await getLectureById(id, undefined);
        setLecture(data);

        setLectureName(data.name);
        setLectureDescription(data.description);
        if (editorRef.current) editorRef.current = (data.contents ? JSON.parse(data.contents) : undefined);

        if (data.contents) {
          const contents = JSON.parse(data.contents);
          setMediaUsageMap(collectMediaUrls(contents));
        }

        const totalMinutes = data.duration;
        setDurationHours(Math.floor(totalMinutes / 60));
        setDurationMinutes(totalMinutes % 60);

        if (data.endQuestions && data.endQuestions.length > 0) {
          setIsLoadingQuestions(true);
          try {
            const questionsData = await getQuestionsDetails(data.endQuestions);
            setSelectedReviewQuestions(questionsData);
          } catch (error) {
            console.error('Error fetching questions details:', error);
            toast.error('Không thể tải thông tin câu hỏi ôn tập');
          } finally {
            setIsLoadingQuestions(false);
          }
        }
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
    const newContents = [...contents];

    for (let i = 0; i < newContents.length; i++) {
      let content = { ...newContents[i] };

      if (content.isUpload && content.url.startsWith('blob:')) {
        const response = await fetch(content.url);
        const blob = await response.blob();

        const metadata = blob.type.split('/');
        const fileName = content.name && content.name !== '' ? content.name : `uploaded_file_${Date.now()}.${metadata[1] || 'bin'}`;
        const file = new File([blob], fileName, { type: blob.type });

        setStatusMessage(`Đang tải ${metadata[0] === 'image' ? 'hình ảnh' : metadata[0] === 'video' ? 'video' : metadata[0] === 'audio' ? 'âm thanh' : 'file'}`);
        const fileUrl = await uploadFile(file, metadata[0]);

        content.url = `${fileUrl}`;
        delete content.placeholderId;
      } else if (content.isUpload && content.url && content.url.startsWith("https://storage.googleapis.com")) {
        console.log(content.url);
        mediaUsageMap.set(content.url, true);
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

    if (!editorValue) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const contents = [...editorValue];
      const processedContents = await handleMedia(contents);

      for (const [url, isUsed] of mediaUsageMap.entries()) {
        if (!isUsed) {
          try {
            // Không cần await, xoá lỗi thì thôi
            deleteFile(url);
            console.log(`Deleted unused file: ${url}`);
          } catch (error) {
            console.error(`Failed to delete file ${url}:`, error);
          }
        }
      }

      setStatusMessage('Đang cập nhật bài giảng');
      const lectureData = {
        name: lectureName,
        description: lectureDescription,
        contents: JSON.stringify(processedContents),
        duration: durationHours * 60 + durationMinutes,
        endQuestions: selectedReviewQuestions.map(question => question.id)
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

  const searchQuestionsHandler = async (keyword: string) => {
    if (!user || !lecture) return [];
    const data = await searchQuestions(keyword, lecture.subjectId, user.id);
    return data.map((q: any) => ({ ...q }));
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
            <div className="layout-content-container flex flex-col max-w-[920px] flex-1">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <div className="flex min-w-72 flex-col gap-3">
                  <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight">Chỉnh sửa bài giảng</p>
                </div>
              </div>
              {/* Tab Navigation */}
              <div className="pb-3">
                <div className="flex border-b border-[#d0dbe7] px-4 gap-8">
                  <button
                    onClick={() => setActiveTab('general')}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === 'general' ? 'border-b-[#1980e6] text-[#0e141b]' : 'border-b-transparent text-[#4e7397]'}`}
                  >
                    <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTab === 'general' ? 'text-[#0e141b]' : 'text-[#4e7397]'}`}>
                      Thông tin chung
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab('reviewQuestions')}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === 'reviewQuestions' ? 'border-b-[#1980e6] text-[#0e141b]' : 'border-b-transparent text-[#4e7397]'}`}
                  >
                    <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTab === 'reviewQuestions' ? 'text-[#0e141b]' : 'text-[#4e7397]'}`}>
                      Câu hỏi ôn tập
                    </p>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'general' && (
                <>
                  {/* Existing content of the left pane in LectureEditPage.tsx */}
                  <div className="layout-content-container flex flex-col max-w-[920px]">
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
                          value={lectureName}
                          onChange={(e) => setLectureName(e.target.value)}
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap items-end gap-4 px-4 py-3">
                      <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Mô tả</p>
                        <textarea
                          className="form-input bg-white flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] focus:border-[#d0dbe7] min-h-36 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                          ref={descriptionTextareaRef}
                          value={lectureDescription}
                          onChange={(e) => setLectureDescription(e.target.value)}
                        ></textarea>
                      </label>
                    </div>

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
                  </div>
                </>
              )}

              {activeTab === 'reviewQuestions' && (
                <div className='flex flex-col gap-4 p-4'>
                  <div className='flex flex-row gap-4 items-center'>
                    <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em]">
                      Câu hỏi ôn tập
                    </h3>
                    <button
                      type="button"
                      className="text-[#0e141b] flex items-center justify-center size-7 rounded-md hover:bg-gray-100 active:bg-gray-200 transition"
                      onClick={() => setIsReviewQuestionSearchOpen(true)}
                    >
                      <img src={AddIcon} alt="Add" className='w-4 h-4' />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {isLoadingQuestions ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                          </svg>
                          <span className="text-blue-600">Đang tải câu hỏi...</span>
                        </div>
                      </div>
                    ) : selectedReviewQuestions.length === 0 ? (
                      <p className="text-[#4e7397] text-lg">Chưa có câu hỏi nào được chọn</p>
                    ) : (
                      selectedReviewQuestions.map((question) => (
                        <div key={question.id} className="border rounded-lg p-4 bg-white flex justify-between items-center">
                          <h3 className="font-medium text-[#0e141b] flex-1">{question.title}</h3>
                          <button
                            onClick={() => setSelectedReviewQuestions(prev => prev.filter(q => q.id !== question.id))}
                            className="text-red-500 hover:text-red-700 transition w-8 h-8"
                          >
                            <img src={RemoveIcon} alt="Remove" className='w-5 h-5' />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
      <SearchableDialogMulti<Question>
        isOpen={isReviewQuestionSearchOpen}
        onClose={() => setIsReviewQuestionSearchOpen(false)}
        title="Tìm kiếm câu hỏi ôn tập"
        searchPlaceholder="Nhập từ khóa tìm kiếm câu hỏi (+ enter)"
        onSearch={searchQuestionsHandler}
        renderItem={(question, selected, onToggle) => (
          <div
            key={question.id}
            onClick={() => onToggle(question)}
            className={`cursor-pointer border rounded-lg p-3 mb-2 transition ${selected ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={selected} readOnly className="accent-blue-500" />
              <p className="font-medium text-[#0e141b]">{question.title}</p>
            </div>
          </div>
        )}
        onItemsSelected={(questions) => {
          setSelectedReviewQuestions(prev => {
            const newQuestions = questions.filter(q => !prev.find(p => p.id === q.id));
            return [...prev, ...newQuestions];
          });
        }}
        confirmButtonText="Thêm các câu hỏi đã chọn"
      />
    </>
  );
};

export default LectureEditPage;