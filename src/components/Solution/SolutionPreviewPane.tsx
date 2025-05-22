import React from 'react';
import MyEditor from '../Lecture/MyEditor';
import type { Solution } from '@/api/solutionApi';
import { baseURL } from '@/config/axios';
import DeleteIcon from '@/assets/delete_white.svg';

interface SolutionPreviewPaneProps {
  solution: Solution | null;
  onDelete?: (solutionId: string) => Promise<void>;
}

const SolutionPreviewPane: React.FC<SolutionPreviewPaneProps> = ({ solution, onDelete }) => {
  if (!solution) {
    return (
      <div className="p-6 bg-gray-50 h-full flex items-center justify-center rounded-lg border-l border-gray-200">
        <p className="text-gray-500 text-lg">Chọn một lời giải để xem chi tiết</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white h-full overflow-y-auto border-l border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        {solution.creatorAvatar ? (
          <img src={`${baseURL}${solution.creatorAvatar}`} alt={solution.creatorName} className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="flex items-center justify-center rounded-full h-12 w-12 text-xl font-bold bg-blue-200 text-blue-700">
            {solution.creatorName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="text-[#111418] text-xl font-semibold">{solution.creatorName}</h3>
          <p className="text-xs text-gray-500">{`Lớp ${solution.creatorGrade} - ${solution.creatorSchool}`}</p>
          <p className="text-xs text-gray-500">{new Date(solution.createdAt).toLocaleDateString()}</p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(solution.id)}
            className="ml-auto p-2 text-slate-50 focus:outline-none bg-red-600 rounded-lg px-2 py-1"
            aria-label="Xóa lời giải"
          >
            <div className="flex flex-row items-center gap-2 p-1">
              <img src={DeleteIcon} alt="Delete" className="w-6 h-6" />
              <p className="text-slate-50 hover:text-red-800 font-medium focus:outline-none">Xóa</p>
            </div>
          </button>
        )}
      </div>
      <MyEditor key={solution.id} initValue={JSON.parse(solution.content)} editable={false} />
    </div>
  );
};

export default SolutionPreviewPane;