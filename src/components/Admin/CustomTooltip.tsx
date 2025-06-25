import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  chartType?: 'monthly' | 'daily';
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, chartType = 'monthly' }) => {
  if (active && payload && payload.length) {
    const teachers = payload.find(item => item.dataKey === 'teachers')?.value || 0;
    const students = payload.find(item => item.dataKey === 'students')?.value || 0;
    const total = teachers + students;

    // Màu sắc cho từng biểu đồ
    const teacherColor = chartType === 'monthly' ? '#1980e6' : '#ff7300';
    const studentColor = chartType === 'monthly' ? '#82ca9d' : '#ffc658';

    return (
      <div className="bg-white p-3 border border-[#d0dbe7] rounded-lg shadow-lg">
        <p className="font-semibold text-[#0e141b] mb-2">
          {chartType === 'monthly' ? `Tháng: ${label}` : `Ngày: ${label}`}
        </p>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span style={{ color: teacherColor }}>● Giáo viên:</span>
            <span className="font-medium">{teachers}</span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: studentColor }}>● Học sinh:</span>
            <span className="font-medium">{students}</span>
          </div>
          <div className="border-t border-[#d0dbe7] pt-1 mt-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#0e141b]">Tổng:</span>
              <span className="font-bold text-[#0e141b]">{total}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CustomTooltip; 