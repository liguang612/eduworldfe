import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="flex justify-center flex-col gap-6 px-5 py-10 text-center @container">
      <div className="flex gap-6 justify-center @[480px]:flex-row ">
        <a className="text-[#4e7397] text-base font-normal leading-normal min-w-40" href="#">
          Terms
        </a>
        <a className="text-[#4e7397] text-base font-normal leading-normal min-w-40" href="#">
          Privacy
        </a>
        <a className="text-[#4e7397] text-base font-normal leading-normal min-w-40" href="#">
          Security
        </a>
        <a className="text-[#4e7397] text-base font-normal leading-normal min-w-40" href="#">
          Status
        </a>
        <a className="text-[#4e7397] text-base font-normal leading-normal min-w-40" href="#">
          Docs
        </a>
        <a className="text-[#4e7397] text-base font-normal leading-normal min-w-40" href="#">
          Contact
        </a>
        <a className="text-[#4e7397] text-base font-normal leading-normal min-w-40" href="#">
          Help Center
        </a>
      </div>
      <p className="text-[#4e7397] text-base font-normal leading-normal">© 2025 EduWorld</p>
    </footer>
  );
};

export default Footer;