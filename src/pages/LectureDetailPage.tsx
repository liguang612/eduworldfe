import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLectureById, deleteLecture } from '../api/lectureApi';
import MyEditor from '../components/Lecture/MyEditor';
import { ConfirmationDialog } from '../components/Common/ConfirmationDialog';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Duration from '@/assets/duration.svg';
import User from '@/assets/user.svg';
import RatingStars from '@/components/Common/RatingStars';
import type { LectureResponse } from '@/api/lectureApi';
import { useAuth } from '@/contexts/AuthContext';

const LectureDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [lecture, setLecture] = useState<LectureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        if (id) {
          const data = await getLectureById(id);
          setLecture(data);
          document.title = data.name;
        }
      } catch (error) {
        console.error('Error fetching lecture:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLecture();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!lecture) {
    return <div>Lecture not found</div>;
  }

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    try {
      await deleteLecture(id);
      toast.success('Xóa bài giảng thành công!');
      navigate(-1); // Navigate back to previous page
    } catch (error) {
      console.error('Error deleting lecture:', error);
      toast.error('Không thể xóa bài giảng. Vui lòng thử lại.');
    } finally {
      closeDeleteDialog();
    }
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <h1 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pb-3 pt-5">
              {lecture.name}
            </h1>
            <div className="flex flex-row gap-4 px-4">
              <div className="flex flex-row items-center">
                <img src={Duration} alt="Duration" />
                <p className="text-[#4e7397] text-sm font-normal leading-normal px-4">{lecture.duration} min</p>
              </div>
              <div className="flex flex-row items-center">
                <img src={User} alt="User" />
                <p className="text-[#4e7397] text-sm font-normal leading-normal px-4">{lecture.teacher.name}</p>
              </div>
              <div className="flex flex-5" />
              {lecture.teacher.id === localStorage.getItem('userId') && <div className="flex px-4 py-3 gap-4 justify-start">
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em]"
                  onClick={() => navigate(`/lectures/${id}/edit`)}
                >
                  <span className="truncate">Sửa</span>
                </button>
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e52020] text-[#ffffff] gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em]"
                  onClick={openDeleteDialog}
                >
                  <span className="truncate">Xoá</span>
                </button>
              </div>}
              {user?.role == 0 && <div className="flex py-3 gap-4 justify-start">
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-[#ffffff] gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em]"
                  onClick={() => navigate('end-questions', { state: { lectureName: lecture.name, subjectId: lecture.subjectId, endQuestionIds: lecture.endQuestions } })}
                >
                  <span className="truncate">Câu hỏi ôn tập</span>
                </button>
              </div>}
            </div>
            <p className="text-[#0e141b] text-base font-normal leading-normal pb-3 pt-6 px-4">
              {lecture.description}
            </p>
            <MyEditor initValue={JSON.parse(lecture.contents)} editable={false} />

            <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Rate and Review this Lecture
            </h3>
            <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
              <div className="flex flex-col gap-2">
                <p className="text-[#0e141b] text-4xl font-black leading-tight tracking-[-0.033em]">4.5</p>
                <RatingStars rating={4.5} />
                <p className="text-[#0e141b] text-base font-normal leading-normal">20 reviews</p>
              </div>
              <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
                <p className="text-[#0e141b] text-sm font-normal leading-normal">5</p>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#d0dbe7]"><div className="rounded-full bg-[#1980e6]" style={{ width: '60%' }}></div></div>
                <p className="text-[#4e7397] text-sm font-normal leading-normal text-right">60%</p>
                <p className="text-[#0e141b] text-sm font-normal leading-normal">4</p>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#d0dbe7]"><div className="rounded-full bg-[#1980e6]" style={{ width: '10%' }}></div></div>
                <p className="text-[#4e7397] text-sm font-normal leading-normal text-right">10%</p>
                <p className="text-[#0e141b] text-sm font-normal leading-normal">3</p>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#d0dbe7]"><div className="rounded-full bg-[#1980e6]" style={{ width: '10%' }}></div></div>
                <p className="text-[#4e7397] text-sm font-normal leading-normal text-right">10%</p>
                <p className="text-[#0e141b] text-sm font-normal leading-normal">2</p>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#d0dbe7]"><div className="rounded-full bg-[#1980e6]" style={{ width: '10%' }}></div></div>
                <p className="text-[#4e7397] text-sm font-normal leading-normal text-right">10%</p>
                <p className="text-[#0e141b] text-sm font-normal leading-normal">1</p>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#d0dbe7]"><div className="rounded-full bg-[#1980e6]" style={{ width: '10%' }}></div></div>
                <p className="text-[#4e7397] text-sm font-normal leading-normal text-right">10%</p>
              </div>
            </div>
            <h3 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Questions and Answers
            </h3>
            <div className="flex flex-col p-4">
              <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#d0dbe7] px-6 py-14">
                <p className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">
                  Ask a question or share your knowledge
                </p>
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]">
                  <span className="truncate">Add question</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-[40px_1fr] gap-x-2 px-4">
              <div className="flex flex-col items-center gap-1 pt-3">
                <div className="text-[#0e141b]" data-icon="ArrowSquareIn" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M128,136v64a8,8,0,0,1-16,0V155.32L45.66,221.66a8,8,0,0,1-11.32-11.32L100.68,144H56a8,8,0,0,1,0-16h64A8,8,0,0,1,128,136ZM208,32H80A16,16,0,0,0,64,48V96a8,8,0,0,0,16,0V48H208V176H160a8,8,0,0,0,0,16h48a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Z"></path></svg>
                </div>
                <div className="w-[1.5px] bg-[#d0dbe7] h-2 grow"></div>
              </div>
              <div className="flex flex-1 flex-col py-3">
                <p className="text-[#0e141b] text-base font-medium leading-normal">When is the next exam?</p>
                <p className="text-[#4e7397] text-base font-normal leading-normal">2 days ago</p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-[1.5px] bg-[#d0dbe7] h-2"></div>
                <div className="text-[#0e141b]" data-icon="ArrowSquareIn" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M128,136v64a8,8,0,0,1-16,0V155.32L45.66,221.66a8,8,0,0,1-11.32-11.32L100.68,144H56a8,8,0,0,1,0-16h64A8,8,0,0,1,128,136ZM208,32H80A16,16,0,0,0,64,48V96a8,8,0,0,0,16,0V48H208V176H160a8,8,0,0,0,0,16h48a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Z"></path></svg>
                </div>
                <div className="w-[1.5px] bg-[#d0dbe7] h-2 grow"></div>
              </div>
              <div className="flex flex-1 flex-col py-3">
                <p className="text-[#0e141b] text-base font-medium leading-normal">How many points are on the exam?</p>
                <p className="text-[#4e7397] text-base font-normal leading-normal">1 day ago</p>
              </div>
              <div className="flex flex-col items-center gap-1 pb-3">
                <div className="w-[1.5px] bg-[#d0dbe7] h-2"></div>
                <div className="text-[#0e141b]" data-icon="ArrowSquareIn" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M128,136v64a8,8,0,0,1-16,0V155.32L45.66,221.66a8,8,0,0,1-11.32-11.32L100.68,144H56a8,8,0,0,1,0-16h64A8,8,0,0,1,128,136ZM208,32H80A16,16,0,0,0,64,48V96a8,8,0,0,0,16,0V48H208V176H160a8,8,0,0,0,0,16h48a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Z"></path></svg>
                </div>
              </div>
              <div className="flex flex-1 flex-col py-3">
                <p className="text-[#0e141b] text-base font-medium leading-normal">How many questions are on the exam?</p>
                <p className="text-[#4e7397] text-base font-normal leading-normal">2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        title="Xác nhận xoá bài giảng"
        message="Bạn có chắc chắn muốn xoá bài giảng này? Hành động này không thể hoàn tác."
        onConfirm={handleConfirmDelete}
        confirmButtonText="Xác nhận xoá"
        cancelButtonText="Huỷ"
        confirmButtonColorClass="bg-red-600 hover:bg-red-700"
      />
      <ToastContainer />
    </div>
  );
};

export default LectureDetailPage;