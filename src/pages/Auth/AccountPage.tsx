import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/config/axios";
import { toast } from "react-toastify";
import { updateUserAvatar } from "@/api/authApi";

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

  const [selectedAvatarPreview, setSelectedAvatarPreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    if (user?.avatar) setSelectedAvatarPreview(`${user?.avatar}`);
  }, [user?.id]);

  const handleAvatarClick = () => {
    document.getElementById('avatarUpload')?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      handleInputChange(event);
    }
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
      await axios.put(`/api/auth/users`, formData, {
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

      if (selectedFile) {
        try {
          const newUser = await updateUserAvatar(selectedFile);
          if (newUser) {
            toast.success('Cập nhật avatar thành công!');
            updateUser({ ...newUser });
          } else {
            toast.warning('Không thể cập nhật avatar');
          }
        } catch (error) {
          toast.warning('Không thể cập nhật avatar');
        }
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
          <div className="flex flex-col md:flex-row gap-8 p-4">
            <div className="flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
              <div className="flex flex-wrap justify-between gap-3 pt-4">
                <p className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight min-w-72">Thông tin cá nhân</p>
              </div>
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 pt-1 pb-6">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-[24px] font-medium leading-normal pb-2">{user?.role === 0 ? "Học sinh" : "Giáo viên"}</p>
                </label>
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
              {user?.role === 0 && <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
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
              </div>}
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
          <div className="md:w-1/3 flex flex-col items-center">
            <div
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-colors aspect-square max-w-xs mx-auto"
              onClick={handleAvatarClick}
            >
              {selectedAvatarPreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={selectedAvatarPreview}
                    alt="Selected avatar"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-gray-400 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[#0e141b] text-base font-medium leading-normal mb-1">Class avatar</p>
                  <p className="text-[#4e7397] text-sm font-normal leading-normal">
                    Drag & drop or <span className="text-blue-600 font-semibold">click to upload</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleAvatarChange}
                id="avatarUpload"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}