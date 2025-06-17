import React, { useState } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { BorderlessLight } from 'survey-core/themes';
import 'survey-core/survey-core.css';
import "./survey-custom.css";
import type { Question } from '@/api/questionApi';
import { getLevelText } from '@/api/questionApi';
import { useNavigate } from 'react-router-dom';
import { ConfirmationDialog } from '../Common/ConfirmationDialog';
import { deleteQuestion } from '@/api/questionApi';
import { toast } from 'react-toastify';

interface QuestionDetailPreviewProps {
  question: Question;
  onQuestionDeleted?: () => void;
  showFunction?: boolean;
}

const QuestionDetailPreview: React.FC<QuestionDetailPreviewProps> = ({ question, onQuestionDeleted, showFunction = true }) => {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const role = JSON.parse(localStorage.getItem('user') || '{}').role;

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteQuestion(question.id);
      toast.success('Xóa câu hỏi thành công!');
      if (onQuestionDeleted) {
        onQuestionDeleted();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Không thể xóa câu hỏi. Vui lòng thử lại.');
    } finally {
      closeDeleteDialog();
    }
  };

  const levelColorClasses: { [key: string]: string } = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-blue-100 text-blue-700',
    Hard: 'bg-orange-100 text-orange-700',
    VeryHard: 'bg-red-100 text-red-700',
  };

  const getCorrectAnswer = () => {
    if (question.type === 'shortAnswer') {
      return question.choices?.[0]?.value;
    } else if (question.type === 'radio') {
      return question.choices?.find(choice => choice.isCorrect)?.value;
    } else if (question.type === 'checkbox') {
      return question.choices?.filter(choice => choice.isCorrect).map(choice => choice.value);
    } else if (question.type === 'ranking') {
      const orderedChoices = [...(question.choices || [])].sort((a, b) =>
        (a.orderIndex || 0) - (b.orderIndex || 0)
      );
      return orderedChoices.map(choice => choice.value);
    } else if (question.type === 'itemConnector') {
      return question.matchingPairs;
    } else {
      return question.choices?.filter(choice => choice.isCorrect).map(choice => choice.value);
    }
  };

  const surveyJson = {
    elements: [{
      name: `question_${question.id}`,
      title: question.title,
      type: question.type === 'radio' ? 'radiogroup' :
        question.type === 'checkbox' ? 'checkbox' :
          question.type === 'itemConnector' ? 'itemConnector' :
            question.type === 'ranking' ? 'ranking' : 'text',
      choices: question.choices?.map(choice => {
        return {
          id: choice.id,
          value: choice.value,
          text: choice.text,
          isCorrect: choice.isCorrect,
          orderIndex: choice.orderIndex
        };
      }),
      leftItems: question.matchingColumns?.filter(column => column.side === 'left').map(column => {
        return {
          id: column.id,
          label: column.label
        }
      }),
      rightItems: question.matchingColumns?.filter(column => column.side === 'right').map(column => {
        return {
          id: column.id,
          label: column.label
        }
      }),
    }]
  };

  const model = new Model(surveyJson);
  model.applyTheme(BorderlessLight);
  model.showCompleteButton = false;
  model.mode = 'display';

  if (question.type === 'radio' || question.type === 'checkbox') {
    model.setValue(`question_${question.id}`, getCorrectAnswer());
  } else if (question.type === 'ranking') {
    model.setValue(`question_${question.id}`, getCorrectAnswer());
  } else if (question.type === 'shortAnswer') {
    model.setValue(`question_${question.id}`, getCorrectAnswer());
  } else if (question.type === 'itemConnector') {
    model.setValue(`question_${question.id}`, getCorrectAnswer());
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="flex flex-col gap-4">
        {/* Action Buttons */}
        {role === 1 && showFunction && (
          <div className="flex justify-end gap-3 mb-4">
            <button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#0D7CF2] text-slate-50 text-sm font-bold leading-normal mr-12"
              onClick={() => navigate(`/question-bank/${question.id}/solutions`, { state: { subjectId: question.subjectId } })}
            >
              <span className="truncate">Lời giải</span>
            </button>
            <button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal"
              onClick={() => navigate(`/question-bank/${question.id}/edit`, { state: { subjectId: question.subjectId } })}
            >
              <span className="truncate">Sửa câu hỏi</span>
            </button>
            <button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#E52020] text-slate-50 text-sm font-bold leading-normal"
              onClick={openDeleteDialog}
            >
              <span className="truncate">Xoá câu hỏi</span>
            </button>
          </div>
        )}

        {/* Shared Media */}
        {question.sharedMedia && (
          <div className="mb-4">
            {question.sharedMedia.mediaType === 0 && question.sharedMedia.text && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{question.sharedMedia.text}</p>
              </div>
            )}
            {question.sharedMedia.mediaType === 1 && question.sharedMedia.mediaUrl && (
              <div className="rounded-lg items-center justify-center flex-row">
                <img src={`${question.sharedMedia.mediaUrl}`} alt="Shared Media" className="max-w-full h-auto rounded-lg" />
              </div>
            )}
            {question.sharedMedia.mediaType === 2 && (
              <audio controls className="w-full">
                <source src={`${question.sharedMedia.mediaUrl}`} type="audio/mpeg" />
                Định dạng file không được hỗ trợ
              </audio>
            )}
            {question.sharedMedia.mediaType === 3 && question.sharedMedia.mediaUrl && (
              <video controls className="w-full">
                <source src={`${question.sharedMedia.mediaUrl}`} type="video/mp4" />
                Định dạng file không được hỗ trợ
              </video>
            )}
          </div>
        )}

        {/* Question Content */}
        <div className="survey-container">
          <Survey model={model} />
        </div>

        {/* Question Details */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-gray-800 font-semibold mb-2">Chi tiết:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Môn học:</strong> {question.subjectName}</p>
            {question.categories.length > 0 && (
              <p><strong>Danh mục:</strong> {question.categories.join(', ')}</p>
            )}
          </div>
          <div className="flex flex-row gap-6 mb-3 items-center">
            <p className="mt-1 text-sm text-gray-600">
              <strong>Cấp độ:</strong>{' '}
              <span className={`font-normal px-2 py-0.5 rounded-full text-xs ${levelColorClasses[getLevelText(question.level)] || 'bg-gray-100 text-gray-700'}`}>
                {getLevelText(question.level)}
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              <strong>Loại câu hỏi:</strong>{' '}
              <span className="font-normal bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">
                {question.type === 'radio' ? 'Trắc nghiệm lựa chọn đáp án' :
                  question.type === 'checkbox' ? 'Trắc nghiệm lựa chọn nhiều đáp án' :
                    question.type === 'itemConnector' ? 'Ghép đôi' :
                      question.type === 'ranking' ? 'Sắp xếp' : 'Điền vào chỗ trống'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        title="Xác nhận xoá câu hỏi"
        message="Bạn có chắc chắn muốn xoá câu hỏi này? Hành động này không thể hoàn tác."
        onConfirm={handleConfirmDelete}
        confirmButtonText="Xoá"
        cancelButtonText="Huỷ"
        confirmButtonColorClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default QuestionDetailPreview; 