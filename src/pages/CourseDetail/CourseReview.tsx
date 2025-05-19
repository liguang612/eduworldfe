import React from 'react';
import { useOutletContext } from 'react-router-dom';
import type { CourseDetailContextType } from '../CourseDetailPage'; // Adjust path

const CourseReviewsPage: React.FC = () => {
  const context = useOutletContext<CourseDetailContextType>();
  const { course, role } = context || {};

  // Placeholder for rating distribution - replace with actual data if available
  const ratingDistribution = [
    { star: 5, percentage: course?.averageRating && course.averageRating >= 4.5 ? '70%' : '20%' },
    { star: 4, percentage: course?.averageRating && course.averageRating >= 3.5 ? '20%' : '15%' },
    { star: 3, percentage: '5%' },
    { star: 2, percentage: '3%' },
    { star: 1, percentage: '2%' },
  ];


  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[#0d141c] mb-4">Đánh giá khóa học</h2>
        {/* Overall Rating Summary */}
        {course && (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-x-8 gap-y-6 mb-6">
            <div className="flex flex-col gap-1 items-center md:items-start">
              <p className="text-[#0e141b] text-4xl font-black leading-tight tracking-[-0.033em]">
                {Number(course.averageRating).toFixed(1)}
              </p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={`star-review-${i}`}
                    className={`text-${i < Math.floor(course.averageRating) ? '[#1980e6]' : '[#aec2d5]'}`}
                    data-icon="Star" data-size="20px" data-weight={i < Math.floor(course.averageRating) ? 'fill' : 'regular'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256"><path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path></svg>
                  </div>
                ))}
              </div>
              <p className="text-[#4e7397] text-sm font-normal leading-normal">({Array.isArray(course.reviewIds) ? course.reviewIds.length : 0} đánh giá)</p>
            </div>
            <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2">
              {ratingDistribution.map(item => (
                <React.Fragment key={item.star}>
                  <p className="text-[#0e141b] text-sm font-normal leading-normal">{item.star} sao</p>
                  <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#d0dbe7]">
                    <div className="rounded-full bg-[#1980e6]" style={{ width: item.percentage }}></div>
                  </div>
                  <p className="text-[#4e7397] text-sm font-normal leading-normal text-right">{item.percentage}</p>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {role === 0 && (
          <button className="mb-6 w-full md:w-auto flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] hover:bg-[#dde3ec] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]">
            <span className="truncate">Viết đánh giá của bạn</span>
          </button>
        )}

        {/* Placeholder for list of reviews */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0d141c]">Tất cả đánh giá</h3>
          {/* Sample Review Item */}
          <div className="p-4 border border-gray-200 rounded-md">
            <div className="flex items-center mb-1">
              <span className="font-semibold text-[#0d141b] mr-2">Nguyễn Văn A</span>
              <span className="text-xs text-gray-500">2 ngày trước</span>
            </div>
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (<div key={i} className={`text-${i < 4 ? '[#1980e6]' : '[#aec2d5]'}`} data-icon="StarFill" data-size="16px"><svg width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256"><path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path></svg></div>))}
            </div>
            <p className="text-sm text-gray-700">Khóa học rất bổ ích và dễ hiểu. Giảng viên nhiệt tình, tài liệu đầy đủ. Tôi đã học được rất nhiều kiến thức mới.</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-md">
            <div className="flex items-center mb-1">
              <span className="font-semibold text-[#0d141b] mr-2">Trần Thị B</span>
              <span className="text-xs text-gray-500">1 tuần trước</span>
            </div>
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (<div key={i} className={`text-${i < 5 ? '[#1980e6]' : '[#aec2d5]'}`} data-icon="StarFill" data-size="16px"><svg width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256"><path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path></svg></div>))}
            </div>
            <p className="text-sm text-gray-700">Rất hài lòng với chất lượng khóa học. Sẽ giới thiệu cho bạn bè.</p>
          </div>
          {/* End Sample Review Item */}
          <div className="flex justify-center pt-4">
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] hover:bg-[#dde3ec] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Xem thêm đánh giá</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseReviewsPage;