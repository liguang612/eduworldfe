import React, { useMemo, useState, useEffect } from 'react';
import { Model } from 'survey-core';
import type { ValueChangedEvent } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { BorderlessLight } from 'survey-core/themes';
import type { IndividualQuestion, MultipleChoiceOption, SortingOption, FillInBlankOption, MatchingColumn } from './types';
import 'survey-core/survey-core.css';
import "./survey-custom.css";
import { getLevelText, getTypeText } from '@/api/questionApi';

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
  const [model, setModel] = useState<Model | null>(null);
  const [_, setSurveyValue] = useState<SurveyValue | null>(null);

  const levelColorClasses: { [key: number]: string } = {
    1: 'bg-green-100 text-green-700',
    2: 'bg-blue-100 text-blue-700',
    3: 'bg-orange-100 text-orange-700',
    4: 'bg-red-100 text-red-700',
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

    switch (question.type) {
      case 'radio':
        baseJson.elements[0].type = (question.choices as MultipleChoiceOption[])?.[0]?.allowMultiple ? 'checkbox' : 'radiogroup';
        baseJson.elements[0].choices = (question.choices as MultipleChoiceOption[] || []).map(choice => ({
          value: choice.value || choice.id,
          text: choice.content || "Chưa có nội dung"
        }));
        break;

      case 'checkbox':
        baseJson.elements[0].type = 'checkbox';
        baseJson.elements[0].choices = (question.choices as MultipleChoiceOption[] || []).map(choice => ({
          value: choice.value || choice.id,
          text: choice.content || "Chưa có nội dung"
        }));
        break;

      case 'itemConnector':
        baseJson.elements[0].type = 'itemConnector';
        const matchingChoices = question.choices as MatchingColumn[] || [];
        baseJson.elements[0].leftItems = JSON.stringify(matchingChoices
          .filter(column => column.side === 'left')
          .map(column => ({
            id: column.id,
            label: column.text
          })));
        baseJson.elements[0].rightItems = JSON.stringify(matchingChoices
          .filter(column => column.side === 'right')
          .map(column => ({
            id: column.id,
            label: column.text
          })));
        break;

      case 'ranking':
        baseJson.elements[0].type = 'ranking';
        const rankingChoices = (question.choices as SortingOption[] || [])
          .map(option => ({
            value: option.value || option.id,
            text: option.content || "Chưa có nội dung"
          }));

        baseJson.elements[0].choices = rankingChoices;
        break;

      case 'shortAnswer':
        baseJson.elements[0].type = 'text';
        baseJson.elements[0].placeHolder = 'Nhập câu trả lời (+ Enter để xác nhận)';
        break;
    }

    return baseJson;
  }, [question]);

  const getCorrectAnswer = () => {
    switch (question.type) {
      case 'radio':
        const mcChoices = question.choices as MultipleChoiceOption[];
        return mcChoices.find(choice => choice.isCorrect)?.value;
      case 'checkbox':
        const mcOptions = question.choices as MultipleChoiceOption[];
        return mcOptions.filter(option => option.isCorrect).map(option => option.value);
      case 'itemConnector':
        return question.matchingPairs;
      case 'ranking':
        const sortingChoices = question.choices as SortingOption[];
        return sortingChoices
          .filter(option => option.orderIndex !== null)
          .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
          .map(choice => choice.value);
      case 'shortAnswer':
        return (question.choices as FillInBlankOption[])?.[0]?.value;
      default:
        return null;
    }
  };

  useEffect(() => {
    const newModel = new Model(surveyJson);
    newModel.applyTheme(BorderlessLight);
    newModel.showCompleteButton = false;
    newModel.isReadOnly = false;
    newModel.questionType = question.type;

    const correctAnswer = getCorrectAnswer();
    if (correctAnswer) {
      newModel.setValue(`question_${question.id}`, correctAnswer);
    }

    newModel.onComplete.add(() => false);
    newModel.onCurrentPageChanging.add(() => false);

    const valueChangedHandler = (_: Model, options: ValueChangedEvent) => {
      const value: SurveyValue = {
        type: options.question.getType(),
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
    };

    newModel.onValueChanged.add(valueChangedHandler);
    setModel(newModel);

    return () => {
      if (newModel) {
        // newModel.onValueChanged.remove(valueChangedHandler);
        newModel.onComplete.clear();
        newModel.onCurrentPageChanging.clear();
        newModel.dispose();
      }
    };
  }, [surveyJson, question.type]);

  return (
    <div className="mb-4 p-4 border rounded-md bg-white shadow">
      <h4 className="font-semibold text-gray-800 mb-2">Câu hỏi {index + 1}</h4>
      <div className="flex flex-row gap-6 mb-3 items-center">
        <p className="mt-1 text-sm text-gray-600">
          <strong>Độ khó:</strong> <span className={`font-normal px-2 py-0.5 rounded-full text-xs ${levelColorClasses[question.level] || 'bg-gray-100 text-gray-700'}`}>{getLevelText(question.level)}</span>
        </p>
        <p className="mt-1 text-sm text-gray-600">
          <strong>Loại:</strong> <span className="font-normal bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{getTypeText(question.type)}</span>
        </p>
      </div>
      <div className="survey-container">
        {model && (
          <Survey model={model} />
        )}
      </div>
    </div>
  );
};

export default IndividualQuestionPreview; 