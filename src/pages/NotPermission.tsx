import React from 'react';

const NotPermission: React.FC = () => {
  return (
    <div className="flex flex-col items-center pt-16 gap-8">
      <h1 className="text-2xl font-bold">403 - Không có quyền truy cập</h1>
      <p className="text-lg">Bạn không có quyền xem trang này.</p>
      <p>Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.</p>
    </div>
  );
};

export default NotPermission; 