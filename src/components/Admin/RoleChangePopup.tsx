import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface RoleChangePopupProps {
  onRoleChange: (role: number) => void;
  currentRole: number;
}

const RoleChangePopup: React.FC<RoleChangePopupProps> = ({ onRoleChange, currentRole }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 px-2 py-1 text-sm">
          Thay đổi role
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => onRoleChange(0)}
          disabled={currentRole === 0}
          className="flex items-center justify-between"
        >
          <span>Chuyển thành Học sinh</span>
          {currentRole === 0 && <span className="text-xs text-gray-500">(Hiện tại)</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onRoleChange(1)}
          disabled={currentRole === 1}
          className="flex items-center justify-between"
        >
          <span>Chuyển thành Giáo viên</span>
          {currentRole === 1 && <span className="text-xs text-gray-500">(Hiện tại)</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onRoleChange(100)}
          disabled={currentRole === 100}
          className="flex items-center justify-between"
        >
          <span>Chuyển thành Admin</span>
          {currentRole === 100 && <span className="text-xs text-gray-500">(Hiện tại)</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoleChangePopup; 