import { useState } from 'react'
import { type Chapter } from '../../api/courseApi';
import { InputDialog } from '../Common/InputDialog';
import { ConfirmationDialog } from '../Common/ConfirmationDialog';
import { updateChapter, deleteChapter, removeLectureFromChapter } from '../../api/courseApi';
import { toast } from 'react-toastify';
import AddIcon from '@/assets/add.svg';
import EditIcon from '@/assets/edit.svg';
import RemoveIcon from '@/assets/remove.svg';
import { getLectures, type LectureResponse, getLecturesByIds } from '../../api/lectureApi';
import { addLectureToChapter } from '../../api/courseApi';
import { SearchableDialog } from '../Common/SearchableDialog';

interface ChapterItemProps {
  index: number;
  chapter: Chapter;
  onChapterUpdated: (chapter: Chapter) => void;
  onChapterDeleted: (chapterId: string) => void;
  subjectId: string;
  isOwner: boolean;
}

export function ChapterItem({ index, chapter, onChapterUpdated, onChapterDeleted, subjectId, isOwner }: ChapterItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [lectures, setLectures] = useState<LectureResponse[]>([]);
  const [isLoadingLectures, setIsLoadingLectures] = useState(false);
  const [removingLectureId, setRemovingLectureId] = useState<string | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [lectureToRemove, setLectureToRemove] = useState<LectureResponse | null>(null);

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

  const handleSearch = async (keyword: string): Promise<LectureResponse[]> => {
    try {
      const results = await getLectures(subjectId, keyword);
      return results;
    } catch (error) {
      console.error('Error searching lectures:', error);
      toast.error('Có lỗi xảy ra khi tìm kiếm bài giảng');
      return [];
    }
  };

  const handleSelectLecture = async (lecture: LectureResponse) => {
    try {
      const updatedChapter = await addLectureToChapter(chapter.id, lecture.id);
      onChapterUpdated(updatedChapter);
      toast.success('Thêm bài giảng thành công');
      setIsSearchDialogOpen(false);

      setIsLoadingLectures(true);
      try {
        const fetchedLectures = await getLecturesByIds(updatedChapter.lectureIds);
        setLectures(fetchedLectures);
      } catch (error) {
        console.error('Error fetching updated lectures:', error);
        toast.error('Không thể tải lại danh sách bài giảng sau khi thêm');
      } finally {
        setIsLoadingLectures(false);
      }

    } catch (error: any) {
      console.error('Error adding lecture to chapter:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
    }
  };

  const handleToggleExpand = async () => {
    if (!isExpanded && chapter.lectureIds.length > 0 && lectures.length === 0) {
      setIsLoadingLectures(true);
      try {
        const fetchedLectures = await getLecturesByIds(chapter.lectureIds);
        setLectures(fetchedLectures);
      } catch (error) {
        console.error('Error fetching lectures:', error);
        toast.error('Không thể tải danh sách bài giảng');
      } finally {
        setIsLoadingLectures(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const handleRemoveLecture = async (lecture: LectureResponse) => {
    setLectureToRemove(lecture);
    setIsRemoveDialogOpen(true);
  };

  const confirmRemoveLecture = async () => {
    if (!lectureToRemove) return;

    setRemovingLectureId(lectureToRemove.id);
    try {
      const updatedChapter = await removeLectureFromChapter(chapter.id, lectureToRemove.id);
      onChapterUpdated(updatedChapter);
      setLectures(prevLectures => prevLectures.filter(l => l.id !== lectureToRemove.id));
      toast.success('Xóa bài giảng khỏi chương thành công');
    } catch (error: any) {
      console.error('Error removing lecture from chapter:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa bài giảng');
    } finally {
      setRemovingLectureId(null);
      setLectureToRemove(null);
      setIsRemoveDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col border-t border-t-[#d0dbe7] py-2 group">
        <div className="flex items-center justify-between cursor-pointer" onClick={handleToggleExpand}>
          <div className="flex items-center gap-3 py-1">
            <span className="text-[#0e141b] text-base font-normal">{`Chương ${index + 1}: `}</span>
            <span className="text-[#0e141b] text-base font-normal">{chapter.name}</span>
          </div>
          {isOwner && <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchDialogOpen(true);
              }}
              disabled={isUpdating}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <img src={AddIcon} alt="Add" className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditDialogOpen(true);
              }}
              disabled={isUpdating}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <img src={EditIcon} alt="Edit" className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
              disabled={isDeleting}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={handleToggleExpand}
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
          </div>}
        </div>

        {isExpanded && chapter.lectureIds.length > 0 && (
          <div className="mt-2 pl-8 space-y-2">
            {isLoadingLectures ? (
              <div className="text-[#4e7397] text-center py-2">Đang tải bài giảng...</div>
            ) : (
              lectures.map((lecture, index) => (
                <div key={lecture.id} className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between border-b border-b-gray-100 last:border-b-0">
                  <div className="flex items-center gap-4">
                    {isOwner && <button
                      onClick={() => handleRemoveLecture(lecture)}
                      disabled={removingLectureId === lecture.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {removingLectureId === lecture.id ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <img src={RemoveIcon} alt="Remove" className="min-h-5 min-w-5" />
                      )}
                    </button>}
                    <div className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-12">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"></path>
                      </svg>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">
                        {`Bài ${index + 1}: ${lecture.name}`}
                      </p>
                      <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">
                        {lecture.description}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <p className="text-[#4e7397] text-sm font-normal leading-normal">{lecture.duration} phút</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div >

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

      <SearchableDialog
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
        title="Tìm kiếm bài giảng"
        searchPlaceholder="Nhập tên bài giảng... (Nhấn enter để tìm kiếm)"
        onSearch={handleSearch}
        onItemSelected={handleSelectLecture}
        renderItem={(lecture: LectureResponse, onSelect) => (
          <div
            className="flex items-center gap-4 p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => onSelect(lecture)}
          >
            <div className="text-[#0e141b] flex items-center justify-center rounded-lg bg-[#e7edf3] shrink-0 size-12">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"></path>
              </svg>
            </div>
            <div className="flex flex-col">
              <p className="text-[#0e141b] text-base font-medium">{lecture.name}</p>
              <p className="text-[#4e7397] text-sm">{`${Math.floor(lecture.duration / 60)} giờ ${lecture.duration % 60} phút`}</p>
            </div>
          </div>
        )}
        itemContainerClassName="grid grid-cols-1 gap-2 p-4 overflow-y-auto max-h-[60vh]"
      />

      <ConfirmationDialog
        isOpen={isRemoveDialogOpen}
        onClose={() => {
          setIsRemoveDialogOpen(false);
          setLectureToRemove(null);
        }}
        title="Xóa bài giảng"
        message={`Bạn có chắc chắn muốn loại bỏ bài giảng "${lectureToRemove?.name}" khỏi chương này không? (Bài giảng sẽ vẫn còn trong danh sách bài giảng)`}
        onConfirm={confirmRemoveLecture}
        confirmButtonText="Xóa"
        cancelButtonText="Hủy"
        confirmButtonColorClass="bg-red-600 hover:bg-red-700"
      />
    </>
  );
} 