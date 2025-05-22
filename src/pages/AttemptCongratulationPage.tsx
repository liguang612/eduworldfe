import React from 'react';
import Congratulation from '@/assets/congratulations.svg';

const AttemptCongratulationPage: React.FC = () => {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      <div className="flex flex-col items-center p-5">
        <div className="layout-content-container flex flex-col w-full max-w-[512px] py-5 items-center">
          <img src={Congratulation} alt="Congratulation" className="w-48 h-48" />
          <h1 className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-2">
            Chúc mừng bạn đã hoàn thành bài thi!
          </h1>
          <p className="text-[#0e141b] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
            Bạn có thể xem lại bài làm và điểm số của mình. Nếu có bất kỳ vấn đề gì, hãy báo với giáo viên/ trợ giảng của lớp.
          </p>
          <div className="flex px-4 py-3 w-full sm:w-auto">
            <button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#0D7CF2] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]"
            >
              <span className="truncate">Xem kết quả</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptCongratulationPage;