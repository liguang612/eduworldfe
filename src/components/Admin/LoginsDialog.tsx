import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { LoginToday, LoginDetail } from '@/api/adminApi';
import LoginDetailDialog from '@/components/Admin/LoginDetailDialog';

interface LoginsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  logins: LoginToday[];
  title: string;
  isLoading?: boolean;
}

const LoginsDialog: React.FC<LoginsDialogProps> = ({
  isOpen,
  onClose,
  logins,
  title,
  isLoading = false
}) => {
  const [selectedLogin, setSelectedLogin] = React.useState<LoginDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

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

  const handleViewDetails = async (login: LoginToday) => {
    const loginDetail: LoginDetail = {
      id: login.id,
      loginTime: login.loginTime,
      loginMethod: login.loginMethod,
      ipAddress: login.ipAddress,
      userAgent: login.userAgent,
      user: login.user
    };

    setSelectedLogin(loginDetail);
    setIsDetailOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0e141b]">
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : logins.length === 0 ? (
              <div className="text-center py-8 text-[#4e7397]">
                Không có lượt đăng nhập nào trong thời gian này
              </div>
            ) : (
              <div className="space-y-3">
                {logins.map((login, index) => (
                  <div
                    key={login.id || index}
                    className="flex items-center justify-between p-4 bg-white border border-[#d0dbe7] rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={login.user.avatar || '/src/assets/user.svg'}
                        alt={login.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-[#0e141b]">{login.user.name}</h3>
                        <p className="text-sm text-[#4e7397]">{login.user.email}</p>
                        <p className="text-xs text-[#4e7397]">IP: {login.ipAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(login.user.role)}`}>
                        {getRoleLabel(login.user.role)}
                      </span>
                      <div className="text-right">
                        <p className="text-sm text-[#4e7397]">
                          {new Date(login.loginTime).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-xs text-[#4e7397]">
                          {new Date(login.loginTime).toLocaleTimeString('vi-VN')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(login)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedLogin && (
        <LoginDetailDialog
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          loginDetail={selectedLogin}
        />
      )}
    </>
  );
};

export default LoginsDialog; 