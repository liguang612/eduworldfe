import type { Question } from "@/api/questionApi";

const FormatCorrectAnswer: React.FC<{ correctAnswerData: any; question: Question }> = ({ correctAnswerData, question }) => {
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
    <div className="mt-1">
      {displayElements}
    </div>
  );
};

export default FormatCorrectAnswer;