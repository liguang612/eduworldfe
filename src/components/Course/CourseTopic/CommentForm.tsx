import React, { useState } from 'react';
import type { User } from '@/contexts/AuthContext';
import { baseURL } from '@/config/axios';
import SendIcon from '@/assets/send.svg';

interface CommentFormProps {
  postId: string;
  currentUser: User;
  onAddComment: (postId: string, content: string) => Promise<void>;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, currentUser, onAddComment }) => {
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (commentContent.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddComment(postId, commentContent.trim());
        setCommentContent('');
      } catch (error) {
        console.error("Failed to add comment:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const avatarSrc = currentUser?.avatar ? baseURL + currentUser.avatar : "https://via.placeholder.com/150/007bff/FFFFFF?Text=CU";
  const userName = currentUser?.name || "Current User";

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3 mt-3 py-2">
      <img src={avatarSrc} alt={userName} className="h-8 w-8 rounded-full flex-shrink-0 object-cover" />
      <input
        type="text"
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        placeholder="Viết bình luận..."
        className="flex-1 p-2 px-4 border border-gray-300 rounded-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-shadow duration-150 ease-in-out"
      />
      <button
        type="submit"
        className="text-white rounded-full text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
        disabled={!commentContent.trim() || isSubmitting}
      >
        <img src={SendIcon} alt="Send" className="h-6 w-6" />
      </button>
    </form>
  );
};

export default CommentForm;