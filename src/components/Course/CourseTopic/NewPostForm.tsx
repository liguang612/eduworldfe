import React, { useState, useRef } from 'react';
import type { User } from '@/contexts/AuthContext';
import { uploadFile } from '@/api/topicApi';
import { toast } from 'react-toastify';
import { baseURL } from '@/config/axios';
import ImageIcon from '@/assets/image.svg';

interface NewPostFormProps {
  currentUser: User;
  onSubmit: (content: string, imageUrls: string[]) => Promise<void>;
}

const NewPostForm: React.FC<NewPostFormProps> = ({
  currentUser,
  onSubmit,
}) => {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) return;

    setIsSubmitting(true);
    try {
      // Upload all images in parallel
      const uploadPromises = selectedFiles.map(file =>
        uploadFile(file, 'posts')
          .catch(error => {
            console.error('Error uploading file:', error);
            toast.error(`Lỗi khi tải lên ảnh: ${file.name}`);
            return null;
          })
      );

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => url !== null);

      await onSubmit(content.trim(), validUrls);
      setContent('');
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      toast.error('Lỗi khi tạo bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarSrc = currentUser?.avatar ? baseURL + currentUser.avatar : "https://via.placeholder.com/150/007bff/FFFFFF?Text=CU";
  const userName = currentUser?.name || "Current User";

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          <img
            src={avatarSrc}
            alt={userName}
            className="h-10 w-10 rounded-full flex-shrink-0 object-cover"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Bạn đang nghĩ gì, ${userName}?`}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm transition-shadow duration-150"
              rows={4}
            />
            {selectedFiles.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <img src={ImageIcon} alt="Add media" className="h-6 w-6 mr-2 cursor-pointer" />
              </label>

              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
                  className={`px-5 py-2 rounded-md text-sm font-semibold text-white ${isSubmitting || (!content.trim() && selectedFiles.length === 0)
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {isSubmitting ? 'Đang đăng...' : 'Đăng'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewPostForm;