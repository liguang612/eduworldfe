import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Legend, CartesianGrid, Tooltip } from 'recharts';
import { Users, BookOpen, FileText, Activity } from 'lucide-react';
import StatCard from '@/components/Admin/StatCard';
import CustomTooltip from '@/components/Admin/CustomTooltip';
import UserDetailDialog from '@/components/Admin/UserDetailDialog';
import LoginDetailDialog from '@/components/Admin/LoginDetailDialog';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getDashboardData, getNewUsersInMonth, getLoginsInDay } from '@/api/adminApi';
import type { DashboardResponse, NewUserToday, LoginToday, LoginDetail } from '@/api/adminApi';
import { toast } from 'react-toastify';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [newUsers, setNewUsers] = useState<NewUserToday[]>([]);
  const [logins, setLogins] = useState<LoginToday[]>([]);
  const [newUsersLoading, setNewUsersLoading] = useState(false);
  const [loginsLoading, setLoginsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedChart, setSelectedChart] = useState<'monthly' | 'daily' | null>(null);

  const [selectedUser, setSelectedUser] = useState<NewUserToday | null>(null);
  const [selectedLogin, setSelectedLogin] = useState<LoginDetail | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isLoginDetailOpen, setIsLoginDetailOpen] = useState(false);

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

  const formatMonthlyData = (data: DashboardResponse['monthlyUserChart']) => {
    return data.map(item => ({
      month: new Date(item.month).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
      teachers: item.teacherCount,
      students: item.studentCount,
      total: item.teacherCount + item.studentCount
    }));
  };

  const formatDailyData = (data: DashboardResponse['dailyUserChart']) => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' }),
      teachers: item.teacherCount,
      students: item.studentCount,
      total: item.teacherCount + item.studentCount
    }));
  };

  const handleMonthlyChartClick = async (data: any) => {
    if (!data || !data.activeLabel) return;

    setNewUsersLoading(true);
    setSelectedPeriod(data.activeLabel);
    setSelectedChart('monthly');

    try {
      const parts = data.activeLabel.split(' ');
      if (parts.length !== 3 && parts.length !== 2) {
        throw new Error('Invalid date format');
      }

      let monthStr: string;
      let yearStr: string;

      if (parts.length === 3) {
        // Format: "thg 5 2025" (Vietnamese)
        if (parts[0] === 'thg') {
          monthStr = parts[1];
          yearStr = parts[2];
        } else {
          throw new Error('Invalid Vietnamese date format');
        }
      } else {
        // Format: "May 2025" (English)
        monthStr = parts[0];
        yearStr = parts[1];
      }

      let month: number;

      if (!isNaN(parseInt(monthStr))) {
        month = parseInt(monthStr);
        if (month < 1 || month > 12) {
          throw new Error('Invalid month number');
        }
      } else {
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const monthIndex = monthNames.findIndex(name =>
          name.toLowerCase() === monthStr.toLowerCase()
        );

        if (monthIndex === -1) {
          throw new Error('Invalid month name');
        }

        month = monthIndex + 1;
      }

      const year = parseInt(yearStr);

      if (isNaN(year)) {
        throw new Error('Invalid year');
      }

      const users = await getNewUsersInMonth(year, month);

      const sortedUsers = users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNewUsers(sortedUsers);

      setLogins([]);
    } catch (error) {
      console.error('Failed to get new users for month:', error);
      toast.error('Không thể lấy danh sách người dùng đăng ký mới');
    } finally {
      setNewUsersLoading(false);
    }
  };

  const handleDailyChartClick = async (data: any) => {
    if (!data || !data.activeLabel) return;

    setLoginsLoading(true);
    setSelectedPeriod(data.activeLabel);
    setSelectedChart('daily');

    try {
      const parts = data.activeLabel.split(' ');
      if (parts.length !== 3 && parts.length !== 2) {
        throw new Error('Invalid date format');
      }

      let dayStr: string;
      let monthStr: string;

      if (parts.length === 3) {
        // Format: "15 thg 5" (Vietnamese)
        if (parts[1] === 'thg') {
          dayStr = parts[0];
          monthStr = parts[2];
        } else {
          throw new Error('Invalid Vietnamese date format');
        }
      } else {
        // Format: "15 May" (English)
        dayStr = parts[0];
        monthStr = parts[1];
      }

      const currentYear = new Date().getFullYear();

      let month: number;

      if (!isNaN(parseInt(monthStr))) {
        month = parseInt(monthStr);
        if (month < 1 || month > 12) {
          throw new Error('Invalid month number');
        }
      } else {
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const monthIndex = monthNames.findIndex(name =>
          name.toLowerCase() === monthStr.toLowerCase()
        );

        if (monthIndex === -1) {
          throw new Error('Invalid month name');
        }

        month = monthIndex + 1;
      }

      const day = parseInt(dayStr);

      if (isNaN(day) || day < 1 || day > 31) {
        throw new Error('Invalid day');
      }

      const formattedDate = `${currentYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

      const loginData = await getLoginsInDay(formattedDate);
      const sortedLogins = loginData.sort((a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime());
      setLogins(sortedLogins);
      setNewUsers([]);
    } catch (error) {
      console.error('Failed to get logins for day:', error);
      toast.error('Không thể lấy danh sách lượt đăng nhập');
    } finally {
      setLoginsLoading(false);
    }
  };

  // Handle detail view
  const handleViewUserDetails = (user: NewUserToday) => {
    setSelectedUser(user);
    setIsUserDetailOpen(true);
  };

  const handleViewLoginDetails = async (login: LoginToday) => {
    const loginDetail: LoginDetail = {
      id: login.id,
      loginTime: login.loginTime,
      loginMethod: login.loginMethod,
      ipAddress: login.ipAddress,
      userAgent: login.userAgent,
      user: login.user
    };

    setSelectedLogin(loginDetail);
    setIsLoginDetailOpen(true);
  };

  // Helper functions for display
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
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title="Học sinh"
          value={dashboardData.stats.totalStudents.toString()}
          icon={<BookOpen size={24} />}
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title="Người dùng hoạt động hôm nay"
          value={dashboardData.stats.todayActiveUsers.toString()}
          icon={<FileText size={24} />}
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title="Lượt đăng nhập hôm nay"
          value={dashboardData.stats.todayLogins.toString()}
          icon={<Activity size={24} />}
          onClick={() => navigate('/admin/users')}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-[#d0dbe7]">
          <h3 className="text-lg font-bold text-[#0e141b]">Tăng trưởng người dùng theo tháng</h3>
          <p className="text-sm text-[#4e7397]">12 tháng gần nhất • <span className="text-blue-600 font-medium">Click để xem chi tiết người dùng đăng ký</span></p>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyChartData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                onClick={handleMonthlyChartClick}
                style={{ cursor: 'pointer' }}
              >
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
          <p className="text-sm text-[#4e7397]">30 ngày gần nhất • <span className="text-blue-600 font-medium">Click để xem chi tiết lượt đăng nhập</span></p>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyChartData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                onClick={handleDailyChartClick}
                style={{ cursor: 'pointer' }}
              >
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

      {/* Data Lists */}
      {selectedChart === 'monthly' && (
        <div className="bg-white p-6 rounded-xl border border-[#d0dbe7]">
          <h3 className="text-lg font-bold text-[#0e141b] mb-4">
            Người dùng đăng ký mới - {selectedPeriod}
          </h3>

          {newUsersLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : newUsers.length === 0 ? (
            <div className="text-center py-8 text-[#4e7397]">
              Không có người dùng nào đăng ký trong tháng này
            </div>
          ) : (
            <div className="space-y-3">
              {newUsers.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-[#d0dbe7] rounded-lg hover:bg-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={user.avatar || '/src/assets/user.svg'}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-[#0e141b]">{user.name}</h4>
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
                    <button
                      onClick={() => handleViewUserDetails(user)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedChart === 'daily' && (
        <div className="bg-white p-6 rounded-xl border border-[#d0dbe7]">
          <h3 className="text-lg font-bold text-[#0e141b] mb-4">
            Lượt đăng nhập - {selectedPeriod}
          </h3>

          {loginsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : logins.length === 0 ? (
            <div className="text-center py-8 text-[#4e7397]">
              Không có lượt đăng nhập nào trong ngày này
            </div>
          ) : (
            <div className="space-y-3">
              {logins.map((login, index) => (
                <div
                  key={login.id || index}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-[#d0dbe7] rounded-lg hover:bg-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={login.user.avatar || '/src/assets/user.svg'}
                      alt={login.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-[#0e141b]">{login.user.name}</h4>
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
                    <button
                      onClick={() => handleViewLoginDetails(login)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Dialogs */}
      {selectedUser && (
        <UserDetailDialog
          isOpen={isUserDetailOpen}
          onClose={() => setIsUserDetailOpen(false)}
          user={{
            id: selectedUser.id,
            email: selectedUser.email,
            name: selectedUser.name,
            avatar: selectedUser.avatar,
            school: selectedUser.school,
            grade: selectedUser.grade,
            address: selectedUser.address,
            role: selectedUser.role,
            birthday: selectedUser.birthday,
            createdAt: selectedUser.createdAt,
            isActive: selectedUser.isActive,
            storageLimit: selectedUser.storageLimit,
            searchScore: undefined,
            totalStorageUsed: undefined,
            fileCount: undefined
          }}
        />
      )}

      {selectedLogin && (
        <LoginDetailDialog
          isOpen={isLoginDetailOpen}
          onClose={() => setIsLoginDetailOpen(false)}
          loginDetail={selectedLogin}
        />
      )}
    </div>
  )
}

export default DashboardPage; 