import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getLectureById, deleteLecture } from '@/api/lectureApi';
import { createReview, getReviews, getComments, createComment, getReviewStatistics, type Review, type Comment, type ReviewStatistics } from '@/api/reviewApi';
import MyEditor from '@/components/Lecture/MyEditor';
import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Duration from '@/assets/duration.svg';
import UserIcon from '@/assets/user.svg';
import RatingStars from '@/components/Common/RatingStars';
import type { LectureResponse } from '@/api/lectureApi';
import { useAuth } from '@/contexts/AuthContext';
import SendIcon from '@/assets/send.svg';
import ChevronDownIcon from '@/assets/chevron-down.svg';
import ChevronUpIcon from '@/assets/chevron-up.svg';
import ProfileDialog from '@/components/Auth/UserInformationPopup';
import type { User } from '@/contexts/AuthContext';
import LoveIcon from '@/assets/love.svg';
import LoveFillIcon from '@/assets/love_fill.svg';
import { addFavorite, removeFavorite } from '@/api/favouriteApi';
import { deleteFile } from '@/api/fileApi';

const LectureDetailPage: React.FC = () => {
  const location = useLocation();
  const courseId = location.state?.courseId;
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

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
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // State for user information popup
  const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleTeacherClick = () => {
    if (lecture?.teacher) {
      setSelectedUser(lecture.teacher);
      setIsUserPopupOpen(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          setLoading(true);

          const data = await getLectureById(id, courseId);
          setLecture(data);
          document.title = data.name;
          setIsFavorited(data.favourite);

          // Fetch statistics
          const stats = await getReviewStatistics(2, id);
          setStatistics(stats);

          const reviewsData = await getReviews(2, id, 0, 10);
          setReviews(reviewsData.reviews);
          setCurrentPage(reviewsData.currentPage);
          setTotalPages(reviewsData.totalPages);

          const userReview = reviewsData.reviews.find(review => review.userId === user?.id);
          if (userReview) {
            setSubmittedReview(userReview);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user?.id]);

  const loadMoreReviews = async () => {
    if (currentPage >= totalPages - 1) return;

    try {
      setLoadingReviews(true);
      const nextPage = currentPage + 1;
      const reviewsData = await getReviews(2, id!, nextPage, 10);
      setReviews(prev => [...prev, ...reviewsData.reviews]);
      setCurrentPage(reviewsData.currentPage);
      setTotalPages(reviewsData.totalPages);
    } catch (error) {
      console.error('Error loading more reviews:', error);
      toast.error('Không thể tải thêm đánh giá. Vui lòng thử lại.');
    } finally {
      setLoadingReviews(false);
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
    if (!id || !lecture) return;

    try {
      // Collect media URLs from lecture content
      const mediaUrls = collectMediaUrls(JSON.parse(lecture.contents));

      // Delete each media file
      for (const url of mediaUrls) {
        try {
          deleteFile(url);
          console.log(`Deleted file: ${url}`);
        } catch (error) {
          console.error(`Failed to delete file ${url}:`, error);
        }
      }

      // Delete the lecture
      await deleteLecture(id);
      toast.success('Xóa bài giảng thành công!');
      navigate('/lectures');
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
      toast.success('Bình luận thành công!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Không thể gửi bình luận. Vui lòng thử lại.');
    }
  };

  const renderUserRoleChip = (userRole?: number) => {
    if (userRole === 1) {
      return <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Giáo viên</span>;
    } else if (userRole === 2) {
      return <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Trợ giảng</span>;
    }
    return null;
  };

  const changeFavorited = async () => {
    try {
      if (!id) {
        console.error('Lecture ID is missing.');
        toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
        return;
      }

      await (isFavorited ? removeFavorite : addFavorite)(id, 2);

      setIsFavorited(!isFavorited);
      toast.success(isFavorited ? 'Đã bỏ yêu thích bài giảng' : 'Đã thêm vào danh sách yêu thích bài giảng');
    } catch (error) {
      console.error('Error adding/removing favorite:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const collectMediaUrls = (contents: any[]) => {
    const urls: string[] = [];

    const processContent = (content: any) => {
      if (content.isUpload && content.url && content.url.startsWith("https://storage.googleapis.com")) {
        urls.push(content.url);
      }

      if (content.children && content.children.length > 0) {
        content.children.forEach(processContent);
      }
    };

    contents.forEach(processContent);
    return urls;
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
              <div
                className="flex flex-row items-center cursor-pointer"
                onClick={handleTeacherClick}
              >
                <img src={UserIcon} alt="User" />
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
              {user?.role === 0 && (
                <div className="flex py-3 justify-start">
                  <div
                    className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-white border border-[#d0dbe7]"
                    onClick={changeFavorited}
                  >
                    {isFavorited ? (
                      <img src={LoveFillIcon} alt="Favorited" className="w-5 h-5 text-red-500" />
                    ) : (
                      <img src={LoveIcon} alt="Not Favorited" className="w-5 h-5" />
                    )}
                  </div>
                </div>
              )}
              {user?.role == 0 && <div className="flex py-3 gap-4 justify-start">
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-[#ffffff] gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em]"
                  onClick={() => navigate('end-questions', { state: { lectureName: lecture.name, subjectId: lecture.subjectId, endQuestionIds: lecture.endQuestions } })}
                >
                  <span className="truncate">Câu hỏi ôn tập</span>
                </button>
              </div>}
            </div>
            <p className="text-[#0e141b] text-base font-normal leading-normal pb-3 pt-6 px-4" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              {lecture.description}
            </p>
            <MyEditor initValue={JSON.parse(lecture.contents)} editable={false} />

            <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Đánh giá bài giảng
            </h3>
            <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
              {statistics && (
                <>
                  <div className="flex flex-col gap-2">
                    <p className="text-[#0e141b] text-4xl font-black leading-tight tracking-[-0.033em]">
                      {statistics.averageScore.toFixed(1)}
                    </p>
                    <RatingStars rating={statistics.averageScore} />
                    <p className="text-[#0e141b] text-base font-normal leading-normal">
                      {Object.values(statistics.scoreDistribution).reduce((a, b) => a + b, 0)} đánh giá
                    </p>
                  </div>
                  <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
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
                </>
              )}
            </div>

            {/* User's Review Form */}
            {user?.role === 0 && (
              <div className="my-6 p-4 border border-gray-200 rounded-md">
                <h3 className="text-lg font-semibold text-[#0d141c] mb-3">Đánh giá của bạn</h3>
                {submittedReview && !isEditingReview ? (
                  <div>
                    <div className="flex items-center mb-1">
                      <img src={user?.avatar ? user?.avatar : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'U')} alt={submittedReview.userName} className="w-8 h-8 rounded-full mr-2" />
                      <span className="font-semibold text-[#0d141b] mr-2">{submittedReview.userName}</span>
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
                <div key={review.id} className="p-4 border border-gray-200 rounded-md bg-white">
                  <div className="flex items-center mb-1">
                    <img src={`${review.userAvatar}`} alt={review.userName} className="w-8 h-8 rounded-full mr-2" />
                    <span className="font-semibold text-[#0d141b] mr-2">{review.userName}</span>
                    {renderUserRoleChip(review.userRole)}
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    <RatingStars rating={review.score} />
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.comment}</p>

                  {/* Comments Section */}
                  <div className="mt-4">
                    <button
                      onClick={() => toggleComments(review.id)}
                      className="flex items-center text-sm text-[#1980e6] hover:text-[#1368bd]"
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
                              <img src={comment.userAvatar ? comment.userAvatar : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.userName || 'U')} alt={comment.userName} className="w-6 h-6 rounded-full mr-2" />
                              <span className="font-semibold text-[#0d141b] mr-2">{comment.userName}</span>
                              {renderUserRoleChip(comment.userRole)}
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
                              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-[#1980e6] focus:border-[#1980e6]"
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
                    disabled={loadingReviews}
                    className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] hover:bg-[#dde3ec] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]"
                  >
                    {loadingReviews ? 'Đang tải...' : 'Xem thêm'}
                  </button>
                </div>
              )}
            </div>

            {/* User Information Popup (ProfileDialog) */}
            <ProfileDialog
              isOpen={isUserPopupOpen}
              onClose={() => setIsUserPopupOpen(false)}
              user={selectedUser}
            />
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
    </div>
  );
};

export default LectureDetailPage;