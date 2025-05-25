import type { Question } from "@/api/questionApi";
import { useNavigate } from 'react-router-dom';

const FormatCorrectAnswer: React.FC<{ correctAnswerData: any; question: Question }> = ({ correctAnswerData, question }) => {
  const navigate = useNavigate();

  if (correctAnswerData === undefined || correctAnswerData === null) {
    return <p className="text-sm text-gray-700">Không có thông tin đáp án cho câu hỏi này.</p>;
  }

  let displayElements: React.ReactNode;

  switch (question.type) {
    case 'radio': {
      const choice = question.choices?.find(c => String(c.value) === String(correctAnswerData));
      displayElements = choice ? <span className="text-green-700 font-medium">{choice.text}</span> : <span className="text-gray-700">{JSON.stringify(correctAnswerData)}</span>;
      break;
    }
    case 'checkbox': {
      if (Array.isArray(correctAnswerData)) {
        const texts = correctAnswerData.map(val => {
          const choice = question.choices?.find(c => String(c.value) === String(val));
          return choice ? choice.text : String(val);
        });
        displayElements = (
          <ul className="list-disc list-inside ml-1">
            {texts.map((text, index) => <li key={index} className="text-green-700 font-medium">{text}</li>)}
          </ul>
        );
      } else {
        const choice = question.choices?.find(c => String(c.value) === String(correctAnswerData));
        displayElements = choice ? <span className="text-green-700 font-medium">{choice.text}</span> : <span className="text-gray-700">{JSON.stringify(correctAnswerData)}</span>;
      }
      break;
    }
    case 'text':
      displayElements = <span className="text-green-700 font-medium">{correctAnswerData}</span>;
      break;
    case 'ranking': {
      if (Array.isArray(correctAnswerData)) {
        const texts = correctAnswerData.map((val) => {
          const choice = question.choices?.find(c => String(c.value) === String(val));
          return `${choice ? choice.text : String(val)}`;
        });
        displayElements = (
          <ol className="list-decimal list-inside ml-1">
            {texts.map((text, index) => <li key={index} className="text-green-700 font-medium">{text}</li>)}
          </ol>
        );
      } else {
        displayElements = <span className="text-gray-700">{JSON.stringify(correctAnswerData)}</span>;
      }
      break;
    }
    case 'itemConnector': {
      if (Array.isArray(correctAnswerData)) {
        if (correctAnswerData.length > 0) {
          const matches = correctAnswerData.map((pair: { from: string; to: string }, index: number) => {
            const leftItem = question.matchingColumns?.find(c => String(c.id) === String(pair.from) && c.side === 'left');
            const rightItem = question.matchingColumns?.find(c => String(c.id) === String(pair.to) && c.side === 'right');
            return `${leftItem ? leftItem.label : `ID cột trái: ${pair.from}`} → ${rightItem ? rightItem.label : `ID cột phải: ${pair.to}`}`;
          });
          displayElements = (
            <ul className="list-disc list-inside ml-1">
              {matches.map((match, index) => <li key={index} className="text-green-700 font-medium">{match}</li>)}
            </ul>
          );
        } else {
          displayElements = <span className="text-sm text-gray-700">Không có cặp nối nào là đáp án đúng.</span>;
        }
      } else {
        displayElements = <span className="text-gray-700">Định dạng đáp án không mong muốn.</span>;
      }
      break;
    }
    default:
      displayElements = <span className="text-gray-700">{JSON.stringify(correctAnswerData)}</span>;
  }

  return (
    <div className="mt-1 flex flex-row items-center">
      <div className="flex-1">
        {displayElements}
      </div>
      {question.id && (
        <button
          onClick={() => navigate(`/question-bank/${question.id}/solutions`)}
          className="inline-flex items-center text-blue-600 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Lời giải
          <svg className="ml-2 -mr-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      )}
    </div>
  );
};

export default FormatCorrectAnswer;