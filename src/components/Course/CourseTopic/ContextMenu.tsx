import React from 'react';

interface ContextMenuProps {
  postId: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  isComment?: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ postId, onEdit, onDelete, onClose, isComment }) => {
  return (
    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-30 border border-gray-200">
      <button
        onClick={() => { onEdit(postId); onClose(); }}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
      >
        Sửa {isComment ? 'bình luận' : 'bài viết'}
      </button>
      <button
        onClick={() => { onDelete(postId); onClose(); }}
        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-md"
      >
        Xóa {isComment ? 'bình luận' : 'bài viết'}
      </button>
    </div>
  );
};

export default ContextMenu;