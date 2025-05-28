import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ExamInstructionsProps {
  examId?: string;
  courseId?: string;
}

const ExamInstructionsPage: React.FC<ExamInstructionsProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { examId, courseId, duration, numQuestions, courseName, subjectName, subjectGrade, examTitle, subjectId } = location.state || {};

  const pageStyle: React.CSSProperties = {
    fontFamily: 'Lexend, "Noto Sans", sans-serif',
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleStartExam = () => {
    if (examId && courseId) {
      navigate(`/courses/${courseId}/exams/${examId}/do`, {
        state: {
          examTitle,
          courseName,
          subjectName,
          subjectGrade,
          duration,
          numQuestions,
          subjectId,
        }
      });
    } else {
      toast.error('Không tìm thấy thông tin bài thi.');
    }
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={pageStyle}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <h3 className="text-[#0e141b] tracking-light text-2xl font-bold leading-tight px-4 text-left pb-2 pt-5">
              Thông tin chung
            </h3>
            <div className="px-4 pt-5 mb-4 mx-4 text-[#0e141b] p-3 border rounded-md bg-[rgba(13,124,242,0.2)] border-[#0D7CF2] shadow">
              {examTitle && (
                <p className="text-lg font-semibold leading-tight">
                  Đề thi: {examTitle}
                </p>
              )}
              {(courseName || subjectName) && (
                <p className="text-base font-medium leading-normal mt-1">
                  {courseName && `Lớp học: ${courseName}`}
                  {courseName && subjectName && " - "}
                  {subjectName && `Môn học: ${subjectName}`}
                </p>
              )}
              {duration !== undefined && (
                <p className="text-base font-medium leading-normal mt-1">
                  Thời gian làm bài: {duration} phút
                </p>
              )}
              {numQuestions !== undefined && (
                <p className="text-base font-medium leading-normal mt-1">
                  Số câu hỏi: {numQuestions}
                </p>
              )}
            </div>

            <h3 className="text-[#0e141b] tracking-light text-2xl font-bold leading-tight px-4 text-left pb-2 pt-5">
              Hướng dẫn trước khi làm bài
            </h3>
            <h2 className="text-[#0e141b] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Những điều cần lưu ý
            </h2>
            <p className="text-[#0e141b] text-base font-normal leading-normal pb-3 pt-1 px-4">
              Chào mừng bạn đến với bài kiểm tra. Vui lòng đọc kỹ các hướng dẫn sau đây để đảm bảo bạn có một trải nghiệm làm bài tốt nhất:
              <br /><br />
              <b>1. Các loại câu hỏi:</b> Bài kiểm tra có thể bao gồm nhiều dạng câu hỏi như Trắc nghiệm (chọn 1 đáp án), Đa lựa chọn (chọn nhiều đáp án), Ghép nối, Sắp xếp, Điền vào chỗ trống, và Chọn hình ảnh. Hãy đọc kỹ yêu cầu của từng câu hỏi.
              <br /><br />
              <b>2. Điều hướng:</b> Sử dụng các nút "Trở lại" và "Tiếp theo" để di chuyển giữa các câu hỏi. Bạn cũng có thể click vào số thứ tự câu hỏi ở khung bên trái để chuyển đến câu hỏi bất kỳ.
              <br /><br />
              <b>3. Đánh dấu câu hỏi:</b> Nếu bạn không chắc chắn về câu trả lời hoặc muốn xem lại câu hỏi đó sau, hãy sử dụng biểu tượng cờ (flag) để đánh dấu. Bạn có thể dễ dàng quay lại các câu hỏi đã đánh dấu.
              <br /><br />
              <b>4. Xóa đáp án:</b> Sử dụng biểu tượng thùng rác để xóa lựa chọn hoặc câu trả lời hiện tại của câu hỏi.
              <br /><br />
              <b>5. Theo dõi tiến độ và thời gian:</b> Khung bên trái hiển thị số câu hỏi đã hoàn thành và tổng số câu hỏi. Phía trên có bộ đếm thời gian còn lại. Hãy chú ý theo dõi thời gian để phân bổ hợp lý.
              <br /><br />
              <b>6. Nộp bài:</b> Nút "Nộp bài" nằm ở khung bên trái. Bạn có thể nộp bài bất cứ lúc nào khi còn thời gian. Nếu hết thời gian, hệ thống sẽ tự động nộp bài của bạn.
              <br /><br />
              <b>7. Kết nối mạng:</b> Đảm bảo bạn có kết nối Internet ổn định trong suốt quá trình làm bài để tránh gián đoạn.
              <br /><br />
              <b>8. Lưu tự động:</b> Hệ thống sẽ tự động lưu câu trả lời của bạn. Nếu bạn gặp sự cố kết nối và phải làm mới trang, câu trả lời của bạn sẽ được khôi phục.
              <br /><br />
              Hãy chắc chắn rằng bạn đã chuẩn bị sẵn sàng, kiểm tra kỹ kết nối mạng và các thiết bị cần thiết trước khi bắt đầu. Chúc bạn làm bài thật tốt!
            </p>

            <div className="flex px-4 py-3 justify-end gap-x-3">
              <button
                onClick={handleGoBack}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-slate-200 text-slate-700 text-base font-bold leading-normal tracking-[0.015em] hover:bg-slate-300"
              >
                <span className="truncate">Quay lại</span>
              </button>
              <button
                onClick={handleStartExam}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-[#1568c1] hover:bg-[#125aa0] text-slate-50 text-base font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Bắt đầu làm bài</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default ExamInstructionsPage;