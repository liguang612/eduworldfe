import React from 'react';
import type { Question } from '@/api/questionApi';
import QuestionDetailPreview from '../Question/QuestionDetailPreview';

interface QuestionPreviewSectionProps {
  question: Question;
}

const QuestionPreviewSection: React.FC<QuestionPreviewSectionProps> = ({ question }) => {
  return (
    <div className="mb-6 rounded-lg bg-slate-50">
      <h2 className="text-[20px] font-bold leading-tight text-[#0e141b] mb-4 pt-4">Câu hỏi</h2>
      <QuestionDetailPreview question={question} showFunction={false} />
    </div>
  );
};

export default QuestionPreviewSection; 