import React from 'react';
import type { IndividualQuestion, MultipleChoiceOption, MatchingPair, FillInBlankOption, SortingOption, SelectOption } from './types';
import AddIcon from '@/assets/add.svg';
import RemoveIcon2 from '@/assets/remove2.svg';

interface QuestionChoicesProps {
  question: IndividualQuestion;
  onUpdateChoices: (choices: MultipleChoiceOption[] | MatchingPair[] | FillInBlankOption[] | SortingOption[]) => void;
}

const QuestionChoices: React.FC<QuestionChoicesProps> = ({ question, onUpdateChoices }) => {
  const addMultipleChoice = () => {
    const newChoice: MultipleChoiceOption = {
      id: Date.now().toString(),
      content: '',
      isCorrect: false
    };
    onUpdateChoices([...(question.choices as MultipleChoiceOption[] || []), newChoice]);
  };

  const updateMultipleChoice = (id: string, field: keyof MultipleChoiceOption, value: any) => {
    const updatedChoices = (question.choices as MultipleChoiceOption[]).map(choice =>
      choice.id === id ? { ...choice, [field]: value } : choice
    );
    onUpdateChoices(updatedChoices);
  };

  const toggleMultipleAnswers = (allowMultiple: boolean) => {
    let updatedChoices: MultipleChoiceOption[] = [];

    if (question.choices && (question.choices as MultipleChoiceOption[]).length > 0) {
      updatedChoices = (question.choices as MultipleChoiceOption[]).map(choice => ({
        ...choice,
        allowMultiple
      }));
    } else {
      updatedChoices = [
        {
          id: Date.now().toString(),
          content: '',
          isCorrect: false,
          allowMultiple
        }
      ];
    }

    onUpdateChoices(updatedChoices);
  };

  const addMatchingItem = (side: 'left' | 'right') => {
    const existingPairs = question.choices as MatchingPair[] || [];
    let newPairs: MatchingPair[] = [...existingPairs];

    // When adding a left item, add a pair with only the left side populated
    if (side === 'left') {
      newPairs.push({
        id: Date.now().toString(),
        text: '',
        side: 'left'
      });
    }
    // When adding a right item, add a pair with only the right side populated
    else if (side === 'right') {
      newPairs.push({
        id: Date.now().toString(),
        text: '',
        side: 'right'
      });
    }

    onUpdateChoices(newPairs);
  };

  const updateMatchingPair = (id: string, value: string) => {
    const updatedPairs = (question.choices as MatchingPair[]).map(pair =>
      pair.id === id ? { ...pair, 'text': value } : pair
    );
    onUpdateChoices(updatedPairs);
  };

  const addSortingOption = () => {
    const existingOptions = question.choices as SortingOption[] || [];
    const newOption: SortingOption = {
      id: Date.now().toString(),
      content: '',
      order: existingOptions.length + 1
    };
    onUpdateChoices([...existingOptions, newOption]);
  };

  const updateSortingOption = (id: string, content: string) => {
    const updatedOptions = (question.choices as SortingOption[]).map(option =>
      option.id === id ? { ...option, content } : option
    );
    onUpdateChoices(updatedOptions);
  };

  const removeChoice = (id: string) => {
    switch (question.questionType) {
      case 'Multiple Choice':
        onUpdateChoices((question.choices as MultipleChoiceOption[] || []).filter(choice => choice.id !== id));
        break;
      case 'Matching':
        onUpdateChoices((question.choices as MatchingPair[] || []).filter(choice => choice.id !== id));
        break;
      case 'Sorting':
        onUpdateChoices((question.choices as SortingOption[] || []).filter(option => option.id !== id));
        break;
      case 'Select':
        onUpdateChoices((question.choices as SelectOption[] || []).filter(choice => choice.id !== id));
        break;
    }
  };

  switch (question.questionType) {
    case 'Multiple Choice':
      return (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(question.choices as MultipleChoiceOption[])?.[0]?.allowMultiple || false}
                onChange={(e) => toggleMultipleAnswers(e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Cho phép chọn nhiều đáp án</span>
            </label>
          </div>
          <h4 className="text-sm font-medium text-gray-700">Các lựa chọn:</h4>
          {(question.choices as MultipleChoiceOption[] || []).map((choice, index) => (
            <div key={choice.id} className="flex items-center gap-3">
              <input
                type="text"
                value={choice.content}
                onChange={(e) => updateMultipleChoice(choice.id, 'content', e.target.value)}
                placeholder={`Lựa chọn ${index + 1}`}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => removeChoice(choice.id)}
                className="text-red-500 hover:text-red-700"
              >
                <img src={RemoveIcon2} alt="Remove" />
              </button>
            </div>
          ))}
          <button
            onClick={addMultipleChoice}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
            </svg>
            Thêm lựa chọn
          </button>
        </div>
      );

    case 'Matching':
      console.log(question.choices);
      return (
        <div className="mt-4 space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Các cặp ghép:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h5 className="text-sm font-medium text-gray-600">Cột trái</h5>
                <button
                  onClick={() => addMatchingItem('left')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <img src={AddIcon} alt="Add" />
                </button>
              </div>
              {(question.choices as MatchingPair[] || []).map((pair, index) => (pair.side === 'left' &&
                <div key={pair.id} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={pair.text}
                    onChange={(e) => updateMatchingPair(pair.id, e.target.value)}
                    placeholder={`Item ${index + 1}`}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => removeChoice(pair.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <img src={RemoveIcon2} alt="Remove" />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h5 className="text-sm font-medium text-gray-600">Cột phải</h5>
                <button
                  onClick={() => addMatchingItem('right')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <img src={AddIcon} alt="Add" />
                </button>
              </div>
              {(question.choices as MatchingPair[] || []).map((pair, index) => (pair.side === 'right' &&
                <div key={pair.id} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={pair.text}
                    onChange={(e) => updateMatchingPair(pair.id, e.target.value)}
                    placeholder={`Item ${index + 1}`}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => removeChoice(pair.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <img src={RemoveIcon2} alt="Remove" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'Sorting':
      return (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Các mục sắp xếp:</h4>
          {(question.choices as SortingOption[] || []).map((option, index) => (
            <div key={option.id} className="flex items-center gap-3">
              <input
                type="text"
                value={option.content}
                onChange={(e) => updateSortingOption(option.id, e.target.value)}
                placeholder={`Mục ${index + 1}`}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => removeChoice(option.id)}
                className="text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={addSortingOption}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
            </svg>
            Thêm mục sắp xếp
          </button>
        </div>
      );

    case 'Fill in the Blank':
      return null;

    default:
      return null;
  }
};

export default QuestionChoices; 