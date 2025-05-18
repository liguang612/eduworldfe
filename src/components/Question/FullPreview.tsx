import React, { useCallback } from 'react';
import type { FullQuestionSetData } from './types';
import SharedMediaPreview from './SharedMediaPreview';
import IndividualQuestionPreview from './IndividualQuestionPreview';

interface IncompleteQuestion {
  index: number;
  issues: string[];
}

interface SurveyValue {
  type: string;
  name: string;
  question: {
    name: string;
    title: string;
    leftItems?: string;
    rightItems?: string;
  };
  value: any;
}

const FullPreview: React.FC<{
  data: FullQuestionSetData,
  onSurveyValueChange?: (questionId: string, value: SurveyValue) => void
}> = ({ data, onSurveyValueChange }) => {
  // Check for incomplete questions
  const incompleteQuestions: IncompleteQuestion[] = data.questions.map((q, index) => {
    const issues: string[] = [];
    if (!q.questionText.trim()) {
      issues.push('chưa nhập nội dung câu hỏi');
    }
    if (!q.level) {
      issues.push('chưa chọn độ khó');
    }
    if (!q.type) {
      issues.push('chưa chọn loại câu hỏi');
    }
    if (q.type !== 'Fill in the Blank' && (!q.choices || q.choices.length === 0)) {
      issues.push('chưa thêm lựa chọn');
    }
    return issues.length > 0 ? { index: index + 1, issues } : null;
  }).filter((q): q is IncompleteQuestion => q !== null);

  const handleSurveyValueChange = useCallback((questionId: string, value: SurveyValue) => {
    if (onSurveyValueChange) {
      onSurveyValueChange(questionId, value);
    }
  }, [onSurveyValueChange]);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg h-full">
      <h2 className="text-xl font-bold text-[#0e141b]">Kết quả & Đáp án</h2>
      <p className="text-[#4e7397] text-sm font-normal leading-normal mb-4">
        Lựa chọn đáp án cho (các) câu hỏi của bạn ở đây. Đây sẽ là các đáp án đúng của các câu hỏi được sử dụng trong bài kiểm tra.
      </p>
      <SharedMediaPreview media={data.sharedMedia} />
      {data.questions.length > 0 ? (
        data.questions.map((q, index) => (
          <IndividualQuestionPreview
            key={q.id}
            question={q}
            index={index}
            onValueChange={(value) => handleSurveyValueChange(q.id, value)}
          />
        ))
      ) : (
        <p className="text-gray-500 italic">Chưa có câu hỏi nào được thêm.</p>
      )}
      <div className="mt-6 border-gray-200">
        {incompleteQuestions.length > 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm font-medium text-yellow-800 mb-2">Các câu hỏi chưa hoàn thiện:</p>
            <ul className="list-disc list-inside space-y-1">
              {incompleteQuestions.map((q) => (
                <li key={q.index} className="text-sm text-yellow-700">
                  Câu hỏi {q.index}: {q.issues.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-gray-400">Tất cả các câu hỏi đã được hoàn thiện.</p>
        )}
      </div>
    </div>
  );
};

export default FullPreview;