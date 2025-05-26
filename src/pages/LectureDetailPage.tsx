import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLectureById, deleteLecture } from '../api/lectureApi';
import { createReview, getReviews, getComments, createComment, type Review, type Comment } from '../api/reviewApi';
import MyEditor from '../components/Lecture/MyEditor';
import { ConfirmationDialog } from '../components/Common/ConfirmationDialog';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Duration from '@/assets/duration.svg';
import User from '@/assets/user.svg';
import RatingStars from '@/components/Common/RatingStars';
import type { LectureResponse } from '@/api/lectureApi';
import { useAuth } from '@/contexts/AuthContext';

const LectureDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [lecture, setLecture] = useState<LectureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [userReviewText, setUserReviewText] = useState<string>('');
  const [submittedReview, setSubmittedReview] = useState<Review | null>(null);
  const [isEditingReview, setIsEditingReview] = useState<boolean>(false);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        if (id) {
          const data = await getLectureById(id);
          setLecture(data);
          document.title = data.name;
          // Fetch reviews
          const reviewsData = await getReviews(2, id); // 2 is for lecture
          setReviews(reviewsData);
          // Fetch comments for each review
          const commentsData: { [key: string]: Comment[] } = {};
          for (const review of reviewsData) {
            const reviewComments = await getComments(review.id);
            commentsData[review.id] = reviewComments;
          }
          setComments(commentsData);
        }
      } catch (error) {
        console.error('Error fetching lecture:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLecture();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!lecture) {
    return <div>Lecture not found</div>;
  }

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    try {
      await deleteLecture(id);
      toast.success('Xóa bài giảng thành công!');
      navigate('/lectures'); // Navigate back to previous page
    } catch (error) {
      console.error('Error deleting lecture:', error);
      toast.error('Không thể xóa bài giảng. Vui lòng thử lại.');
    } finally {
      closeDeleteDialog();
    }
  };

  const handleStarClick = (rating: number) => {
    setUserRating(rating);
  };

  const handleSubmitReview = async () => {
    if (userRating === 0 || userReviewText.trim() === '') {
      toast.error('Vui lòng chọn số sao và viết nội dung đánh giá.');
      return;
    }
    try {
      const newReview = await createReview(2, id!, userRating, userReviewText);
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

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <h1 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
              {lecture.name}
            </h1>
            <div className="flex flex-row gap-4 px-4">
              <div className="flex flex-row items-center">
                <img src={Duration} alt="Duration" />
                <p className="text-[#4e7397] text-sm font-normal leading-normal px-4">{lecture.duration} min</p>
              </div>
              <div className="flex flex-row items-center">
                <img src={User} alt="User" />
                <p className="text-[#4e7397] text-sm font-normal leading-normal px-4">{lecture.teacher.name}</p>
              </div>
              <div className="flex flex-5" />
              {lecture.teacher.id === user?.id && <div className="flex px-4 py-3 gap-4 justify-start">
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em]"
                  onClick={() => navigate(`/lectures/${id}/edit`)}
                >
                  <span className="truncate">Sửa</span>
                </button>
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e52020] text-[#ffffff] gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em]"
                  onClick={openDeleteDialog}
                >
                  <span className="truncate">Xoá</span>
                </button>
              </div>}
              {user?.role == 0 && <div className="flex py-3 gap-4 justify-start">
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-[#ffffff] gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em]"
                  onClick={() => navigate('end-questions', { state: { lectureName: lecture.name, subjectId: lecture.subjectId, endQuestionIds: lecture.endQuestions } })}
                >
                  <span className="truncate">Câu hỏi ôn tập</span>
                </button>
              </div>}
            </div>
            <p className="text-[#0e141b] text-base font-normal leading-normal pb-3 pt-6 px-4">
              {lecture.description}
            </p>
            <MyEditor initValue={JSON.parse(lecture.contents)} editable={false} />

            <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Đánh giá bài giảng
            </h3>
            <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
              <div className="flex flex-col gap-2">
                <p className="text-[#0e141b] text-4xl font-black leading-tight tracking-[-0.033em]">
                  {(reviews.reduce((acc, review) => acc + review.score, 0) / (reviews.length || 1)).toFixed(1)}
                </p>
                <RatingStars rating={reviews.reduce((acc, review) => acc + review.score, 0) / (reviews.length || 1)} />
                <p className="text-[#0e141b] text-base font-normal leading-normal">{reviews.length} đánh giá</p>
              </div>
              <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter(r => r.score === star).length;
                  const percentage = reviews.length ? (count / reviews.length * 100).toFixed(0) : 0;
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

            {/* User's Review Form */}
            {user?.role === 0 && (
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
                      <RatingStars rating={submittedReview.score} />
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
                        placeholder="Chia sẻ cảm nghĩ của bạn về bài giảng..."
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
                    <RatingStars rating={review.score} />
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
      </div>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        title="Xác nhận xoá bài giảng"
        message="Bạn có chắc chắn muốn xoá bài giảng này? Hành động này không thể hoàn tác."
        onConfirm={handleConfirmDelete}
        confirmButtonText="Xác nhận xoá"
        cancelButtonText="Huỷ"
        confirmButtonColorClass="bg-red-600 hover:bg-red-700"
      />
      <ToastContainer />
    </div>
  );
};

export default LectureDetailPage;