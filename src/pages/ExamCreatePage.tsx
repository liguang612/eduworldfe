import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// SVG Icons (Giữ nguyên như trước)
const LogoIcon: React.FC = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-7 text-[#0d7cf2]">
    <path
      d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
      fill="currentColor"
    ></path>
  </svg>
);

const BellIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
  </svg>
);

const TableIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM40,112H80v32H40Zm56,0H216v32H96ZM216,64V96H40V64ZM40,160H80v32H40Zm176,32H96V160H216v32Z"></path>
  </svg>
);

// Cập nhật interface ExamFormData
interface ExamFormData {
  examName: string;
  numQuestions: string;
  pointsPerQuestion: string;
  enableOpenDateTime: boolean; // NEU
  openDateTime: string;
  enableCloseDateTime: boolean; // NEU
  closeDateTime: string;
  duration: string; // Sẽ là number input
  revealAnswers: boolean;
  setTimeLimit: boolean;
  shuffleQuestions: boolean;
  allowAnyDevice: boolean;
  allowSeeAnswers: boolean;
  allowReviewAfterSubmit: boolean;
}

// Kiểu cho activeTab
type ActiveTabType = 'general' | 'other' | 'questionBank';


const ExamCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId?: string }>();

  const [activeTab, setActiveTab] = useState<ActiveTabType>('general'); // Cập nhật kiểu
  const [formData, setFormData] = useState<ExamFormData>({
    examName: '',
    numQuestions: '',
    pointsPerQuestion: '',
    enableOpenDateTime: true, // Mặc định bật
    openDateTime: '',
    enableCloseDateTime: true, // Mặc định bật
    closeDateTime: '',
    duration: '45', // Ví dụ giá trị mặc định là 45 phút
    revealAnswers: true,
    setTimeLimit: true,
    shuffleQuestions: false,
    allowAnyDevice: true,
    allowSeeAnswers: true,
    allowReviewAfterSubmit: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Cập nhật setTimeLimit dựa trên việc duration có giá trị hay không
  // và enableOpen/CloseDateTime dựa trên switch của chúng
  useEffect(() => {
    setFormData(prev => {
      const newSetTimeLimit = !!prev.duration && prev.duration !== "0" && prev.duration !== "";
      let newOpenDateTime = prev.openDateTime;
      let newCloseDateTime = prev.closeDateTime;

      if (!prev.enableOpenDateTime) {
        newOpenDateTime = ''; // Xóa giá trị nếu switch tắt
      }
      if (!prev.enableCloseDateTime) {
        newCloseDateTime = ''; // Xóa giá trị nếu switch tắt
      }

      return {
        ...prev,
        setTimeLimit: newSetTimeLimit,
        openDateTime: newOpenDateTime,
        closeDateTime: newCloseDateTime,
      };
    });
  }, [formData.duration, formData.enableOpenDateTime, formData.enableCloseDateTime]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate openDateTime and closeDateTime if they are enabled
    if (formData.enableOpenDateTime && !formData.openDateTime) {
      alert('Vui lòng nhập thời gian mở đề hoặc tắt tùy chọn này.');
      return;
    }
    if (formData.enableCloseDateTime && !formData.closeDateTime) {
      alert('Vui lòng nhập thời gian đóng đề hoặc tắt tùy chọn này.');
      return;
    }
    if (formData.enableOpenDateTime && formData.enableCloseDateTime && formData.openDateTime && formData.closeDateTime && new Date(formData.openDateTime) >= new Date(formData.closeDateTime)) {
      alert('Thời gian đóng đề phải sau thời gian mở đề.');
      return;
    }

    const submissionData = {
      ...formData,
      courseId: courseId,
      numQuestions: parseInt(formData.numQuestions) || 0,
      pointsPerQuestion: parseFloat(formData.pointsPerQuestion) || 0,
      duration: parseInt(formData.duration) || 0,
      // Chỉ gửi openDateTime và closeDateTime nếu chúng được bật
      openDateTime: formData.enableOpenDateTime ? formData.openDateTime : undefined,
      closeDateTime: formData.enableCloseDateTime ? formData.closeDateTime : undefined,
    };
    console.log('Exam Data Submitted:', submissionData);
    alert('Đề thi đã được tạo (xem console để biết chi tiết)!');
    // if (courseId) {
    //   navigate(`/courses/${courseId}/exams`);
    // }
  };

  const handleCancel = () => {
    if (courseId) {
      navigate(`/courses/${courseId}/exams`);
    } else {
      navigate(-1);
    }
  };

  // Helper function to render a toggle switch item directly
  const renderToggleSwitch = (
    id: keyof ExamFormData,
    label: string,
    description: string
  ) => (
    <div className="flex items-center justify-between gap-4 bg-slate-100/50 dark:bg-slate-800/30 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[72px]">
      <div className="flex flex-col justify-center flex-grow">
        <p className="text-[#0d141c] dark:text-slate-100 text-base font-medium leading-normal line-clamp-1">
          {label}
        </p>
        <p className="text-[#49719c] dark:text-slate-400 text-sm font-normal leading-normal line-clamp-2">
          {description}
        </p>
      </div>
      <div className="shrink-0">
        <label
          htmlFor={id as string}
          className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out
            ${formData[id] ? 'bg-[#0d7cf2] justify-end' : 'bg-[#cbd5e1] dark:bg-slate-600 justify-start'}`}
        >
          <span
            className={`block h-[27px] w-[27px] rounded-full bg-white dark:bg-slate-300 transition-transform duration-200 ease-in-out shadow-md`}
            style={{ boxShadow: 'rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px' }}
          />
          <input
            type="checkbox"
            id={id as string}
            name={id as string}
            checked={!!formData[id]}
            onChange={handleInputChange}
            className="invisible absolute opacity-0 w-0 h-0"
          />
        </label>
      </div>
    </div>
  );

  // Helper function for the small switches next to date inputs
  const renderInlineToggle = (id: keyof ExamFormData, name: string) => (
    <label
      htmlFor={name} // Sử dụng name cho id của input để tránh trùng lặp
      className={`relative flex h-[28px] w-[48px] cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out
        ${formData[id] ? 'bg-[#0d7cf2] justify-end' : 'bg-[#cbd5e1] dark:bg-slate-600 justify-start'}`}
    >
      <span
        className={`block h-[24px] w-[24px] rounded-full bg-white dark:bg-slate-300 transition-transform duration-200 ease-in-out shadow-sm`}
      />
      <input
        type="checkbox"
        id={name} // ID cho input
        name={name} // Name để handleInputChange nhận diện
        checked={!!formData[id]}
        onChange={handleInputChange}
        className="invisible absolute opacity-0 w-0 h-0"
      />
    </label>
  );


  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden items-center"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      <main className="px-4 sm:px-6 md:px-10 lg:px-40 flex flex-1 justify-center py-5 w-[calc(85%)]">
        <form onSubmit={handleSubmit} className="layout-content-container flex flex-col md:w-[600px] lg:w-[768px] py-5 gap-6 flex-1 space-y-3">
          <div className="p-4">
            <div className="flex min-w-72 flex-col gap-1">
              <h1 className="text-[#0d141c] dark:text-slate-100 text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Tạo đề thi mới</h1>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg">
            <div className="pb-1 pt-2">
              <div className="flex border-b border-[#cedbe8] dark:border-slate-700 px-4 gap-4 sm:gap-8 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className={`flex-shrink-0 flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-3 transition-colors ${activeTab === 'general' ? 'border-b-[#0d7cf2] text-[#0d141c] dark:text-slate-100' : 'border-b-transparent text-[#49719c] dark:text-slate-400 hover:border-b-slate-300 dark:hover:border-b-slate-600'
                    }`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Thông tin chung</p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('questionBank')}
                  className={`flex-shrink-0 flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-3 transition-colors ${activeTab === 'questionBank' ? 'border-b-[#0d7cf2] text-[#0d141c] dark:text-slate-100' : 'border-b-transparent text-[#49719c] dark:text-slate-400 hover:border-b-slate-300 dark:hover:border-b-slate-600'
                    }`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Kho câu hỏi</p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('other')}
                  className={`flex-shrink-0 flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-3 transition-colors ${activeTab === 'other' ? 'border-b-[#0d7cf2] text-[#0d141c] dark:text-slate-100' : 'border-b-transparent text-[#49719c] dark:text-slate-400 hover:border-b-slate-300 dark:hover:border-b-slate-600'
                    }`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Cài đặt khác</p>
                </button>
              </div>
            </div>

            {/* General */}
            {activeTab === 'general' && (
              <div className="p-4 space-y-5">
                <div className="flex flex-row gap-4 items-start overflow-x-auto">
                  <div className="flex-1">
                    <label htmlFor="examName" className="text-[#0d141c] dark:text-slate-200 text-base font-medium leading-normal pb-2 block">Tên đề thi</label>
                    <input
                      id="examName"
                      name="examName"
                      type="text"
                      placeholder="Nhập tên đề thi"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141c] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:border-transparent border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 h-12 placeholder:text-[#6b7f99] dark:placeholder:text-slate-400 p-3 text-base font-normal leading-normal"
                      value={formData.examName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="duration" className="text-[#0d141c] dark:text-slate-200 text-base font-medium leading-normal pb-2 block">Thời gian làm bài (phút)</label>
                    <input
                      id="duration"
                      name="duration"
                      type="number"
                      placeholder="Nhập số phút"
                      min="0" // Cho phép 0 nếu không giới hạn thời gian (khi setTimeLimit false)
                      step="5"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141c] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:border-transparent border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 h-12 placeholder:text-[#6b7f99] dark:placeholder:text-slate-400 p-3 text-base font-normal leading-normal"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required // Duration is usually required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="flex-1">
                    <label htmlFor="numQuestions" className="text-[#0d141c] dark:text-slate-200 text-base font-medium leading-normal pb-2 block">Số lượng câu hỏi</label>
                    <input
                      id="numQuestions"
                      name="numQuestions"
                      type="number"
                      placeholder="Nhập số lượng"
                      min="1"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141c] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:border-transparent border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 h-12 placeholder:text-[#6b7f99] dark:placeholder:text-slate-400 p-3 text-base font-normal leading-normal"
                      value={formData.numQuestions}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="pointsPerQuestion" className="text-[#0d141c] dark:text-slate-200 text-base font-medium leading-normal pb-2 block">Điểm mỗi câu</label>
                    <input
                      id="pointsPerQuestion"
                      name="pointsPerQuestion"
                      type="number"
                      placeholder="Nhập điểm"
                      min="0.1"
                      step="0.1"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141c] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:border-transparent border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 h-12 placeholder:text-[#6b7f99] dark:placeholder:text-slate-400 p-3 text-base font-normal leading-normal"
                      value={formData.pointsPerQuestion}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="openDateTime" className="text-[#0d141c] dark:text-slate-200 text-base font-medium leading-normal">Thời gian mở đề</label>
                      {renderInlineToggle('enableOpenDateTime', 'enableOpenDateTime')}
                    </div>
                    <input
                      id="openDateTime"
                      name="openDateTime"
                      type="datetime-local"
                      className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141c] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:border-transparent border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 h-12 placeholder:text-[#6b7f99] dark:placeholder:text-slate-400 p-3 text-base font-normal leading-normal ${!formData.enableOpenDateTime ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={formData.openDateTime}
                      onChange={handleInputChange}
                      disabled={!formData.enableOpenDateTime}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="closeDateTime" className="text-[#0d141c] dark:text-slate-200 text-base font-medium leading-normal">Thời gian đóng đề</label>
                      {renderInlineToggle('enableCloseDateTime', 'enableCloseDateTime')}
                    </div>
                    <input
                      id="closeDateTime"
                      name="closeDateTime"
                      type="datetime-local"
                      className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141c] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:border-transparent border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 h-12 placeholder:text-[#6b7f99] dark:placeholder:text-slate-400 p-3 text-base font-normal leading-normal ${!formData.enableCloseDateTime ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={formData.closeDateTime}
                      onChange={handleInputChange}
                      disabled={!formData.enableCloseDateTime}
                    />
                  </div>
                </div>


              </div>
            )}

            {/* Question Bank */}
            {activeTab === 'questionBank' && (
              <div className="p-4 space-y-4">
                <h3 className="text-[#0d141c] dark:text-slate-200 text-lg font-semibold leading-tight tracking-[-0.015em] pb-2">
                  Kho câu hỏi
                </h3>
                <div className="p-6 text-center bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <p className="text-[#49719c] dark:text-slate-400">
                    Nội dung quản lý và chọn câu hỏi từ kho sẽ được hiển thị ở đây.
                  </p>
                  <p className="mt-2 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md text-sm">
                    Tính năng này đang được phát triển.
                  </p>
                </div>
              </div>
            )}

            {/* Other Settings */}
            {activeTab === 'other' && (
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-[#0d141c] dark:text-slate-200 text-lg font-semibold leading-tight tracking-[-0.015em] pb-2">Cài đặt chung</h3>
                  <div className="space-y-3">
                    {renderToggleSwitch(
                      'revealAnswers',
                      'Tiết lộ đáp án và phản hồi',
                      'Học viên sẽ có thể xem đáp án đúng và phản hồi (nếu có).'
                    )}
                    {renderToggleSwitch(
                      'shuffleQuestions',
                      'Trộn câu hỏi và lựa chọn',
                      'Thứ tự câu hỏi và các lựa chọn (nếu có) sẽ được xáo trộn ngẫu nhiên.'
                    )}
                    {renderToggleSwitch(
                      'allowAnyDevice',
                      'Cho phép làm bài trên mọi thiết bị',
                      'Học viên có thể làm bài thi trên máy tính, máy tính bảng hoặc điện thoại.'
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-[#0d141c] dark:text-slate-200 text-lg font-semibold leading-tight tracking-[-0.015em] pb-2 pt-4">Tùy chọn xem lại</h3>
                  <div className="space-y-3">
                    {renderToggleSwitch(
                      'allowSeeAnswers',
                      'Cho phép học viên xem lại câu trả lời của họ',
                      'Học viên có thể xem lại các câu trả lời họ đã chọn sau khi nộp bài.'
                    )}
                    {renderToggleSwitch(
                      'allowReviewAfterSubmit',
                      'Cho phép học viên xem lại bài thi sau khi nộp',
                      'Học viên có thể mở lại và xem toàn bộ bài thi sau khi đã nộp.'
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 px-4 py-6 sticky bottom-0 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleCancel}
              className="flex w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-6 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-[#0d141c] dark:text-slate-100 text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
            >
              <span className="truncate">Huỷ</span>
            </button>
            <button
              type="submit"
              className="flex w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-6 bg-[#0d7cf2] hover:bg-[#0b68d1] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
            >
              <span className="truncate">Tạo đề thi</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ExamCreatePage;