import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { CourseDetailContextType } from '../Course/CourseDetailPage';
import { createReview, getReviews, getComments, createComment, getReviewStatistics, type Review, type Comment, type ReviewStatistics } from '@/api/reviewApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import SendIcon from '@/assets/send.svg';
import { baseURL } from '@/config/axios';
import ChevronDownIcon from '@/assets/chevron-down.svg';
import ChevronUpIcon from '@/assets/chevron-up.svg';

const CourseReviewsPage: React.FC = () => {
  const context = useOutletContext<CourseDetailContextType>();
  const { course, role } = context || {};
  const { user } = useAuth();

  const [userRating, setUserRating] = useState<number>(0);
  const [userReviewText, setUserReviewText] = useState<string>('');
  const [submittedReview, setSubmittedReview] = useState<Review | null>(null);
  const [isEditingReview, setIsEditingReview] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (course?.id) {
        try {
          setLoading(true);

          const stats = await getReviewStatistics(1, course.id);
          setStatistics(stats);

          // Fetch first page of reviews
          const reviewsData = await getReviews(1, course.id, 0);
          setReviews(reviewsData.reviews.filter(review => review.userId !== user?.id));
          setCurrentPage(reviewsData.currentPage);
          setTotalPages(reviewsData.totalPages);

          // Find user's own review
          const userReview = reviewsData.reviews.find(review => review.userId === user?.id);
          if (userReview) {
            setSubmittedReview(userReview);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [course?.id, user?.id]);

  const loadMoreReviews = async () => {
    if (currentPage >= totalPages - 1) return;

    try {
      setLoading(true);

      const nextPage = currentPage + 1;
      const reviewsData = await getReviews(1, course!.id, nextPage, 10);

      setReviews(prev => [...prev, ...reviewsData.reviews.filter(review => review.userId !== user?.id)]);
      setCurrentPage(reviewsData.currentPage);
      setTotalPages(reviewsData.totalPages);
    } catch (error) {
      console.error('Error loading more reviews:', error);
      toast.error('Không thể tải thêm đánh giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = async (reviewId: string) => {
    if (!expandedComments[reviewId]) {
      try {
        const reviewComments = await getComments(reviewId);
        setComments(prev => ({
          ...prev,
          [reviewId]: reviewComments
        }));
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Không thể tải bình luận. Vui lòng thử lại.');
        return;
      }
    }
    setExpandedComments(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const handleStarClick = (rating: number) => {
    setUserRating(rating);
  };

  const handleSubmitReview = async () => {
    if (userRating === 0) {
      toast.error('Vui lòng chọn số sao');
      return;
    }
    try {
      console.log(userReviewText);
      return;

      const newReview = await createReview(1, course!.id, userRating, userReviewText);
      const reviewWithUserInfo = {
        ...newReview,
        userName: user?.name || '',
        userAvatar: user?.avatar || '',
        userSchool: user?.school || '',
        userGrade: user?.grade || 0,
        userRole: user?.role
      };
      setSubmittedReview(reviewWithUserInfo);
      setIsEditingReview(false);
      setUserRating(0);
      setUserReviewText('');
      toast.success('Đánh giá thành công!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Không thể gửi đánh giá. Vui lòng thử lại.');
    }
  };

  const handleEditReview = () => {
    if (submittedReview) {
      setUserRating(submittedReview.score);
      setUserReviewText(submittedReview.comment);
      setIsEditingReview(true);
    }
  };

  const handleSubmitComment = async (reviewId: string) => {
    if (!newComment[reviewId]?.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận.');
      return;
    }
    try {
      const comment = await createComment(reviewId, newComment[reviewId]);

      const commentWithUserInfo = {
        ...comment,
        userName: user?.name || '',
        userAvatar: user?.avatar || '',
        userSchool: user?.school || '',
        userGrade: user?.grade || 0,
        userRole: user?.role
      };
      setComments(prev => ({
        ...prev,
        [reviewId]: [...(prev[reviewId] || []), commentWithUserInfo]
      }));
      setNewComment(prev => ({ ...prev, [reviewId]: '' }));
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Không thể gửi bình luận. Vui lòng thử lại.');
    }
  };

  const renderUserRoleChip = (userId?: string) => {
    if (userId === course?.teacher.id) {
      console.log(course);
      return <span className="mx-2 px-2 bg-blue-100 text-blue-800 text-[10px] font-medium rounded-full">Giáo viên</span>;
    } else if (course?.teacherAssistants.some(assistant => assistant.id === userId)) {
      return <span className="mx-2 px-2 bg-green-100 text-green-800 text-[10px] font-medium rounded-full">Trợ giảng</span>;
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[#0d141c] mb-4">Đánh giá khóa học</h2>
        {/* Overall Rating Summary */}
        {course && statistics && (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-x-8 gap-y-6 mb-6">
            <div className="flex flex-col gap-1 items-center md:items-start">
              <p className="text-[#0e141b] text-4xl font-black leading-tight tracking-[-0.033em]">
                {statistics.averageScore.toFixed(1)}
              </p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={`star-review-${i}`}
                    className={`text-${i < Math.floor(statistics.averageScore) ? '[#1980e6]' : '[#aec2d5]'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256"><path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path></svg>
                  </div>
                ))}
              </div>
              <p className="text-[#4e7397] text-sm font-normal leading-normal">({statistics.scoreDistribution[1] + statistics.scoreDistribution[2] + statistics.scoreDistribution[3] + statistics.scoreDistribution[4] + statistics.scoreDistribution[5]} đánh giá)</p>
            </div>
            <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = statistics.scoreDistribution[star] || 0;
                const total = Object.values(statistics.scoreDistribution).reduce((a, b) => a + b, 0);
                const percentage = total ? (count / total * 100).toFixed(0) : 0;
                return (
                  <React.Fragment key={star}>
                    <p className="text-[#0e141b] text-sm font-normal leading-normal">{star}</p>
                    <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#d0dbe7]">
                      <div className="rounded-full bg-[#1980e6]" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <p className="text-[#4e7397] text-sm font-normal leading-normal text-right">{percentage}%</p>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* User's Own Review Section */}
        {role === 0 && (
          <div className="my-6 p-4 border border-gray-200 rounded-md">
            <h3 className="text-lg font-semibold text-[#0d141c] mb-3">Đánh giá của bạn</h3>
            {submittedReview && !isEditingReview ? (
              <div>
                <div className="flex items-center mb-1">
                  <img src={user?.avatar ? `${baseURL}${user?.avatar}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'U')} alt={submittedReview.userName} className="w-8 h-8 rounded-full mr-2" />
                  <span className="font-semibold text-[#0d141b] mr-2">{submittedReview.userName}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(submittedReview.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={`user-submitted-star-${i}`} className={`text-${i < submittedReview.score ? '[#1980e6]' : '[#aec2d5]'}`}>
                      <svg width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256"><path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path></svg>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{submittedReview.comment}</p>
                <button
                  onClick={handleEditReview}
                  className="mt-3 flex min-w-[84px] max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 px-3 bg-[#e7edf3] hover:bg-[#dde3ec] text-[#0e141b] text-xs font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Chỉnh sửa đánh giá</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xếp hạng của bạn:</label>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={`user-star-input-${i}`}
                        onClick={() => handleStarClick(i + 1)}
                        className={`focus:outline-none text-${i < userRating ? '[#1980e6]' : '[#aec2d5]'}`}
                        aria-label={`Rate ${i + 1} star`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path></svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="userReviewText" className="block text-sm font-medium text-gray-700 mb-1">Đánh giá chi tiết:</label>
                  <textarea
                    id="userReviewText"
                    value={userReviewText}
                    onChange={(e) => setUserReviewText(e.target.value)}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#1980e6] focus:border-[#1980e6]"
                    placeholder="Chia sẻ cảm nghĩ của bạn về khóa học..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  {isEditingReview && (
                    <button
                      onClick={() => {
                        setIsEditingReview(false);
                        setUserRating(0);
                        setUserReviewText('');
                      }}
                      className="ml-2 w-full md:w-auto flex min-w-[84px] max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-gray-200 hover:bg-gray-300 text-[#0e141b] text-xs  font-bold leading-normal tracking-[0.015em]"
                    >
                      <span className="truncate">Hủy</span>
                    </button>
                  )}
                  <button
                    onClick={handleSubmitReview}
                    className="w-full md:w-auto flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] hover:bg-[#1368bd] text-white text-xs font-bold leading-normal tracking-[0.015em]"
                  >
                    <span className="truncate">{isEditingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá của bạn'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0d141c]">Tất cả đánh giá</h3>
          {reviews.map((review) => (
            <div key={review.id} className="p-4 border border-gray-200 rounded-md bg-white">
              <div className="flex items-center mb-1 ">
                <img src={`${baseURL}${review.userAvatar}`} alt={review.userName} className="w-8 h-8 rounded-full mr-2" />
                <span className="font-semibold text-[#0d141b] mr-2">{review.userName}</span>
                {renderUserRoleChip(review.userId)}
                <span className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <div key={`review-star-${i}`} className={`text-${i < review.score ? '[#1980e6]' : '[#aec2d5]'}`}>
                    <svg width="16px" height="16px" fill="currentColor" viewBox="0 0 256 256"><path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path></svg>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.comment}</p>

              {/* Comments Section */}
              <div className="mt-4">
                <button
                  onClick={() => toggleComments(review.id)}
                  className="flex items-center text-xs hover:text-[#1368bd]"
                >
                  <span>{expandedComments[review.id] ? 'Ẩn bình luận' : 'Xem bình luận'}</span>
                  <img
                    src={expandedComments[review.id] ? ChevronUpIcon : ChevronDownIcon}
                    alt={expandedComments[review.id] ? 'up' : 'down'}
                    className="w-4 h-4 ml-1"
                  />
                </button>

                {expandedComments[review.id] && (
                  <div className="mt-4 space-y-3">
                    {comments[review.id]?.map((comment) => (
                      <div key={comment.id} className={`pl-4 border-l-2 ${comment.userRole === 1 || comment.userRole === 2 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                        <div className="flex items-center mb-1">
                          <img src={`${baseURL}${comment.userAvatar}`} alt={comment.userName} className="w-6 h-6 rounded-full mr-2" />
                          <span className="font-semibold text-[#0d141b] mr-2">{comment.userName}</span>
                          {renderUserRoleChip(comment.userId)}
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                    {(user?.role === 0 || user?.role === 1 || user?.role === 2) && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment[review.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [review.id]: e.target.value }))}
                          placeholder="Viết bình luận..."
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-[#1980e6] text-sm focus:border-[#1980e6]"
                        />
                        <button
                          onClick={() => handleSubmitComment(review.id)}
                          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-2 hover:bg-slate-50 leading-normal tracking-[0.015em]"
                        >
                          <img src={SendIcon} alt="send" className="w-8 h-8" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {currentPage < totalPages - 1 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMoreReviews}
                disabled={loading}
                className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] hover:bg-[#dde3ec] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]"
              >
                {loading ? 'Đang tải...' : 'Xem thêm'}
              </button>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CourseReviewsPage;