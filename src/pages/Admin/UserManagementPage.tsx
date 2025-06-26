import React, { useState, useMemo, useEffect } from 'react';
import { MoreHorizontal, ArrowUpDown, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import UserDetailDialog from '@/components/Admin/UserDetailDialog';
import PasswordDisplayDialog from '@/components/Admin/PasswordDisplayDialog';
import RoleChangePopup from '@/components/Admin/RoleChangePopup';
import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog';
import type { UserResponse, UserSearchRequest } from '@/api/adminApi';
import { searchUsers, changeUserRole, toggleUserStatus, resetUserPassword } from '@/api/adminApi';
import { toast } from 'react-toastify';
import { useDebounce } from '@/hooks/use-debounce';

type SortKey = keyof UserResponse | '';

const UserManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Data
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Dialogs
  const [isRoleChangeOpen, setIsRoleChangeOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isPasswordDisplayOpen, setIsPasswordDisplayOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [actionUser, setActionUser] = useState<UserResponse | null>(null);
  const [pendingRole, setPendingRole] = useState<number>(0);

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    if (debouncedSearchTerm) {
      setIsSearching(true);
    }
    try {
      const request: UserSearchRequest = {
        name: debouncedSearchTerm || undefined,
        email: debouncedSearchTerm || undefined,
        role: roleFilter,
        isActive: statusFilter,
        page: currentPage,
        size: pageSize
      };

      const response = await searchUsers(request);
      setUsers(response.users);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearchTerm, roleFilter, statusFilter, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchTerm, roleFilter, statusFilter]);

  const handleViewDetails = (user: UserResponse) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleRoleChange = (userId: string, newRole: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setActionUser(user);
    setPendingRole(newRole);
    setIsRoleChangeOpen(true);
  };

  const confirmRoleChange = async () => {
    if (!actionUser) return;

    try {
      await changeUserRole(actionUser.id, pendingRole);
      toast.success('Thay đổi vai trò thành công!');
      fetchUsers();
    } catch (error: any) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsRoleChangeOpen(false);
      setActionUser(null);
    }
  };

  const handleToggleStatus = (user: UserResponse) => {
    setActionUser(user);
    setIsBlockDialogOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!actionUser) return;

    try {
      await toggleUserStatus(actionUser.id);
      toast.success(actionUser.isActive ? 'Đã khóa tài khoản!' : 'Đã mở khóa tài khoản!');
      fetchUsers(); // Refresh data
    } catch (error: any) {
      toast.error('Không thể thay đổi trạng thái tài khoản');
    } finally {
      setIsBlockDialogOpen(false);
      setActionUser(null);
    }
  };

  const handleResetPassword = (user: UserResponse) => {
    setActionUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const confirmResetPassword = async () => {
    if (!actionUser) return;

    try {
      const password = await resetUserPassword(actionUser.id);
      setNewPassword(password);
      setIsPasswordDisplayOpen(true);
    } catch (error: any) {
      toast.error('Không thể reset mật khẩu');
    } finally {
      setIsResetPasswordDialogOpen(false);
      setActionUser(null);
    }
  };

  const sortedUsers = useMemo(() => {
    let sortableUsers = [...users];
    if (sortKey) {
      sortableUsers.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (aValue === undefined || bValue === undefined) return 0;

        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

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

  const SortableHeader = ({ children, sortKey: key }: { children: React.ReactNode, sortKey: SortKey }) => (
    <th className="px-4 py-3 text-left text-[#0e141b] text-sm font-bold leading-normal cursor-pointer hover:bg-slate-100" onClick={() => handleSort(key)}>
      <div className="flex items-center gap-2">
        {children}
        {sortKey === key && <ArrowUpDown className="h-4 w-4" />}
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#0e141b] tracking-light text-[28px] font-bold leading-tight">Quản lý người dùng</h1>
        <p className="text-[#4e7397] mt-1">Xem, quản lý và chỉnh sửa vai trò người dùng.</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#d0dbe7]">
        {/* Search and Filters */}
        <div className="mb-4 space-y-4">
          <div className="flex gap-4">
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
            <select
              value={roleFilter || ''}
              onChange={(e) => setRoleFilter(e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-2 rounded-lg border border-[#d0dbe7] focus:outline-none focus:ring-2 focus:ring-[#1980e6] focus:border-transparent text-sm"
            >
              <option value="">Tất cả vai trò</option>
              <option value="0">Học sinh</option>
              <option value="1">Giáo viên</option>
              <option value="100">Admin</option>
            </select>
            <select
              value={statusFilter === undefined ? '' : statusFilter.toString()}
              onChange={(e) => setStatusFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
              className="px-4 py-2 rounded-lg border border-[#d0dbe7] focus:outline-none focus:ring-2 focus:ring-[#1980e6] focus:border-transparent text-sm"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đã khóa</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-[#d0dbe7]">
          <table className="w-full">
            <thead>
              <tr className="bg-white">
                <SortableHeader sortKey="name">Người dùng</SortableHeader>
                <SortableHeader sortKey="role">Vai trò</SortableHeader>
                <SortableHeader sortKey="birthday">Ngày sinh</SortableHeader>
                <SortableHeader sortKey="createdAt">Ngày tham gia</SortableHeader>
                <SortableHeader sortKey="isActive">Trạng thái</SortableHeader>
                <th className="px-4 py-3 text-left text-[#0e141b] text-sm font-bold leading-normal">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#4e7397]">
                    Đang tải...
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#4e7397]">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => (
                  <tr key={user.id} className="border-t border-t-[#d0dbe7] hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || '/src/assets/user.svg'}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-[#0e141b]">{user.name}</p>
                          <p className="text-sm text-[#4e7397]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#0e141b]">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="p-4 text-[#0e141b]">
                      {user.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : 'Không có'}
                    </td>
                    <td className="p-4 text-[#4e7397]">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm text-[#4e7397]">
                          {user.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </span>
                      </div>
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
                          <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                            Xem chi tiết
                          </DropdownMenuItem>
                          <RoleChangePopup user={user} onRoleChange={handleRoleChange} />
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                            {user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                            Reset mật khẩu
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-[#4e7397]">
              {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} / {totalElements} người dùng
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

      {/* Dialogs */}
      <UserDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        user={selectedUser}
      />

      <ConfirmationDialog
        isOpen={isRoleChangeOpen}
        onClose={() => setIsRoleChangeOpen(false)}
        title="Xác nhận thay đổi vai trò"
        message={`Bạn có chắc chắn muốn thay đổi vai trò của ${actionUser?.name} thành ${getRoleLabel(pendingRole)}?`}
        onConfirm={confirmRoleChange}
        confirmButtonText="Xác nhận"
        cancelButtonText="Hủy"
        confirmButtonColorClass="bg-blue-600 hover:bg-blue-700"
      />

      <ConfirmationDialog
        isOpen={isBlockDialogOpen}
        onClose={() => setIsBlockDialogOpen(false)}
        title={actionUser?.isActive ? "Xác nhận khóa tài khoản" : "Xác nhận mở khóa tài khoản"}
        message={`Bạn có chắc chắn muốn ${actionUser?.isActive ? 'khóa' : 'mở khóa'} tài khoản của ${actionUser?.name}?`}
        onConfirm={confirmToggleStatus}
        confirmButtonText="Xác nhận"
        cancelButtonText="Hủy"
        confirmButtonColorClass={actionUser?.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
      />

      <ConfirmationDialog
        isOpen={isResetPasswordDialogOpen}
        onClose={() => setIsResetPasswordDialogOpen(false)}
        title="Xác nhận reset mật khẩu"
        message={`Bạn có chắc chắn muốn reset mật khẩu của ${actionUser?.name}? Mật khẩu mới sẽ được hiển thị sau khi xác nhận.`}
        onConfirm={confirmResetPassword}
        confirmButtonText="Xác nhận"
        cancelButtonText="Hủy"
        confirmButtonColorClass="bg-orange-600 hover:bg-orange-700"
      />

      <PasswordDisplayDialog
        isOpen={isPasswordDisplayOpen}
        onClose={() => setIsPasswordDisplayOpen(false)}
        password={newPassword}
        userName={actionUser?.name || ''}
      />
    </div>
  );
}

export default UserManagementPage; 