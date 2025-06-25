import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Legend, CartesianGrid, Tooltip } from 'recharts';
import { Users, BookOpen, FileText, Activity } from 'lucide-react';
import StatCard from '@/components/Admin/StatCard';
import CustomTooltip from '@/components/Admin/CustomTooltip';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getDashboardData } from '@/api/adminApi';
import type { DashboardResponse } from '@/api/adminApi';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format monthly data for chart
  const formatMonthlyData = (data: DashboardResponse['monthlyUserChart']) => {
    return data.map(item => ({
      month: new Date(item.month).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
      teachers: item.teacherCount,
      students: item.studentCount,
      total: item.teacherCount + item.studentCount
    }));
  };

  // Format daily data for chart
  const formatDailyData = (data: DashboardResponse['dailyUserChart']) => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' }),
      teachers: item.teacherCount,
      students: item.studentCount,
      total: item.teacherCount + item.studentCount
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center text-red-600">
        Không thể tải dữ liệu dashboard
      </div>
    );
  }

  const monthlyChartData = formatMonthlyData(dashboardData.monthlyUserChart);
  const dailyChartData = formatDailyData(dashboardData.dailyUserChart);

  return (
    <div className="space-y-6">
      <h1 className="text-[#0e141b] tracking-light text-[28px] font-bold leading-tight mb-6">Tổng quan</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Giáo viên"
          value={dashboardData.stats.totalTeachers.toString()}
          icon={<Users size={24} />}
          change="+18.1%"
          changeType='increase'
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title="Học sinh"
          value={dashboardData.stats.totalStudents.toString()}
          icon={<BookOpen size={24} />}
          change="+20.1%"
          changeType='increase'
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title="Người dùng hoạt động hôm nay"
          value={dashboardData.stats.todayActiveUsers.toString()}
          icon={<FileText size={24} />}
          change="-3.2%"
          changeType='decrease'
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title="Lượt đăng nhập hôm nay"
          value={dashboardData.stats.todayLogins.toString()}
          icon={<Activity size={24} />}
          change="+5.4%"
          changeType='increase'
          onClick={() => navigate('/admin/users')}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-[#d0dbe7]">
          <h3 className="text-lg font-bold text-[#0e141b]">Tăng trưởng người dùng theo tháng</h3>
          <p className="text-sm text-[#4e7397]">12 tháng gần nhất</p>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#4e7397" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#4e7397" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip chartType="monthly" />} />
                <Legend
                  formatter={(value) => value === 'teachers' ? 'Giáo viên' : value === 'students' ? 'Học sinh' : 'Tổng'}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="teachers"
                  stackId="1"
                  stroke="#1980e6"
                  fill="#1980e6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#d0dbe7]">
          <h3 className="text-lg font-bold text-[#0e141b]">Lượt truy cập theo ngày</h3>
          <p className="text-sm text-[#4e7397]">30 ngày gần nhất</p>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#4e7397" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#4e7397" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip chartType="daily" />} />
                <Legend
                  formatter={(value) => value === 'teachers' ? 'Giáo viên' : value === 'students' ? 'Học sinh' : 'Tổng'}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stackId="1"
                  stroke="#ffc658"
                  fill="#ffc658"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="teachers"
                  stackId="1"
                  stroke="#ff7300"
                  fill="#ff7300"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage; 