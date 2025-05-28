import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExamAttemptsByStatus, startExamAttempt, type ExamAttempt } from '@/api/attemptApi';

interface TabInfo {
  id: string;
  label: string;
}

interface CircularProgressProps {
  percentage: number;
  sqSize?: number;
  strokeWidth?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  sqSize = 60,
  strokeWidth = 6,
}) => {
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * percentage) / 100;

  let progressColor = "text-green-500";
  if (percentage < 50) {
    progressColor = "text-red-500";
  } else if (percentage < 75) {
    progressColor = "text-yellow-500";
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: sqSize, height: sqSize }}>
      <svg width={sqSize} height={sqSize} viewBox={viewBox}>
        <circle
          className="text-gray-300"
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          className={`${progressColor} transition-all duration-300 ease-in-out`}
          cx={sqSize / 2}
          cy={sqSize / 2}
          r={radius}
          strokeWidth={`${strokeWidth}px`}
          transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
            strokeLinecap: 'round',
          }}
          stroke="currentColor"
          fill="transparent"
        />
      </svg>
      <span className={`absolute text-xs font-semibold ${progressColor.replace('text-', 'text-')}`}>
        {`${Math.round(percentage)}%`}
      </span>
    </div>
  );
};

const AttemptListPage: React.FC = () => {
  const navigate = useNavigate();
  const tabs: TabInfo[] = [
    { id: 'in_progress', label: 'Đang diễn ra' },
    { id: 'submitted', label: 'Đã hoàn thành' }
  ];

  const [activeTab, setActiveTab] = useState<string>('submitted');
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getExamAttemptsByStatus(activeTab as 'in_progress' | 'submitted');

        // Sort data by endTime descending, fallback to startTime descending if endTime is null
        const sortedData = data.sort((a, b) => {
          const timeA = a.endTime ? new Date(a.endTime).getTime() : (a.startTime ? new Date(a.startTime).getTime() : 0);
          const timeB = b.endTime ? new Date(b.endTime).getTime() : (b.startTime ? new Date(b.startTime).getTime() : 0);

          if (a.endTime && b.endTime) {
            return timeB - timeA;
          }
          if (a.endTime && !b.endTime) {
            return -1;
          }
          if (!a.endTime && b.endTime) {
            return 1;
          }
          if (a.startTime && b.startTime) {
            return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
          }
          return 0;
        });

        setAttempts(sortedData);
      } catch (err) {
        setError('Có lỗi xảy ra khi tải danh sách bài thi');
        console.error('Error fetching attempts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [activeTab]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(',', ' -');
  };

  const handleViewAttemptDetail = async (attempt: ExamAttempt) => {
    if (activeTab === 'in_progress') {
      navigate(`/courses/${attempt.classId}/exams/${attempt.examId}/do`);
    } else {
      navigate(`/attempt/${attempt.id}`);
    }
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1">
            <div className="flex flex-wrap justify-between items-center gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-2">
                <p className="text-[#0e141b] tracking-light text-2xl sm:text-3xl font-bold leading-tight">
                  Lịch sử làm bài
                </p>
                <p className="text-[#4e7297] text-sm font-normal leading-normal">
                  Xem lại các bài kiểm tra đã thực hiện và kết quả của bạn.
                </p>
              </div>
            </div>
            <div className="pb-3">
              <div className="flex border-b border-[#d0dbe7] px-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 flex-1 focus:outline-none ${activeTab === tab.id
                      ? 'border-b-[#1568c1] text-[#0e141b]'
                      : 'border-b-transparent text-[#4e7297] hover:border-b-gray-300'
                      }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <p
                      className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTab === tab.id ? 'text-[#0e141b]' : 'text-[#4e7297]'
                        }`}
                    >
                      {tab.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 p-2 sm:p-4">
              {loading ? (
                <div className="text-center py-10">
                  <p className="text-slate-500 text-lg">Đang tải...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10">
                  <p className="text-red-500 text-lg">{error}</p>
                </div>
              ) : attempts.length > 0 ? (
                attempts.map((item) => {
                  const percentage = item.maxScore > 0 && (item.score !== null && item.score !== undefined)
                    ? (item.score / item.maxScore) * 100
                    : 0;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleViewAttemptDetail(item)}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 cursor-pointer"
                    >
                      <div className="shrink-0">
                        <CircularProgress percentage={percentage} />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-[#0e141b] text-lg font-semibold leading-tight line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-slate-600 text-sm mt-1">
                          Lớp: <span className="font-medium text-[#1568c1]">{item.className}</span>
                        </p>
                        <div className="text-xs text-slate-500 mt-2 space-y-1">
                          <p>Bắt đầu: {formatDateTime(item.startTime)}</p>
                          {item.endTime && <p>Nộp bài: {formatDateTime(item.endTime)}</p>}
                        </div>
                        {item.score !== null && item.score !== undefined && (
                          <p className="text-sm font-medium text-slate-700 mt-2">
                            Điểm: <span className="font-bold">{item.score}/{item.maxScore}</span>
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 self-center sm:self-auto mt-3 sm:mt-0">
                        <button
                          className="text-[#1568c1] hover:text-blue-700 flex items-center justify-center p-2 rounded-md hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-500 text-lg">Không có bài thi nào trong mục này.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptListPage;