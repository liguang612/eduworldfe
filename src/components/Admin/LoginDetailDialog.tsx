import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { LoginDetail } from '@/api/adminApi';

interface LoginDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loginDetail: LoginDetail;
}

const LoginDetailDialog: React.FC<LoginDetailDialogProps> = ({
  isOpen,
  onClose,
  loginDetail
}) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#0e141b]">
            Chi tiết phiên đăng nhập
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-[#0e141b] mb-3">Thông tin người dùng</h3>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={loginDetail.user.avatar || '/src/assets/user.svg'}
                alt={loginDetail.user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h4 className="font-medium text-[#0e141b]">{loginDetail.user.name}</h4>
                <p className="text-sm text-[#4e7397]">{loginDetail.user.email}</p>
                {loginDetail.user.school && (
                  <p className="text-sm text-[#4e7397]">{loginDetail.user.school}</p>
                )}
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(loginDetail.user.role)}`}>
                {getRoleLabel(loginDetail.user.role)}
              </span>
            </div>
          </div>

          {/* Login Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-[#0e141b] mb-3">Thông tin đăng nhập</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#4e7397]">Thời gian đăng nhập</label>
                <p className="text-[#0e141b] mt-1">
                  {new Date(loginDetail.loginTime).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-[#4e7397]">Phương thức đăng nhập</label>
                <p className="text-[#0e141b] mt-1 capitalize">{loginDetail.loginMethod}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-[#4e7397]">Địa chỉ IP</label>
                <p className="text-[#0e141b] mt-1 font-mono">{loginDetail.ipAddress}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-[#4e7397]">ID phiên</label>
                <p className="text-[#0e141b] mt-1 font-mono text-xs break-all">{loginDetail.id}</p>
              </div>
            </div>
          </div>

          {/* User Agent Information */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-[#0e141b] mb-3">Thông tin trình duyệt</h3>
            <div>
              <label className="text-sm font-medium text-[#4e7397]">User Agent</label>
              <p className="text-[#0e141b] mt-1 text-sm break-all bg-white p-2 rounded border">
                {loginDetail.userAgent}
              </p>
            </div>
          </div>

          {/* Additional User Details */}
          {(loginDetail.user.grade !== undefined || loginDetail.user.id) && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#0e141b] mb-3">Thông tin bổ sung</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#4e7397]">ID người dùng</label>
                  <p className="text-[#0e141b] mt-1 font-mono text-sm">{loginDetail.user.id}</p>
                </div>

                {loginDetail.user.grade !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-[#4e7397]">Lớp</label>
                    <p className="text-[#0e141b] mt-1">Lớp {loginDetail.user.grade}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDetailDialog; 