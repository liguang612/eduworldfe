import React from 'react';
import type { Solution } from '@/api/solutionApi';

interface SolutionListItemProps {
  solution: Solution;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (solutionId: string) => Promise<void>;
}

const SolutionListItem: React.FC<SolutionListItemProps> = ({ solution, isSelected, onSelect }) => {
  return (
    <div
      className={`flex items-center gap-4 bg-white px-4 min-h-[72px] py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
      onClick={() => onSelect(solution.id)}
    >
      <div className="flex items-center gap-4 flex-grow">
        {solution.creatorAvatar ? (
          <img src={`${solution.creatorAvatar}`} alt={solution.creatorName} className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="flex items-center justify-center bg-blue-200 text-blue-700 rounded-full h-14 w-14 shrink-0 text-xl font-bold">
            {solution.creatorName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col justify-center flex-grow">
          <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">
            {solution.creatorName}
          </p>
          <p className="text-[#60758a] text-sm font-normal leading-normal line-clamp-2">
            {`Lớp ${solution.creatorGrade} - ${solution.creatorSchool}`}
          </p>
          <p className="text-[#60758a] text-sm font-normal leading-normal line-clamp-2">
            {new Date(solution.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SolutionListItem; 