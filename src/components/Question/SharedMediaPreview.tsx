import React from 'react';

interface SharedMediaData {
  type?: 'image' | 'audio' | 'text' | 'video'; // Loại media
  url?: string; // Cho image/audio URL
  content?: string; // Cho text content (đoạn văn)
  fileName?: string; // Tên file đã upload
}

const SharedMediaPreview: React.FC<{ media?: SharedMediaData }> = ({ media }) => {
  if (!media || (!media.url && !media.content)) {
    return <p className="text-gray-500 italic mb-4"></p>;
  }

  return (
    <div className="mb-6">
      {media.type === 'image' && media.url && (
        <img src={media.url} alt={media.fileName || "Shared image"} className="max-w-full h-auto rounded" />
      )}
      {media.type === 'audio' && media.url && (
        <audio controls className="w-full">
          <source src={`${media.url}`} type="audio/mpeg" />
          Định dạng file không được hỗ trợ
        </audio>
      )}

      {media.type === 'video' && media.url && (
        <video controls src={media.url} className="max-w-full h-auto rounded w-full">
          Your browser does not support the video element.
        </video>
      )}
      {media.type === 'text' && media.content && (
        <div className="prose prose-sm max-w-none rounded-md bg-white">
          {media.content.split('\n').map((line, index) => (
            <React.Fragment key={index}>{line}<br /></React.Fragment>
          ))}
        </div>
      )}
      {media.fileName && <p className="text-xs text-gray-500 mt-1">{media.fileName}</p>}
    </div >
  );
};

export default SharedMediaPreview; 