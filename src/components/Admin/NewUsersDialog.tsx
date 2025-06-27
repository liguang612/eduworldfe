import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { NewUserToday } from '@/api/adminApi';
import UserDetailDialog from './UserDetailDialog';

interface NewUsersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  users: NewUserToday[];
  title: string;
  isLoading?: boolean;
}

const NewUsersDialog: React.FC<NewUsersDialogProps> = ({
  isOpen,
  onClose,
  users,
  title,
  isLoading = false
}) => {
  const [selectedUser, setSelectedUser] = React.useState<NewUserToday | null>(null);
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

  const handleViewDetails = (user: NewUserToday) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-[#4e7397]">
                Không có người dùng nào đăng ký trong thời gian này
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white border border-[#d0dbe7] rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatar || '/src/assets/user.svg'}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-[#0e141b]">{user.name}</h3>
                        <p className="text-sm text-[#4e7397]">{user.email}</p>
                        {user.school && (
                          <p className="text-sm text-[#4e7397]">{user.school}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                      <div className="text-right">
                        <p className="text-sm text-[#4e7397]">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-xs text-[#4e7397]">
                          {new Date(user.createdAt).toLocaleTimeString('vi-VN')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(user)}
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

      {selectedUser && (
        <UserDetailDialog
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          user={{
            id: 'temp-id',
            email: selectedUser.email,
            name: selectedUser.name,
            avatar: selectedUser.avatar,
            school: selectedUser.school,
            role: selectedUser.role,
            createdAt: selectedUser.createdAt,
            isActive: true,
            birthday: undefined,
            grade: undefined,
            address: undefined
          }}
        />
      )}
    </>
  );
};

export default NewUsersDialog; 