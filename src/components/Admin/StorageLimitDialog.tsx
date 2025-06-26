import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { updateUserStorageLimit } from '@/api/adminApi';

interface StorageLimitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: {
    id: string;
    name: string;
    currentLimit: number;
  } | null;
  onSuccess: () => void;
}

const StorageLimitDialog: React.FC<StorageLimitDialogProps> = ({
  isOpen,
  onClose,
  teacher,
  onSuccess
}) => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('MB');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (teacher && isOpen) {
      // Convert current limit to human readable format
      const currentInMB = Math.round(teacher.currentLimit / (1024 * 1024));
      setValue(currentInMB.toString());
      setUnit('MB');
    }
  }, [teacher, isOpen]);

  const convertToBytes = (value: string, unit: string): number => {
    const numValue = parseFloat(value);
    switch (unit) {
      case 'KB':
        return numValue * 1024;
      case 'MB':
        return numValue * 1024 * 1024;
      case 'GB':
        return numValue * 1024 * 1024 * 1024;
      default:
        return numValue;
    }
  };

  const handleSubmit = async () => {
    if (!teacher || !value || parseFloat(value) <= 0) {
      toast.error('Vui lòng nhập giá trị hợp lệ');
      return;
    }

    setIsLoading(true);
    try {
      const storageLimitInBytes = convertToBytes(value, unit);
      await updateUserStorageLimit(teacher.id, storageLimitInBytes);
      toast.success('Cập nhật giới hạn dung lượng thành công!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Không thể cập nhật giới hạn dung lượng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setValue('');
    setUnit('MB');
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#0e141b]">
            Cập nhật giới hạn dung lượng
          </DialogTitle>
          <DialogDescription className="text-[#4e7397]">
            Đặt giới hạn dung lượng cho {teacher?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right text-sm font-medium text-[#4e7397]">
              Giá trị
            </Label>
            <Input
              id="value"
              type="number"
              min="0"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="col-span-2 border-[#d0dbe7] focus:border-[#1980e6]"
              placeholder="Nhập giá trị..."
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="col-span-2 border-[#d0dbe7] focus:border-[#1980e6]"
            >
              <option value="KB">KB</option>
              <option value="MB">MB</option>
              <option value="GB">GB</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-[#d0dbe7] text-[#4e7397] hover:bg-slate-50"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !value || parseFloat(value) <= 0}
            className="bg-[#1980e6] hover:bg-[#0e141b] text-white"
          >
            {isLoading ? 'Đang cập nhật...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StorageLimitDialog; 