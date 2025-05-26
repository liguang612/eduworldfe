import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { CourseDetailContextType } from '../CourseDetailPage';
import { createReview, getReviews, getComments, createComment, type Review, type Comment } from '@/api/reviewApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

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

  useEffect(() => {
    const fetchReviews = async () => {
      if (course?.id) {
        try {
          const reviewsData = await getReviews(1, course.id);
          console.log(reviewsData);
          setReviews(reviewsData);
          const commentsData: { [key: string]: Comment[] } = {};
          for (const review of reviewsData) {
            const reviewComments = await getComments(review.id);
            commentsData[review.id] = reviewComments;
          }
          setComments(commentsData);
        } catch (error) {
          console.error('Error fetching reviews:', error);
          toast.error('Không thể tải đánh giá. Vui lòng thử lại.');
        }
      }
    };

    fetchReviews();
  }, [course?.id]);

  const handleStarClick = (rating: number) => {
    setUserRating(rating);
  };

  const handleSubmitReview = async () => {
    if (userRating === 0 || userReviewText.trim() === '') {
      toast.error('Vui lòng chọn số sao và viết nội dung đánh giá.');
      return;
    }
    try {
      const newReview = await createReview(1, course!.id, userRating, userReviewText);
      setReviews([newReview, ...reviews]);
      setSubmittedReview(newReview);
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
      setComments(prev => ({
        ...prev,
        [reviewId]: [...(prev[reviewId] || []), comment]
      }));
      setNewComment(prev => ({ ...prev, [reviewId]: '' }));
      toast.success('Bình luận thành công!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Không thể gửi bình luận. Vui lòng thử lại.');
    }
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.score === star).length;
    const percentage = reviews.length ? (count / reviews.length * 100).toFixed(0) : 0;
    return { star, percentage: `${percentage}%` };
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[#0d141c] mb-4">Đánh giá khóa học</h2>
        {/* Overall Rating Summary */}
        {course && (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-x-8 gap-y-6 mb-6">
            <div className="flex flex-col gap-1 items-center md:items-start">
              <p className="text-[#0e141b] text-4xl font-black leading-tight tracking-[-0.033em]">
                {(reviews.reduce((acc, review) => acc + review.score, 0) / (reviews.length || 1)).toFixed(1)}
              </p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={`star-review-${i}`}
                    className={`text-${i < Math.floor(reviews.reduce((acc, review) => acc + review.score, 0) / (reviews.length || 1)) ? '[#1980e6]' : '[#aec2d5]'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256"><path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path></svg>
                  </div>
                ))}
              </div>
              <p className="text-[#4e7397] text-sm font-normal leading-normal">({reviews.length} đánh giá)</p>
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

        {/* User's Own Review Section */}
        {role === 0 && (
          <div className="my-6 p-4 border border-gray-200 rounded-md">
            <h3 className="text-lg font-semibold text-[#0d141c] mb-3">Đánh giá của bạn</h3>
            {submittedReview && !isEditingReview ? (
              <div>
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-[#0d141b] mr-2">Đánh giá của tôi</span>
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
                <button
                  onClick={handleSubmitReview}
                  className="w-full md:w-auto flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] hover:bg-[#1368bd] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">{isEditingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá của bạn'}</span>
                </button>
                {isEditingReview && (
                  <button
                    onClick={() => {
                      setIsEditingReview(false);
                      setUserRating(0);
                      setUserReviewText('');
                    }}
                    className="ml-2 w-full md:w-auto flex min-w-[84px] max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-gray-200 hover:bg-gray-300 text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]"
                  >
                    <span className="truncate">Hủy</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#0d141c]">Tất cả đánh giá</h3>
          {reviews.map((review) => (
            <div key={review.id} className="p-4 border border-gray-200 rounded-md">
              <div className="flex items-center mb-1">
                <span className="font-semibold text-[#0d141b] mr-2">{review.userName}</span>
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
              <div className="mt-4 space-y-3">
                {comments[review.id]?.map((comment) => (
                  <div key={comment.id} className="pl-4 border-l-2 border-gray-200">
                    <div className="flex items-center mb-1">
                      <span className="font-semibold text-[#0d141b] mr-2">{comment.userName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))}
                {user?.role === 0 && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment[review.id] || ''}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [review.id]: e.target.value }))}
                      placeholder="Viết bình luận..."
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-[#1980e6] focus:border-[#1980e6]"
                    />
                    <button
                      onClick={() => handleSubmitComment(review.id)}
                      className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] hover:bg-[#1368bd] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                    >
                      <span className="truncate">Gửi</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseReviewsPage;