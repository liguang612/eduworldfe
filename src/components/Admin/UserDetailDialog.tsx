import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import type { UserResponse } from '@/api/adminApi';

interface UserDetailDialogProps {
  user: UserResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  const getRoleLabel = (role: number) => {
    switch (role) {
      case 0: return 'Học sinh';
      case 1: return 'Giáo viên';
      case 100: return 'Admin';
      default: return 'Không xác định';
    }
  };

  const getRoleColor = (role: number) => {
    switch (role) {
      case 0: return 'bg-green-100 text-green-800';
      case 1: return 'bg-blue-100 text-blue-800';
      case 100: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#0e141b]">Chi tiết người dùng</DialogTitle>
          <DialogDescription className="text-[#4e7397]">
            Thông tin chi tiết của {user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Avatar và thông tin cơ bản */}
          <div className="flex items-center gap-4">
            <img
              src={user.avatar || '/src/assets/user.svg'}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="flex-1">
              <p className="font-bold text-lg text-[#0e141b]">{user.name}</p>
              <p className="text-sm text-[#4e7397]">{user.email}</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getRoleColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-block w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-xs text-[#4e7397]">
                  {user.isActive ? 'Đang hoạt động' : 'Đã bị khóa'}
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin cá nhân */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold text-[#0e141b]">Thông tin cá nhân</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-[#4e7397]">Ngày sinh</Label>
                <p className="text-[#0e141b] mt-1">
                  {user.birthday ? formatDate(user.birthday) : 'Chưa cập nhật'}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-[#4e7397]">Trường học</Label>
                <p className="text-[#0e141b] mt-1">
                  {user.school || 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            {user.role === 0 && (
              <div>
                <Label className="text-sm font-medium text-[#4e7397]">Lớp</Label>
                <p className="text-[#0e141b] mt-1">
                  {user.grade ? `Lớp ${user.grade}` : 'Chưa cập nhật'}
                </p>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-[#4e7397]">Địa chỉ</Label>
              <p className="text-[#0e141b] mt-1">
                {user.address || 'Chưa cập nhật'}
              </p>
            </div>
          </div>

          {/* Thông tin tài khoản */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold text-[#0e141b]">Thông tin tài khoản</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-[#4e7397]">ID người dùng</Label>
                <p className="text-[#0e141b] mt-1 font-mono text-sm">{user.id}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-[#4e7397]">Ngày tham gia</Label>
                <p className="text-[#0e141b] mt-1">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            {user.searchScore !== undefined && (
              <div>
                <Label className="text-sm font-medium text-[#4e7397]">Điểm tìm kiếm</Label>
                <p className="text-[#0e141b] mt-1">
                  {(user.searchScore * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailDialog; 