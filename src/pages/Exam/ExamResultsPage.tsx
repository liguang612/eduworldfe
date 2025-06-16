import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamAttemptsByExamId, type ExamAttemptResult } from '@/api/examApi';
import { CircularProgress } from '../../components/Common/CircularProgress';
import { useAuth } from '@/contexts/AuthContext';

const ExamResultsPage: React.FC = () => {
  const { examId } = useParams<{ courseId: string; examId: string }>();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<ExamAttemptResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!examId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getExamAttemptsByExamId(examId);

        // Sort data by endTime descending
        const sortedData = data.sort((a, b) => {
          const timeA = a.endTime ? new Date(a.endTime).getTime() : 0;
          const timeB = b.endTime ? new Date(b.endTime).getTime() : 0;
          return timeB - timeA;
        });

        setAttempts(sortedData);
      } catch (err) {
        setError('Có lỗi xảy ra khi tải danh sách bài làm');
        console.error('Error fetching attempts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [examId]);

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

  const handleViewAttemptDetail = (attemptId: string) => {
    navigate(`/attempt/${attemptId}`);
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1">
            <div className="flex flex-wrap justify-between items-center gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-2">
                <p className="text-[#0e141b] tracking-light text-2xl sm:text-3xl font-bold leading-tight">
                  Kết quả bài thi
                </p>
                <p className="text-[#4e7297] text-sm font-normal leading-normal">
                  {user?.role === 1 ? "Xem kết quả của tất cả học sinh đã làm bài thi này." : "Xem kết quả của bạn trong bài thi này."}
                </p>
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
                  const percentage = (item.score / item.maxScore) * 100;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleViewAttemptDetail(item.id)}
                      className="flex items-center gap-4 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 cursor-pointer"
                    >
                      <div className="shrink-0">
                        <img
                          src={`${item.studentAvatar}`}
                          alt={item.studentName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[#0e141b] text-lg font-semibold leading-tight">
                            {item.studentName}
                          </h3>
                          <span className="text-sm text-slate-500">
                            Lớp {item.studentGrade}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mt-1">
                          {item.studentSchool}
                        </p>
                        <div className="text-xs text-slate-500 mt-2 space-y-1">
                          <p>Bắt đầu: {formatDateTime(item.startTime)}</p>
                          {item.endTime && <p>Nộp bài: {formatDateTime(item.endTime)}</p>}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-700">
                            Điểm: <span className="font-bold">{item.score}/{item.maxScore}</span>
                          </p>
                        </div>
                        <CircularProgress percentage={percentage} sqSize={48} strokeWidth={4} />
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
                  <p className="text-slate-500 text-lg">{user?.role === 1 ? "Chưa có học sinh nào làm bài thi này." : "Bạn chưa làm bài thi này."}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamResultsPage;

