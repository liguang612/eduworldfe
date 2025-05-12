import { useState } from 'react';
import { type Chapter } from '../../api/courseApi';
import { InputDialog } from '../Common/InputDialog';
import { ConfirmationDialog } from '../Common/ConfirmationDialog';
import { updateChapter, deleteChapter } from '../../api/courseApi';
import { toast } from 'react-toastify';

interface ChapterItemProps {
  index: number;
  chapter: Chapter;
  onChapterUpdated: (chapter: Chapter) => void;
  onChapterDeleted: (chapterId: string) => void;
}

export function ChapterItem({ index, chapter, onChapterUpdated, onChapterDeleted }: ChapterItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEditChapter = async (newName: string) => {
    try {
      setIsUpdating(true);

      const updatedChapter = await updateChapter(chapter.id, { name: newName });

      toast.success('Cập nhật chương thành công!');
      onChapterUpdated(updatedChapter);
    } catch (error) {
      toast.error('Cập nhật chương thất bại!');
    } finally {
      setIsUpdating(false);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteChapter = async () => {
    try {
      setIsDeleting(true);
      await deleteChapter(chapter.id);
      toast.success('Xóa chương thành công!');
      onChapterDeleted(chapter.id);
    } catch (error) {
      toast.error('Xóa chương thất bại!');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col border-t border-t-[#d0dbe7] py-2 group">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-3">
            <span className="text-[#0e141b] text-base font-normal">{`Chương ${index + 1}: `}</span>
            <span className="text-[#0e141b] text-base font-normal">{chapter.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditDialogOpen(true)}
              disabled={isUpdating}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-[#0e141b] hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {isExpanded && chapter.lectures && chapter.lectures.length > 0 && (
          <div className="mt-2 pl-8 space-y-2">
            {chapter.lectures.map((lecture, index) => (
              <div key={lecture.id} className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between border-b border-b-gray-100 last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-12">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                      {lecture.number}
                    </p>
                    <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">
                      {lecture.title}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <p className="text-[#4e7397] text-sm font-normal leading-normal">{lecture.duration}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <InputDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Sửa chương"
        initialValue={chapter.name}
        placeholder="Nhập tên chương"
        onSubmit={handleEditChapter}
        submitButtonText={isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Xóa chương"
        message="Bạn có chắc chắn muốn xóa chương này không? (Bạn vẫn có thể tìm thấy các bài giảng ở trang quản lý bài giảng)"
        onConfirm={handleDeleteChapter}
        confirmButtonText={isDeleting ? 'Đang xóa...' : 'Xóa'}
        cancelButtonText="Hủy"
        confirmButtonColorClass="bg-red-600 hover:bg-red-700"
      />
    </>
  );
} 