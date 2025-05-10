import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "../config/axios";

export default function AccountPage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    school: "",
    grade: "",
    address: ""
  });
  const [originalData, setOriginalData] = useState(formData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`/api/auth/users/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const userData = response.data;
          const formattedData = {
            name: userData.name || "",
            birthday: userData.birthday ? userData.birthday.split(" ")[0] : "",
            school: userData.school || "",
            grade: userData.grade?.toString() || "",
            address: userData.address || ""
          };
          setFormData(formattedData);
          setOriginalData(formattedData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const hasChanges = () => {
    return Object.keys(formData).some(key => formData[key as keyof typeof formData] !== originalData[key as keyof typeof originalData]);
  };

  const handleSave = async () => {
    if (!hasChanges()) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/auth/users`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Cập nhật originalData sau khi lưu thành công
      setOriginalData(formData);

      // Cập nhật thông tin user trong AuthContext nếu có thay đổi
      const updatedFields: Record<string, any> = {};
      Object.keys(formData).forEach(key => {
        if (formData[key as keyof typeof formData] !== originalData[key as keyof typeof originalData]) {
          updatedFields[key] = formData[key as keyof typeof formData];
        }
      });

      if (Object.keys(updatedFields).length > 0) {
        updateUser(updatedFields);
      }
    } catch (error: any) {
      setSaveError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Thông tin cá nhân</p>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Họ và tên</p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Ngày sinh</p>
                <input
                  type="date"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Trường học</p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Lớp</p>
                <select
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                >
                  <option value="">Chọn lớp</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Địa chỉ</p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            {hasChanges() && (
              <div className="flex px-4 py-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            )}
            {saveError && (
              <p className="text-red-500 text-sm text-center px-4">{saveError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}