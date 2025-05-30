import React from 'react';
import RemoveIcon from '@/assets/remove.svg';
import ApproveIcon from '@/assets/approve.svg';
import RejectIcon from '@/assets/reject.svg';

interface MemberItemProps {
  id: string;
  name: string;
  avatar: string;
  email: string;
  onRemove: ((id: string) => void) | undefined;
  onSelect: (id: string) => void;
  onReject: (id: string) => void;
  onApprove: (id: string) => void;
}

export const AssistantItem: React.FC<MemberItemProps> = ({ id, name, avatar, email, onRemove, onSelect }) => {
  return (
    <div
      key={id}
      className="w-full sm:w-[calc((100%_-_16px)_/_2)] lg:w-[calc((100%_-_32px)_/_3)] bg-slate-50 px-4 py-2 min-h-[72px] rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
      onClick={() => { onSelect(id) }}
    >
      <div className="flex items-center gap-4">
        <div
          className="bg-center bg-no-repeat bg-cover aspect-square h-14 w-14 rounded-full"
          style={{ backgroundImage: `url("${avatar ? `${avatar}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || 'U')}")` }}
        ></div>
        <div className="flex flex-col justify-center">
          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">{name}</p>
          <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">{email}</p>
        </div>
      </div>
      {onRemove && <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(id); }}
        className="text-[#0e141b] flex items-center justify-center size-7 rounded-md hover:bg-gray-100 active:bg-gray-200 transition shrink-0"
        aria-label="Remove member"
      >
        <img src={RemoveIcon} alt="Remove" className="size-5" />
      </button>}
    </div>
  );
};

export const StudentItem: React.FC<MemberItemProps> = ({ id, name, avatar, email, onRemove, onSelect }) => {
  return (
    <div
      key={id}
      className="w-full sm:w-[calc((100%_-_16px)_/_2)] lg:w-[calc((100%_-_32px)_/_3)] bg-slate-50 px-4 py-2 min-h-[72px] rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
      onClick={() => { onSelect(id) }}
    >
      <div className="flex items-center gap-4">
        <div
          className="bg-center bg-no-repeat bg-cover aspect-square h-14 w-14 rounded-full"
          style={{ backgroundImage: `url("${avatar ? `${avatar}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || 'U')}")` }}
        ></div>
        <div className="flex flex-col justify-center">
          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">{name}</p>
          <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">{email}</p>
        </div>
      </div>
      {onRemove && <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(id); }}
        className="text-[#0e141b] flex items-center justify-center size-7 rounded-md hover:bg-gray-100 active:bg-gray-200 transition shrink-0"
        aria-label="Remove member"
      >
        <img src={RemoveIcon} alt="Remove" className="size-5" />
      </button>}
    </div>
  );
};

export const RequestItem: React.FC<MemberItemProps> = ({ id, name, avatar, email, onReject, onApprove, onSelect }) => {
  return (
    <div
      key={id}
      className="w-full sm:w-[calc((100%_-_16px)_/_2)] lg:w-[calc((100%_-_32px)_/_3)] bg-slate-50 px-4 py-2 min-h-[72px] rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
      onClick={() => { onSelect(id) }}
    >
      <div className="flex items-center gap-4">
        <div
          className="bg-center bg-no-repeat bg-cover aspect-square h-14 w-14 rounded-full"
          style={{ backgroundImage: `url("${avatar ? `${avatar}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || 'U')}")` }}
        ></div>
        <div className="flex flex-col justify-center">
          <p className="text-[#0e141b] text-base font-medium leading-normal line-clamp-1">{name}</p>
          <p className="text-[#4e7397] text-sm font-normal leading-normal line-clamp-2">{email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onReject(id); }}
        className="text-[#0e141b] flex items-center justify-center size-7 rounded-md hover:bg-gray-100 active:bg-gray-200 transition shrink-0"
        aria-label="Reject request"
      >
        <img src={RejectIcon} alt="Reject" className="size-5" />
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onApprove(id); }}
        className="text-[#0e141b] flex items-center justify-center size-7 rounded-md hover:bg-gray-100 active:bg-gray-200 transition shrink-0"
        aria-label="Approve request"
      >
        <img src={ApproveIcon} alt="Approve" className="size-5" />
      </button>
    </div>
  );
}; 