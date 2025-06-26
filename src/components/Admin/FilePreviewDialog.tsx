import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, Download, Image, Video, Music, File } from 'lucide-react';
import type { UserFileInfo } from '@/api/adminApi';

interface FilePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: UserFileInfo | null;
  teacherName?: string;
}

const FilePreviewDialog: React.FC<FilePreviewDialogProps> = ({ isOpen, onClose, file, teacherName }) => {
  if (!file) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'image':
        return <Image className="w-8 h-8 text-green-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-blue-500" />;
      case 'audio':
        return <Music className="w-8 h-8 text-purple-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'image':
        return 'Hình ảnh';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Âm thanh';
      default:
        return 'Tệp tin';
    }
  };

  const renderFilePreview = () => {
    const fileType = file.fileType.toLowerCase();

    // Image preview
    if (fileType === 'image') {
      return (
        <div className="rounded-lg items-center justify-center flex-row">
          <img src={`${file.fileUrl}`} alt={file.fileName} className="max-w-full h-auto rounded-lg" />
        </div>
      );
    }

    // Video preview
    if (fileType === 'video') {
      return (
        <video controls className="w-full">
          <source src={`${file.fileUrl}`} type="video/mp4" />
          Định dạng file không được hỗ trợ
        </video>
      );
    }

    // Audio preview
    if (fileType === 'audio') {
      return (
        <audio controls className="w-full">
          <source src={`${file.fileUrl}`} type="audio/mpeg" />
          Định dạng file không được hỗ trợ
        </audio>
      );
    }

    // Fallback cho các file type khác
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        {getFileTypeIcon(file.fileType)}
        <p className="mt-4 text-gray-600 text-center">
          Không thể xem trước loại file này.<br />
          Vui lòng tải xuống để xem nội dung.
        </p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-[#0e141b]">
                Xem trước file
              </DialogTitle>
              <DialogDescription className="text-[#4e7397]">
                {teacherName && `Giáo viên: ${teacherName}`}
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            {getFileTypeIcon(file.fileType)}
            <div className="flex-1">
              <h3 className="font-semibold text-[#0e141b] text-lg">{file.fileName}</h3>
              <div className="flex items-center gap-4 text-sm text-[#4e7397] mt-1">
                <span>{getFileTypeLabel(file.fileType)}</span>
                <span>•</span>
                <span>{formatBytes(file.fileSize)}</span>
                <span>•</span>
                <span>{formatDate(file.uploadTime)}</span>
              </div>
            </div>
            <a
              href={file.fileUrl}
              download={file.fileName}
              className="flex items-center gap-2 px-4 py-2 bg-[#1980e6] text-white rounded-lg hover:bg-[#0e141b] transition-colors"
            >
              <Download className="w-4 h-4" />
              Tải xuống
            </a>
          </div>

          {/* File Preview */}
          <div className="flex-1 overflow-y-auto">
            {renderFilePreview()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewDialog; 