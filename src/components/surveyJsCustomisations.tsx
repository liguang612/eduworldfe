import React, { type JSX } from 'react';

import { Question, QuestionFactory, Serializer } from "survey-core";
import { SurveyQuestionElementBase, ReactQuestionFactory } from "survey-react-ui";

import ItemConnector, { type Connection } from './Common/ItemConnector';

const CUSTOM_QUESTION_TYPE = "itemConnector";

// 1. Model cho câu hỏi
export class QuestionItemConnectorModel extends Question {
  getType() {
    return CUSTOM_QUESTION_TYPE;
  }

  get leftItems(): any {
    return this.getPropertyValue("leftItems");
  }
  set leftItems(val: any) {
    this.setPropertyValue("leftItems", val);
  }

  get rightItems(): any {
    return this.getPropertyValue("rightItems");
  }
  set rightItems(val: any) {
    this.setPropertyValue("rightItems", val);
  }

  // Helper để parse chuỗi JSON hoặc trả về mảng nếu đã là mảng
  private parseJsonItems(itemsInput: any): { id: string, label: string }[] {
    if (!itemsInput) return [];
    let parsedItems: any[];
    if (typeof itemsInput === 'string') {
      try {
        parsedItems = JSON.parse(itemsInput);
      } catch (e) {
        console.error("Lỗi parse JSON cho items:", itemsInput, e);
        return [];
      }
    } else if (Array.isArray(itemsInput)) {
      parsedItems = itemsInput;
    } else {
      return [];
    }

    if (!Array.isArray(parsedItems)) return [];

    return parsedItems.map((item, index) => ({
      id: String(item.id || item.value || `item-${index}-${Math.random().toString(36).substring(2, 7)}`),
      label: String(item.label || item.text || `Mục ${index + 1}`)
    }));
  }

  get parsedLeftItems(): { id: string, label: string }[] {
    return this.parseJsonItems(this.leftItems);
  }

  get parsedRightItems(): { id: string, label: string }[] {
    return this.parseJsonItems(this.rightItems);
  }

  toExportObject() {
    return {
      type: this.getType(),
      name: this.name,
      question: {
        name: this.name,
        title: this.title,
        leftItems: this.leftItems,
        rightItems: this.rightItems,
      },
      value: this.value
    };
  }
}

// 2. Đăng ký model vào SurveyJS Factory và Serializer
QuestionFactory.Instance.registerQuestion(CUSTOM_QUESTION_TYPE, (name) => {
  const q = new QuestionItemConnectorModel(name);
  return q;
});

Serializer.addClass(
  CUSTOM_QUESTION_TYPE,
  [
    {
      name: "leftItems:text",
      serializationProperty: "leftItems", // Tên thuộc tính trong model
      category: "Data", // Nhóm thuộc tính trong Survey Creator
      displayName: "Các mục cột trái (JSON)",
    },
    {
      name: "rightItems:text",
      serializationProperty: "rightItems",
      category: "Data",
      displayName: "Các mục cột phải (JSON)",
    },
  ],
  function () {
    return new QuestionItemConnectorModel("");
  },
  "question"
);

// 3. React Component để render câu hỏi trong Survey Runner
export class SurveyQuestionItemConnector extends SurveyQuestionElementBase {
  private get questionModel(): QuestionItemConnectorModel {
    return this.questionBase as QuestionItemConnectorModel;
  }

  private handleConnectionsChange = (connections: Connection[]) => {
    this.questionModel.value = connections;
  };

  renderElement(): JSX.Element {
    const leftItems = this.questionModel.parsedLeftItems;
    const rightItems = this.questionModel.parsedRightItems;

    return (
      <ItemConnector
        leftItems={leftItems}
        rightItems={rightItems}
        initialConnections={this.questionModel.value || []}
        onChange={this.handleConnectionsChange}
        readOnly={this.questionModel.isReadOnly}
      />
    );
  }
}

// 4. Đăng ký React component với SurveyJS để render
ReactQuestionFactory.Instance.registerQuestion(CUSTOM_QUESTION_TYPE, (props) => {
  return React.createElement(SurveyQuestionItemConnector, props);
});

export function registerItemConnectorQuestion() {
  // Đã thực hiện đăng ký ở trên, hàm này chỉ để gom lại nếu cần
  console.log("ItemConnector question type registered with SurveyJS.");
}