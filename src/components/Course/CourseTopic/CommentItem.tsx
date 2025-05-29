import React, { useState, useEffect, useRef } from 'react';
import type { Comment as CommentType } from '@/api/topicApi';
import DotsThreeIcon from '@/assets/dot_three.svg';
import ContextMenu from './ContextMenu';
import { baseURL } from '@/config/axios';
import type { User } from '@/contexts/AuthContext';
import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog';
import ProfileDialog from '@/components/Auth/UserInformationPopup';

interface CommentItemProps {
  comment: CommentType;
  currentUser: User;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUser,
  onEditComment,
  onDeleteComment
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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


  const handleEditClick = () => {
    setIsEditing(true);
    setShowContextMenu(false);
  };

  const handleSaveEdit = async () => {
    if (editedContent.trim() !== comment.content) {
      await onEditComment(comment.id, editedContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
    setShowContextMenu(false);
  };

  const handleDeleteConfirm = async () => {
    await onDeleteComment(comment.id);
    setIsDeleteDialogOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
  };

  const isAuthor = currentUser?.id === comment.user.id;

  return (
    <>
      <div className="flex items-start space-x-3 py-2 pr-1">
        <img
          src={comment.user.userAvatar ? baseURL + comment.user.userAvatar : "https://via.placeholder.com/100"}
          alt={comment.user.userName}
          className="h-8 w-8 rounded-full flex-shrink-0 object-cover cursor-pointer"
          onClick={() => {
            if (comment.user) {
              const commentUser: User = {
                id: comment.user.id,
                name: comment.user.userName,
                avatar: comment.user.userAvatar,
                email: '',
                school: comment.user.userSchool || '',
                grade: undefined,
                role: undefined,
              };
              setSelectedUser(commentUser);
              setIsUserPopupOpen(true);
            }
            // Optionally handle the case where user info is incomplete
            // else { toast.error('Thông tin người dùng không đầy đủ.'); }
          }}
        />
        <div className="bg-gray-100 p-3 rounded-xl flex-1">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline space-x-2">
              <p
                className="font-semibold text-sm text-gray-800 hover:underline cursor-pointer"
                onClick={() => {
                  if (comment.user) {
                    const commentUser: User = {
                      id: comment.user.id,
                      name: comment.user.userName,
                      avatar: comment.user.userAvatar,
                      email: '',
                      school: comment.user.userSchool || '',
                      grade: undefined,
                      role: undefined,
                    };
                    setSelectedUser(commentUser);
                    setIsUserPopupOpen(true);
                  }
                }}
              >{comment.user.userName}</p>
              <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            {isAuthor && (
              <div className="relative">
                <button
                  onClick={() => setShowContextMenu(prev => !prev)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <img src={DotsThreeIcon} alt="Options" className="h-4 w-4" />
                </button>
                {showContextMenu && (
                  <div ref={contextMenuRef}>
                    <ContextMenu
                      postId={comment.id}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                      onClose={() => setShowContextMenu(false)}
                      isComment={true}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          {isEditing ? (
            <div className="flex flex-col mt-1">
              <textarea
                ref={inputRef}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-sm resize-none"
                rows={3}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 transition"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
                >
                  Lưu
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>

        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          title="Xác nhận xóa bình luận"
          message="Bạn có chắc chắn muốn xóa bình luận này không?"
          onConfirm={handleDeleteConfirm}
          confirmButtonText="Xóa"
          confirmButtonColorClass="bg-red-600 hover:bg-red-700"
        />
      </div>

      {/* User Information Popup (ProfileDialog) */}
      <ProfileDialog
        isOpen={isUserPopupOpen}
        onClose={() => setIsUserPopupOpen(false)}
        user={selectedUser}
      />
    </>
  );
};

export default CommentItem;