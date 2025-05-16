import React, { useMemo, useState, useEffect } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { BorderlessLight } from 'survey-core/themes';
import type { IndividualQuestion, MultipleChoiceOption, MatchingPair, SortingOption } from './types';
import 'survey-core/survey-core.css';
import "./survey-custom.css";

interface SurveyElement {
  name: string;
  title: string;
  type: string;
  choices?: Array<{ value: string; text: string }>;
  leftItems?: string;
  rightItems?: string;
  placeHolder?: string;
  items?: Array<{ value: string; text: string }>;
}

interface SurveyJson {
  elements: SurveyElement[];
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

const IndividualQuestionPreview: React.FC<{
  question: IndividualQuestion,
  index: number,
  onValueChange?: (value: SurveyValue) => void
}> = ({ question, index, onValueChange }) => {
  const [surveyModel, setSurveyModel] = useState<Model | null>(null);
  const [surveyValue, setSurveyValue] = useState<SurveyValue | null>(null);

  const levelColorClasses: { [key: string]: string } = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-blue-100 text-blue-700',
    Hard: 'bg-orange-100 text-orange-700',
    VeryHard: 'bg-red-100 text-red-700',
  };

  const surveyJson = useMemo(() => {
    const baseJson: SurveyJson = {
      elements: [{
        name: `question_${question.id}`,
        title: question.questionText.length == 0 ? '  ' : question.questionText,
        type: '',
        choices: []
      }]
    };

    switch (question.questionType) {
      case 'Multiple Choice':
        baseJson.elements[0].type = (question.choices as MultipleChoiceOption[])?.[0]?.allowMultiple ? 'checkbox' : 'radiogroup';
        baseJson.elements[0].choices = (question.choices as MultipleChoiceOption[] || []).map(choice => ({
          value: choice.id,
          text: choice.content || "Chưa có nội dung"
        }));
        break;

      case 'Matching':
        baseJson.elements[0].type = 'itemConnector';
        const leftItems = (question.choices as MatchingPair[] || []).filter(pair => pair.side === 'left').map(pair => ({
          id: pair.id,
          label: pair.text || "Chưa có nội dung"
        }));
        const rightItems = (question.choices as MatchingPair[] || []).filter(pair => pair.side === 'right').map(pair => ({
          id: pair.id,
          label: pair.text || "Chưa có nội dung"
        }));
        baseJson.elements[0].leftItems = JSON.stringify(leftItems);
        baseJson.elements[0].rightItems = JSON.stringify(rightItems);
        break;

      case 'Sorting':
        baseJson.elements[0].type = 'ranking';
        baseJson.elements[0].choices = (question.choices as SortingOption[] || []).map(option => ({
          value: option.id,
          text: option.content || "Chưa có nội dung"
        }));
        break;

      case 'Fill in the Blank':
        baseJson.elements[0].type = 'text';
        baseJson.elements[0].placeHolder = 'Nhập câu trả lời (+ Enter để xác nhận)';
        break;
    }

    return baseJson;
  }, [question]);

  useEffect(() => {
    const model = new Model(surveyJson);
    model.applyTheme(BorderlessLight);
    model.showCompleteButton = false;
    model.isReadOnly = false;

    console.log(model);

    model.onComplete.add(() => false);
    // Prevent the survey from moving to the next page
    model.onCurrentPageChanging.add(() => false);

    model.onValueChanged.add((_, options) => {
      const value: SurveyValue = {
        type: options.question.type,
        name: options.question.name,
        question: {
          name: options.question.name,
          title: options.question.title,
          leftItems: options.question.leftItems,
          rightItems: options.question.rightItems
        },
        value: options.value
      };

      setSurveyValue(value);
      if (onValueChange) {
        onValueChange(value);
      }
    });

    setSurveyModel(model);

    // Cleanup function to prevent memory leaks
    return () => {
      model.dispose();
    };
  }, [surveyJson]);

  return (
    <div className="mb-4 p-4 border rounded-md bg-white shadow">
      <h4 className="font-semibold text-gray-800 mb-2">Câu hỏi {index + 1}</h4>
      <div className="flex flex-row gap-6 mb-3 items-center">
        <p className="mt-1 text-sm text-gray-600">
          <strong>Độ khó:</strong> <span className={`font-normal px-2 py-0.5 rounded-full text-xs ${levelColorClasses[question.level] || 'bg-gray-100 text-gray-700'}`}>{question.level}</span>
        </p>
        <p className="mt-1 text-sm text-gray-600">
          <strong>Loại:</strong> <span className="font-normal bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{question.questionType}</span>
        </p>
      </div>
      <div className="survey-container">
        {surveyModel && <Survey model={surveyModel} key={`survey_${question.id}_${JSON.stringify(surveyJson)}`} />}
      </div>
    </div>
  );
};

export default IndividualQuestionPreview; 