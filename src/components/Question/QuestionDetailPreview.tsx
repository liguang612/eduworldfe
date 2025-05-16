import React from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { BorderlessLight } from 'survey-core/themes';
import 'survey-core/survey-core.css';
import "./survey-custom.css";
import type { Question } from '@/api/questionApi';
import { baseURL } from '@/config/axios';

interface QuestionDetailPreviewProps {
  question: Question;
}

const QuestionDetailPreview: React.FC<QuestionDetailPreviewProps> = ({ question }) => {
  const levelColorClasses: { [key: string]: string } = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-blue-100 text-blue-700',
    Hard: 'bg-orange-100 text-orange-700',
    VeryHard: 'bg-red-100 text-red-700',
  };

  const getLevelText = (level: number) => {
    switch (level) {
      case 1:
        return 'Easy';
      case 2:
        return 'Medium';
      case 3:
        return 'Hard';
      case 4:
        return 'VeryHard';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCorrectAnswer = () => {
    if (question.type === 'shortAnswer') {
      return question.choices?.[0]?.value;
    } else if (question.type === 'radio') {
      return question.choices?.find(choice => choice.isCorrect)?.value;
    } else if (question.type === 'checkbox') {
      return question.choices?.filter(choice => choice.isCorrect).map(choice => choice.value);
    } else if (question.type === 'ordering') {
      return question.choices?.map(choice => choice.value);
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
            question.type === 'ordering' ? 'ranking' : 'text',
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

  // Set correct answers based on question type
  if (question.type === 'radio' || question.type === 'checkbox') {
    model.setValue(`question_${question.id}`, getCorrectAnswer());
  } else if (question.type === 'ordering') {
    const orderedChoices = [...(question.choices || [])].sort((a, b) =>
      (a.orderIndex || 0) - (b.orderIndex || 0)
    );
    model.setValue(`question_${question.id}`, orderedChoices.map(c => c.value));
  } else if (question.type === 'shortAnswer') {
    model.setValue(`question_${question.id}`, getCorrectAnswer());
  } else if (question.type === 'itemConnector') {
    console.log(getCorrectAnswer());
    model.setValue(`question_${question.id}`, getCorrectAnswer());
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="flex flex-col gap-4">
        {/* Shared Media */}
        {question.sharedMedia && (
          <div className="mb-4">
            {question.sharedMedia.mediaType === 0 && question.sharedMedia.text && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{question.sharedMedia.text}</p>
              </div>
            )}
            {question.sharedMedia.mediaType === 1 && (
              <audio controls className="w-full">
                <source src={`${baseURL}${question.sharedMedia.mediaUrl}`} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
            {question.sharedMedia.mediaType === 2 && (
              <video controls className="w-full">
                <source src={question.sharedMedia.mediaUrl} type="video/mp4" />
                Your browser does not support the video element.
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
          <h3 className="text-gray-800 font-semibold mb-2">Details:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Created:</strong> {formatDate(question.createdAt)}</p>
            <p><strong>Last updated:</strong> {formatDate(question.updatedAt)}</p>
            {question.categories.length > 0 && (
              <p><strong>Categories:</strong> {question.categories.join(', ')}</p>
            )}
          </div>
          <div className="flex flex-row gap-6 mb-3 items-center">
            <p className="mt-1 text-sm text-gray-600">
              <strong>Level:</strong>{' '}
              <span className={`font-normal px-2 py-0.5 rounded-full text-xs ${levelColorClasses[getLevelText(question.level)] || 'bg-gray-100 text-gray-700'}`}>
                {getLevelText(question.level)}
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              <strong>Type:</strong>{' '}
              <span className="font-normal bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">
                {question.type === 'radio' ? 'Multiple Choice' :
                  question.type === 'checkbox' ? 'Multiple Choice (Multiple)' :
                    question.type === 'itemConnector' ? 'Matching' :
                      question.type === 'ordering' ? 'Sorting' : 'Fill in the Blank'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPreview; 