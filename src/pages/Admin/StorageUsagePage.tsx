import { useState, useEffect } from 'react';
import { HardDrive, Users, FileText, Download, Search, ArrowUpDown, Eye, MoreHorizontal } from 'lucide-react';
import StatCard from '@/components/Admin/StatCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import FilePreviewDialog from '@/components/Admin/FilePreviewDialog';
import StorageLimitDialog from '@/components/Admin/StorageLimitDialog';
import { useDebounce } from '@/hooks/use-debounce';
import {
  getTeachersStorageUsage,
  getUserFiles,
  getSystemTotalStorage,
  type TeacherStorageInfo,
  type UserFileInfo,
  type StorageSearchRequest
} from '@/api/adminApi';
import ImageIcon from '@/assets/fp_image.svg';
import VideoIcon from '@/assets/fp_video.svg';
import AudioIcon from '@/assets/fp_audio.svg';
import PdfIcon from '@/assets/fp_pdf.svg';

type SortField = 'name' | 'email' | 'totalStorageUsed' | 'storageLimit' | 'fileCount';
type SortOrder = 'asc' | 'desc';

const StorageUsagePage = () => {
  const [teachers, setTeachers] = useState<TeacherStorageInfo[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherStorageInfo | null>(null);
  const [teacherFiles, setTeacherFiles] = useState<UserFileInfo[]>([]);
  const [systemTotalStorage, setSystemTotalStorage] = useState<number>(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UserFileInfo | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [showStorageLimitDialog, setShowStorageLimitDialog] = useState(false);
  const [selectedTeacherForLimit, setSelectedTeacherForLimit] = useState<TeacherStorageInfo | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [systemTotal] = await Promise.all([
          getSystemTotalStorage()
        ]);
        setSystemTotalStorage(systemTotal);
        await fetchTeachers();
      } catch (error) {
        console.error('Error fetching storage data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchTeachers = async () => {
    if (!initialLoading) {
      if (debouncedSearchTerm) {
        setIsSearching(true);
      } else {
        setIsRefreshing(true);
      }
    }

    try {
      const searchParams: StorageSearchRequest = {
        name: debouncedSearchTerm || undefined,
        email: debouncedSearchTerm || undefined,
        page: currentPage,
        size: pageSize
      };

      const response = await getTeachersStorageUsage(searchParams);
      setTeachers(response.teachers);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setIsSearching(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!initialLoading) {
      fetchTeachers();
    }
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchTerm]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortableHeader = ({ children, sortKey }: { children: React.ReactNode, sortKey: SortField }) => (
    <th className="px-4 py-3 text-left text-[#0e141b] text-sm font-bold leading-normal cursor-pointer hover:bg-slate-100" onClick={() => handleSort(sortKey)}>
      <div className="flex items-center gap-2">
        {children}
        {sortField === sortKey && <ArrowUpDown className="h-4 w-4" />}
      </div>
    </th>
  );

  const handleViewFiles = async (teacher: TeacherStorageInfo) => {
    setSelectedTeacher(teacher);
    setFilesLoading(true);
    setShowFilesDialog(true);

    try {
      const files = await getUserFiles(teacher.id);
      setTeacherFiles(files);
    } catch (error) {
      console.error('Error fetching teacher files:', error);
    } finally {
      setFilesLoading(false);
    }
  };

  const handlePreviewFile = (file: UserFileInfo) => {
    setSelectedFile(file);
    setShowFilePreview(true);
  };

  const handleSetStorageLimit = (teacher: TeacherStorageInfo) => {
    setSelectedTeacherForLimit(teacher);
    setShowStorageLimitDialog(true);
  };

  const handleStorageLimitSuccess = () => {
    fetchTeachers(); // Refresh data after update
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateUsagePercentage = (used: number, limit: number): number => {
    if (limit === 0) return 0;
    return Math.round((used / limit) * 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <img src={PdfIcon} alt="pdf" className="w-8 h-8" />;
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <img src={ImageIcon} alt="image" className="w-8 h-8" />;
      case 'video':
      case 'mp4':
      case 'avi':
      case 'mov':
        return <img src={VideoIcon} alt="video" className="w-8 h-8" />;
      case 'audio':
      case 'mp3':
      case 'wav':
        return <img src={AudioIcon} alt="audio" className="w-8 h-8" />;
      default:
        return <div className='w-8 h-8'></div>;
    }
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

  const totalTeachers = totalElements;
  const totalFiles = (teachers || []).reduce((sum, teacher) => sum + teacher.fileCount, 0);
  const averageStoragePerTeacher = totalTeachers > 0 ? systemTotalStorage / totalTeachers : 0;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#0e141b] tracking-light text-[28px] font-bold leading-tight">
          Dung lượng sử dụng
        </h1>
        <p className="text-[#4e7397] mt-1">Quản lý và theo dõi dung lượng sử dụng của giáo viên.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng dung lượng hệ thống"
          value={formatBytes(systemTotalStorage)}
          icon={<HardDrive size={24} />}
          onClick={() => { }}
        />
        <StatCard
          title="Tổng số giáo viên"
          value={totalTeachers.toString()}
          icon={<Users size={24} />}
          onClick={() => { }}
        />
        <StatCard
          title="Tổng số file"
          value={totalFiles.toString()}
          icon={<FileText size={24} />}
          onClick={() => { }}
        />
        <StatCard
          title="Trung bình/giáo viên"
          value={formatBytes(averageStoragePerTeacher)}
          icon={<Download size={24} />}
          onClick={() => { }}
        />
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#d0dbe7]">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#0e141b]">Danh sách giáo viên</h3>
          <p className="text-sm text-[#4e7397]">
            Hiển thị {teachers?.length || 0} trong tổng số {totalElements} giáo viên
          </p>
        </div>

        <div className="mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#d0dbe7] focus:outline-none focus:ring-2 focus:ring-[#1980e6] focus:border-transparent text-sm"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1980e6]"></div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#d0dbe7] relative">
          {isRefreshing && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1980e6]"></div>
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="bg-white">
                <SortableHeader sortKey="name">Giáo viên</SortableHeader>
                <SortableHeader sortKey="email">Email</SortableHeader>
                <SortableHeader sortKey="totalStorageUsed">Dung lượng sử dụng</SortableHeader>
                <SortableHeader sortKey="storageLimit">Giới hạn lưu trữ</SortableHeader>
                <SortableHeader sortKey="fileCount">Số file</SortableHeader>
                <th className="px-4 py-3 text-left text-[#0e141b] text-sm font-bold leading-normal">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {(teachers || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#4e7397]">
                    Không tìm thấy giáo viên nào
                  </td>
                </tr>
              ) : (
                (teachers || []).map((teacher) => (
                  <tr key={teacher.id} className="border-t border-t-[#d0dbe7] hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}`}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover border border-[#d0dbe7]"
                        />
                        <div>
                          <div className="font-medium text-[#0e141b]">{teacher.name}</div>
                          <div className="text-sm text-[#4e7397]">
                            {new Date(teacher.birthday).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#0e141b]">
                      {teacher.email}
                    </td>
                    <td className="p-4 text-[#0e141b] font-medium">
                      <div>
                        <div>{formatBytes(teacher.totalStorageUsed)}</div>
                        <div className={`text-xs ${getUsageColor(calculateUsagePercentage(teacher.totalStorageUsed, teacher.storageLimit))}`}>
                          ({calculateUsagePercentage(teacher.totalStorageUsed, teacher.storageLimit)}%)
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#0e141b]">
                      {formatBytes(teacher.storageLimit)}
                    </td>
                    <td className="p-4 text-[#0e141b]">
                      {teacher.fileCount} file
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewFiles(teacher)}>
                            Xem danh sách file
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSetStorageLimit(teacher)}>
                            Đặt giới hạn dung lượng
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-[#4e7397]">
              {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} / {totalElements} giáo viên
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Trước
              </Button>
              <span className="px-3 py-2 text-sm text-[#4e7397]">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog hiển thị danh sách file */}
      <Dialog open={showFilesDialog} onOpenChange={setShowFilesDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0e141b]">
              Chi tiết file - {selectedTeacher?.name}
            </DialogTitle>
            <DialogDescription className="text-[#4e7397]">
              Tổng: {formatBytes(selectedTeacher?.totalStorageUsed || 0)} | {selectedTeacher?.fileCount} file
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh]">
            {filesLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {teacherFiles.length === 0 ? (
                  <div className="text-center text-[#4e7397] py-8">
                    Không có file nào
                  </div>
                ) : (
                  teacherFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 border border-[#d0dbe7] rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFileTypeIcon(file.fileType)}</span>
                        <div>
                          <div className="text-sm font-medium text-[#0e141b]">{file.fileName}</div>
                          <div className="text-xs text-[#4e7397]">
                            {formatDate(file.uploadTime)} • {file.fileType.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium text-[#0e141b]">
                            {formatBytes(file.fileSize)}
                          </div>
                        </div>
                        <button
                          onClick={() => handlePreviewFile(file)}
                          title="Xem trước"

                          className="flex items-center gap-2 text-[#1980e6] hover:text-[#0e141b] transition-colors text-sm"
                        >
                          <Eye size={16} />
                        </button>
                        <a
                          href={file.fileUrl}
                          download={file.fileName}
                          title="Tải xuống"
                          className="flex items-center gap-2 text-[#4e7397] hover:text-[#0e141b] transition-colors text-sm"
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      <FilePreviewDialog
        isOpen={showFilePreview}
        onClose={() => setShowFilePreview(false)}
        file={selectedFile}
        teacherName={selectedTeacher?.name}
      />

      {/* Storage Limit Dialog */}
      <StorageLimitDialog
        isOpen={showStorageLimitDialog}
        onClose={() => setShowStorageLimitDialog(false)}
        teacher={selectedTeacherForLimit ? {
          id: selectedTeacherForLimit.id,
          name: selectedTeacherForLimit.name,
          currentLimit: selectedTeacherForLimit.storageLimit
        } : null}
        onSuccess={handleStorageLimitSuccess}
      />
    </div>
  );
};

export default StorageUsagePage;
