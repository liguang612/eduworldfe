import React, { useState, useEffect, useRef } from 'react';
import type { Post as PostType, Comment as CommentType } from '@/api/topicApi';
import { updateComment, deleteComment, createComment, getPostComments } from '@/api/topicApi';
import { uploadFile } from '@/api/lectureApi';
import type { User } from '@/contexts/AuthContext';
import ChevronUpIcon from '@/assets/chevron-up.svg';
import ChevronDownIcon from '@/assets/chevron-down.svg';
import DotsThreeIcon from '@/assets/dot_three.svg';
import ImageIcon from '@/assets/image.svg';
import ContextMenu from './ContextMenu';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import ImagePreview from './ImagePreview';
import { toast } from 'react-toastify';
import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog';
import ProfileDialog from '@/components/Auth/UserInformationPopup';

interface PostItemProps {
  post: PostType;
  currentUser: User;
  onEditPost: (postId: string, currentContent: string, imageUrls: string[]) => void;
  onDeletePost: (postId: string) => void;
  onApprovePost?: (postId: string, approved: boolean) => void;
  isPending?: boolean;
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  currentUser,
  onEditPost,
  onDeletePost,
  onApprovePost,
  isPending,
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [areCommentsVisible, setAreCommentsVisible] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [editedImageUrls, setEditedImageUrls] = useState<string[]>(post.imageUrls);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);
  const [commentsPage, setCommentsPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const avatarSrc = post.user?.userAvatar ? post.user.userAvatar : "https://via.placeholder.com/150";
  const userName = post.user?.userName || "Unknown User";
  const userSchool = post.user?.userSchool;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContextMenu]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const toggleCommentsVisibility = async () => {
    if (!areCommentsVisible) {
      setIsLoadingComments(true);
      try {
        const response = await getPostComments(post.id, 0, 10);
        setComments(response.comments);
        setCommentsPage(0);
        setHasMoreComments(response.currentPage < response.totalPages - 1);
        setTotalComments(response.totalElements);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Lỗi khi tải bình luận');
      } finally {
        setIsLoadingComments(false);
      }
    }
    setAreCommentsVisible(!areCommentsVisible);
  };

  const loadMoreComments = async () => {
    if (isLoadingMoreComments || !hasMoreComments) return;

    setIsLoadingMoreComments(true);
    try {
      const nextPage = commentsPage + 1;
      const response = await getPostComments(post.id, nextPage, 10);
      setComments(prev => [...prev, ...response.comments]);
      setCommentsPage(nextPage);
      setHasMoreComments(response.currentPage < response.totalPages - 1);
    } catch (error) {
      console.error('Error loading more comments:', error);
      toast.error('Lỗi khi tải thêm bình luận');
    } finally {
      setIsLoadingMoreComments(false);
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      const updatedComment = await updateComment(commentId, { content });
      setComments(prevComments =>
        prevComments.map(comment => comment.id === commentId ? updatedComment : comment)
      );
    } catch (error) {
      console.error('Error editing comment:', error);
      toast.error('Lỗi khi sửa bình luận');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(prevComments =>
        prevComments.filter(comment => comment.id !== commentId)
      );
      setTotalComments(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Lỗi khi xóa bình luận');
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    try {
      const newComment = await createComment({ postId, content });
      setComments(prevComments => [newComment, ...prevComments]);
      setTotalComments(prev => prev + 1);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Lỗi khi thêm bình luận');
    }
  };

  const handleEditPostClick = () => {
    setIsEditing(true);
    setEditedContent(post.content);
    setEditedImageUrls(post.imageUrls);
    setShowContextMenu(false);
  };

  const handleSavePostEdit = async () => {
    try {
      setIsSaving(true);

      // Upload new images first
      const uploadPromises = editedImageUrls
        .filter(url => url.startsWith('blob:'))
        .map(async (blobUrl) => {
          try {
            // Convert blob URL to File object
            const response = await fetch(blobUrl);
            const blob = await response.blob();
            const filename = blobUrl.split('/').pop() || 'image.jpg';
            const file = new File([blob], filename, { type: blob.type });

            // Upload the file
            const uploadedUrl = await uploadFile(file, 'post');
            return { blobUrl, uploadedUrl };
          } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Lỗi khi tải ảnh lên');
            throw error;
          }
        });

      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromises);

      // Replace blob URLs with uploaded URLs
      const finalImageUrls = editedImageUrls.map(url => {
        const uploadResult = uploadResults.find(result => result.blobUrl === url);
        return uploadResult ? uploadResult.uploadedUrl : url;
      });

      // Check if content or images have changed
      if (editedContent.trim() !== post.content || JSON.stringify(finalImageUrls) !== JSON.stringify(post.imageUrls)) {
        onEditPost(post.id, editedContent.trim(), finalImageUrls);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Lỗi khi lưu bài viết');
    }

    setIsSaving(false);
  };

  const handleCancelPostEdit = () => {
    setEditedContent(post.content);
    setEditedImageUrls(post.imageUrls);
    setIsEditing(false);
  };

  const handleDeletePostClick = () => {
    setIsDeleteDialogOpen(true);
    setShowContextMenu(false);
  };

  const handleDeletePostConfirm = async () => {
    onDeletePost(post.id);
    setIsDeleteDialogOpen(false);
  };

  const handlePostKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSavePostEdit();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setEditedImageUrls(prev => [...prev, ...newImageUrls]);
  };

  const handleRemoveImage = (index: number) => {
    setEditedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreviewImage = (imageUrl: string, index: number) => {
    setPreviewImage(imageUrl);
    setPreviewImageIndex(index);
  };

  const handleNextImage = () => {
    const nextIndex = (previewImageIndex + 1) % editedImageUrls.length;
    setPreviewImage(editedImageUrls[nextIndex]);
    setPreviewImageIndex(nextIndex);
  };

  const handlePrevImage = () => {
    const prevIndex = (previewImageIndex - 1 + editedImageUrls.length) % editedImageUrls.length;
    setPreviewImage(editedImageUrls[prevIndex]);
    setPreviewImageIndex(prevIndex);
  };

  const renderImages = (imageUrls: string[]) => {
    if (imageUrls.length === 0) return null;

    return (
      <div className="my-4 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {imageUrls.map((imgUrl, index) => (
            <div key={index} className="relative flex-shrink-0 group">
              <img
                src={imgUrl.startsWith('blob:') ? imgUrl : imgUrl}
                alt={`Post image ${index + 1}`}
                className="h-48 w-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handlePreviewImage(imgUrl, index)}
              />
              {isEditing && (
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleOpenUserPopup = () => {
    if (post.user) {
      setSelectedUser(post.user as unknown as User);
      setIsUserPopupOpen(true);
    }
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <img src={avatarSrc} alt={userName} className="h-10 w-10 rounded-full flex-shrink-0 object-cover cursor-pointer" onClick={handleOpenUserPopup} />
            <div>
              <p
                className="font-semibold text-gray-800 hover:underline cursor-pointer"
                onClick={handleOpenUserPopup}
              >{userName}</p>
              <p className="text-xs text-gray-500">
                {userSchool ? `${userSchool} · ` : ''}
                {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="relative">
            {currentUser.id === post.user.id && <button
              onClick={() => setShowContextMenu(prev => !prev)}
              className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <img src={DotsThreeIcon} alt="Options" className="h-5 w-5" />
            </button>}
            {showContextMenu && (
              <div ref={contextMenuRef}>
                <ContextMenu
                  postId={post.id}
                  onEdit={handleEditPostClick}
                  onDelete={handleDeletePostClick}
                  onClose={() => setShowContextMenu(false)}
                />
              </div>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="flex flex-col">
            <textarea
              ref={inputRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyPress={handlePostKeyPress}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-sm resize-none"
              rows={6}
            />
            {renderImages(editedImageUrls)}
            <div className="flex justify-end space-x-2 mt-2 items-center">
              {isEditing && (
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                    id={`file-upload-${post.id}`}
                  />
                  <label htmlFor={`file-upload-${post.id}`}>
                    <img src={ImageIcon} alt="Add media" className="h-6 w-6 mr-2 cursor-pointer" />
                  </label>
                </div>
              )}
              <button
                onClick={handleCancelPostEdit}
                className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 transition"
                disabled={isSaving}
              >
                Huỷ
              </button>
              <button
                onClick={handleSavePostEdit}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
                disabled={isSaving}
              >
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-800 mb-3 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
            {renderImages(post.imageUrls)}
          </>
        )}

        {isPending && onApprovePost && currentUser.role === 1 && (
          <div className="flex justify-end space-x-3 mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => onApprovePost(post.id, false)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md text-sm font-semibold hover:bg-red-200 transition-colors"
            >
              Xoá
            </button>
            <button
              onClick={() => onApprovePost(post.id, true)}
              className="px-4 py-2 bg-green-500 text-white rounded-md text-sm font-semibold hover:bg-green-600 transition-colors"
            >
              Duyệt
            </button>
          </div>
        )}

        <div className="mt-4 border-t border-gray-100 pt-2">
          {post.approved && <button
            onClick={toggleCommentsVisibility}
            className="flex items-center justify-start w-auto text-left text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded group"
            aria-expanded={areCommentsVisible}
            aria-controls={`comments-section-${post.id}`}
          >
            <span className="group-hover:underline">
              Bình luận {totalComments > 0 && `(${totalComments})`}
            </span>
            {areCommentsVisible ?
              <img src={ChevronUpIcon} alt="Hide comments" className="h-4 w-4 ml-1.5 text-gray-500 group-hover:text-gray-700" /> :
              <img src={ChevronDownIcon} alt="Show comments" className="h-4 w-4 ml-1.5 text-gray-500 group-hover:text-gray-700" />
            }
          </button>}

          {areCommentsVisible && (
            <div id={`comments-section-${post.id}`} className="mt-2">
              {isLoadingComments ? (
                <div className="text-center py-4">
                  <svg className="animate-spin h-6 w-6 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <>
                  <CommentForm
                    postId={post.id}
                    currentUser={currentUser}
                    onAddComment={handleAddComment}
                  />

                  {comments.length > 0 ? (
                    <>
                      {comments.map(comment => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          currentUser={currentUser}
                          onEditComment={handleEditComment}
                          onDeleteComment={handleDeleteComment}
                        />
                      ))}

                      {hasMoreComments && (
                        <div className="text-center py-3">
                          <button
                            onClick={loadMoreComments}
                            disabled={isLoadingMoreComments}
                            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-blue-300"
                          >
                            {isLoadingMoreComments ? (
                              <>
                                <svg className="animate-spin h-4 w-4 mr-1 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang tải...
                              </>
                            ) : (
                              'Xem thêm bình luận'
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 py-3 px-1">No comments yet. Be the first to share your thoughts!</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <ImagePreview
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          imageUrl={previewImage || ''}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
          showNavigation={editedImageUrls.length > 1}
        />

        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          title="Xác nhận xóa bài viết"
          message="Bạn có chắc chắn muốn xóa bài viết này không?"
          onConfirm={handleDeletePostConfirm}
          confirmButtonText="Xóa"
          confirmButtonColorClass="bg-red-600 hover:bg-red-700"
        />

        {/* User Information Popup (ProfileDialog) */}
        <ProfileDialog
          isOpen={isUserPopupOpen}
          onClose={() => setIsUserPopupOpen(false)}
          user={selectedUser}
        />
      </div>
    </>
  );
};

export default PostItem;