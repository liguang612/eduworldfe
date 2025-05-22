import React, { useState } from 'react';

// Định nghĩa kiểu cho các tab để dễ quản lý
interface TabInfo {
  id: string;
  label: string;
}

const AttemptListPage: React.FC = () => {
  const tabs: TabInfo[] = [
    { id: 'completed', label: 'Đã hoàn thành' },
    { id: 'inProgress', label: 'Đang diễn ra' },
    { id: 'upcoming', label: 'Sắp diễn ra' },
  ];

  const [activeTab, setActiveTab] = useState<string>('inProgress'); // Mặc định là 'Đang diễn ra'

  // Dữ liệu mẫu cho các bài kiểm tra (trong ứng dụng thực tế, dữ liệu này sẽ đến từ API hoặc props)
  const examItems = [
    { id: 'exam1', title: 'Exam 1', attemptedDate: 'Attempted on 22nd July 2022, 13:00', iconType: 'CheckCircle' },
    { id: 'exam2', title: 'Exam 2', attemptedDate: 'Attempted on 22nd July 2022, 13:00', iconType: 'CheckCircle' },
    { id: 'exam3', title: 'Exam 3', attemptedDate: 'Attempted on 22nd July 2022, 13:00', iconType: 'CheckCircle' },
    { id: 'exam4', title: 'Exam 4', attemptedDate: 'Attempted on 22nd July 2022, 13:00', iconType: 'CheckCircle' },
    { id: 'exam5', title: 'Exam 5', attemptedDate: 'Attempted on 22nd July 2022, 13:00', iconType: 'CheckCircle' },
  ];

  // Hàm render icon dựa trên loại (ví dụ)
  const renderIcon = (iconType: string) => {
    if (iconType === 'CheckCircle') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
          <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
        </svg>
      );
    }
    return null;
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Header đã được loại bỏ theo yêu cầu */}

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight">
                  Your exam attempts
                </p>
                <p className="text-[#4e7297] text-sm font-normal leading-normal">
                  View your exam attempts and review your answers
                </p>
              </div>
            </div>
            <div className="pb-3">
              <div className="flex border-b border-[#d0dbe7] px-4 justify-between">
                {tabs.map((tab) => (
                  <a
                    key={tab.id}
                    href="#"
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 flex-1 ${activeTab === tab.id
                      ? 'border-b-[#1568c1] text-[#0e141b]'
                      : 'border-b-transparent text-[#4e7297]'
                      }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab(tab.id);
                    }}
                  >
                    <p
                      className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTab === tab.id ? 'text-[#0e141b]' : 'text-[#4e7297]'
                        }`}
                    >
                      {tab.label}
                    </p>
                  </a>
                ))}
              </div>
            </div>

            {/* Nội dung cho các tab sẽ được hiển thị ở đây.
                Hiện tại, chỉ hiển thị tất cả các mục cho mọi tab.
                Bạn có thể lọc các mục dựa trên activeTab.
            */}
            {examItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-12"
                    data-icon={item.iconType} // Giữ lại data-attributes nếu cần
                    data-size="24px"
                    data-weight="regular"
                  >
                    {renderIcon(item.iconType)}
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-[#4e7297] text-sm font-normal leading-normal line-clamp-2">
                      {item.attemptedDate}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <div
                    className="text-[#0e141b] flex size-7 items-center justify-center"
                    data-icon="CaretRight"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptListPage;