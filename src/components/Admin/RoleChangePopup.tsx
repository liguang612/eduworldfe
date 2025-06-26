import React from 'react';
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";

interface RoleChangePopupProps {
  user: {
    id: string;
    name: string;
    role: number;
  };
  onRoleChange: (userId: string, newRole: number) => void;
}

const RoleChangePopup: React.FC<RoleChangePopupProps> = ({ user, onRoleChange }) => {
  const getRoleOptions = (currentRole: number) => {
    switch (currentRole) {
      case 0:
        return [
          { label: 'Chuyển thành giáo viên', value: 1 },
          { label: 'Chuyển thành quản trị viên', value: 100 }
        ];
      case 1:
        return [
          { label: 'Chuyển thành học sinh', value: 0 },
          { label: 'Chuyển thành quản trị viên', value: 100 }
        ];
      case 100:
        return [
          { label: 'Chuyển thành học sinh', value: 0 },
          { label: 'Chuyển thành giáo viên', value: 1 }
        ];
      default:
        return [
          { label: 'Chuyển thành học sinh', value: 0 },
          { label: 'Chuyển thành giáo viên', value: 1 },
          { label: 'Chuyển thành quản trị viên', value: 100 }
        ];
    }
  };

  const roleOptions = getRoleOptions(user.role);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center justify-between cursor-pointer">
        <span>Thay đổi vai trò</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-48">
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => onRoleChange(user.id, roleOptions[0].value)}
        >
          {roleOptions[0].label}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => onRoleChange(user.id, roleOptions[1].value)}
        >
          {roleOptions[1].label}
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};

export default RoleChangePopup; 