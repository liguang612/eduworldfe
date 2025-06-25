import React, { useState, useEffect } from 'react';
import { getSharedMedia, type MediaItem } from '@/api/questionApi';
import { useAuth } from '@/contexts/AuthContext';
import sm_paragraph from '@/assets/sm_paragraph.svg';
import sm_image from '@/assets/sm_image.svg';
import sm_audio from '@/assets/sm_audio.svg';
import sm_video from '@/assets/sm_video.svg';
import CloseIcon from '@/assets/close.svg';
import SearchIcon from '@/assets/magnify_glass.svg';
import PreviewIcon from '@/assets/preview.svg';

interface MediaLibraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMediaSelect: (media: MediaItem) => void;
}

type MediaTab = 'Đoạn văn' | 'Ảnh' | 'Video' | 'Audio';

const getMediaTypeNumber = (tab: MediaTab): number => {
  switch (tab) {
    case 'Đoạn văn': return 0;
    case 'Ảnh': return 1;
    case 'Audio': return 2;
    case 'Video': return 3;
    default: return 0;
  }
};

export function MediaLibraryDialog({ isOpen, onClose, onMediaSelect }: MediaLibraryDialogProps) {
  const [activeTab, setActiveTab] = useState<MediaTab>('Đoạn văn');
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const { user } = useAuth();
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [activeTab, isOpen]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(mediaItems);
    } else {
      const filtered = mediaItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, mediaItems]);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const mediaType = getMediaTypeNumber(activeTab);
      const data = await getSharedMedia(mediaType, user?.id);
      setMediaItems(data);
    } catch (error) {
      console.error('Failed to load media:', error);
      setMediaItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (tab: MediaTab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const handleMediaSelect = (media: MediaItem) => {
    onMediaSelect(media);
    onClose();
  };

  const renderMediaItem = (item: MediaItem) => {
    return (
      <div
        key={item.id}
        className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors relative"
        onClick={() => handleMediaSelect(item)}
      >
        <div className="flex items-center gap-3">
          {item.mediaType === 1 && (
            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
              <img src={sm_image} alt="Image" />
            </div>
          )}
          {item.mediaType === 2 && (
            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
              <img src={sm_audio} alt="Audio" />
            </div>
          )}
          {item.mediaType === 3 && (
            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
              <img src={sm_video} alt="Video" />
            </div>
          )}
          {item.mediaType === 0 && (
            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
              <img src={sm_paragraph} alt="Paragraph" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{item.mediaType === 0 ? item.text : item.title}</p>
            <p className="text-xs text-gray-500">
              {item.usageCount} câu hỏi đang sử dụng
            </p>
          </div>
          <button
            type="button"
            className="ml-2 flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 z-10"
            onClick={e => { e.stopPropagation(); setPreviewMedia(item); }}
            title="Xem trước"
          >
            <img src={PreviewIcon} alt="Preview" className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex-grow overflow-y-auto p-4 flex items-center justify-center">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <div className="flex-grow overflow-y-auto p-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">
              {searchTerm ? 'Không tìm thấy kết quả nào.' : `Chưa có ${activeTab.toLowerCase()} nào trong kho.`}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-grow overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredItems.map(renderMediaItem)}
        </div>
      </div>
    );
  };

  const renderPreviewDialog = () => {
    if (!previewMedia) return null;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center">
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" onClick={() => setPreviewMedia(null)}></div>
        <div className="relative bg-white rounded-lg shadow-xl flex flex-col max-w-[90vw] max-h-[90vh] p-6 min-w-[320px] min-h-[120px]">
          <button
            onClick={() => setPreviewMedia(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition"
            aria-label="Close preview"
          >
            <img src={CloseIcon} alt="Close" className="w-6 h-6" />
          </button>
          <h3 className="text-lg font-semibold mb-4">Xem trước media</h3>
          <div className="flex items-center justify-center w-full h-full">
            {previewMedia.mediaType === 0 && (
              <div className="p-4 bg-gray-50 rounded-lg max-w-[600px] max-h-[60vh] overflow-auto">
                <p className="text-gray-700 whitespace-pre-wrap">{previewMedia.text}</p>
              </div>
            )}
            {previewMedia.mediaType === 1 && previewMedia.mediaUrl && (
              <img src={previewMedia.mediaUrl} alt="Preview" className="max-w-[80vw] max-h-[70vh] rounded-lg" />
            )}
            {previewMedia.mediaType === 2 && previewMedia.mediaUrl && (
              <audio controls className="w-full max-w-[500px]">
                <source src={previewMedia.mediaUrl} />
                Định dạng file không được hỗ trợ
              </audio>
            )}
            {previewMedia.mediaType === 3 && previewMedia.mediaUrl && (
              <video controls className="max-w-[80vw] max-h-[70vh] rounded-lg">
                <source src={previewMedia.mediaUrl} />
                Định dạng file không được hỗ trợ
              </video>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" onClick={onClose}></div>

      <div className="relative bg-white rounded-lg shadow-xl flex flex-col w-[75vw] h-[75vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-[#0e141b]">Kho media</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close dialog"
          >
            <img src={CloseIcon} alt="Close" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-12 bg-[#e7edf3]">
            <div
              className="text-[#4e7397] flex items-center justify-center pl-4 rounded-l-xl"
            >
              <img src={SearchIcon} alt="Search" className="w-6 h-6" />
            </div>
            <input
              type="search"
              placeholder="Tìm kiếm trong kho media..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-[#0e141b] focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] h-full placeholder:text-[#4e7397] px-3 text-base font-normal leading-normal"
            />
          </div>
        </div>

        <div className="border-b border-[#d0dbe7] px-4">
          <div className="flex gap-8">
            {(['Đoạn văn', 'Ảnh', 'Video', 'Audio'] as MediaTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === tab ? 'border-b-[#1980e6]' : 'border-b-transparent'
                  }`}
              >
                <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${activeTab === tab ? 'text-[#0e141b]' : 'text-[#4e7397]'
                  }`}>{tab}</p>
              </button>
            ))}
          </div>
        </div>

        {renderTabContent()}

        <div className="p-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Hủy
          </button>
        </div>
      </div>
      {renderPreviewDialog()}
    </div>
  );
} 