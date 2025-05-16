import 'survey-core/survey-core.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { BorderlessLight } from 'survey-core/themes';
import { useCallback } from 'react';

const surveyJson = {
  elements: [
    {
      type: "itemConnector",
      name: "skillConnections",
      title: "Hãy nối các kỹ năng với các mô tả phù hợp:",
      leftItems: JSON.stringify([
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
    },
    // Trắc nghiệm (Multiple Choice)
    {
      type: "radiogroup",
      name: "mc_question",
      title: "Trắc nghiệm: JavaScript là gì?",
      question: "JavaScript là gì?",
      choices: [
        "Hệ quản trị cơ sở dữ liệu",
        "Ngôn ngữ lập trình",
        "Trình soạn thảo văn bản",
        "Hệ điều hành"
      ],
      correctAnswer: "Ngôn ngữ lập trình"
    },
    // Sắp xếp (Sorting)
    {
      type: "ranking",
      name: "drag_and_drop",
      title: "Sắp xếp các công nghệ theo mức độ quen thuộc của bạn (từ cao đến thấp):",
      choices: ["React", "Vue", "Angular", "Svelte"],
      correctOrder: [
        "Vue",
        "React",
        "Svelte",
        "Angular",
      ]
    },
    // Điền vào chỗ trống (Fill in the Blank)
    {
      type: "text",
      name: "fill_in_blank",
      title: "Điền từ còn thiếu: ___ là một thư viện JavaScript để xây dựng UI.",
      placeHolder: "Nhập câu trả lời",
      correctAnswer: "React"
    },
    {
      "type": "panel",
      "name": "paragraph_gapfill",
      "elements": [
        {
          "type": "text",
          "name": "instruction",
          "title": "Điền từ vào chỗ trống",
          "html": "___ is a JS library. It works well with ___ to manage state."
        },
        {
          "type": "dropdown",
          "name": "blank1",
          "title": "Blank 1",
          "choices": ["React", "Vue", "Angular"]
        },
        {
          "type": "dropdown",
          "name": "blank2",
          "title": "Blank 2",
          "choices": ["Redux", "TypeScript", "HTML"]
        }
      ]
    },
    {
      "type": "imagepicker",
      "name": "select_logo",
      "title": "Chọn logo của React",
      "choices": [
        {
          "value": "react",
          "imageLink": "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
          "text": "React"
        },
        {
          "value": "vue",
          "imageLink": "https://upload.wikimedia.org/wikipedia/commons/9/95/Vue.js_Logo_2.svg",
          "text": "Vue"
        }
      ],
      "imageHeight": 100,
      "imageWidth": 100
    }

  ]
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
