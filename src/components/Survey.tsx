// components/Survey.tsx
import 'survey-core/survey-core.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { BorderlessLight } from 'survey-core/themes';
import { useCallback } from 'react';

// Import và gọi hàm đăng ký custom question
import { registerItemConnectorQuestion } from './surveyJsCustomisations';

registerItemConnectorQuestion();

const surveyJson = {
  elements: [{
    type: "itemConnector", // Sử dụng tên bạn đã đăng ký
    name: "skillConnections",
    title: "Hãy nối các kỹ năng với các mô tả phù hợp:",
    leftItems: JSON.stringify([ // Dữ liệu mẫu
      { id: "react", label: "ReactJS" },
      { id: "typescript", label: "TypeScript" },
      { id: "surveyjs", label: "SurveyJS" }
    ]),
    rightItems: JSON.stringify([
      { id: "lib", label: "Thư viện UI" },
      { id: "lang", label: "Ngôn ngữ lập trình" },
      { id: "platform", label: "Nền tảng khảo sát" },
      { id: "state", label: "Quản lý trạng thái" }
    ])
  }]
};

export default function SurveyComponent() {
  const survey = new Model(surveyJson);
  survey.applyTheme(BorderlessLight);

  const alertResults = useCallback((survey: Model) => {
    const results = JSON.stringify(survey.data);
    alert(results);
  }, []);

  survey.onComplete.add(alertResults);

  return (
    <div className="survey-container">
      <Survey model={survey} />
    </div>
  );
}
