import React, { type JSX } from 'react';

import { ComponentCollection, JsonObject, Question, QuestionFactory, Serializer } from "survey-core";
import { SurveyQuestionElementBase, ReactQuestionFactory } from "survey-react-ui";

// Import component ItemConnector và kiểu Connection
import ItemConnector, { type Connection } from './Common/ItemConnector'; // Điều chỉnh đường dẫn nếu cần

const CUSTOM_QUESTION_TYPE = "itemConnector"; // Bạn có thể đặt tên khác

// 1. Model cho câu hỏi (định nghĩa các thuộc tính và logic cơ bản)
export class QuestionItemConnectorModel extends Question {
  // Quan trọng: SurveyJS sử dụng thuộc tính 'value' để lưu trữ câu trả lời
  // Kiểu dữ liệu của 'value' nên là Connection[]

  getType() {
    return CUSTOM_QUESTION_TYPE;
  }

  // Các thuộc tính cho items cột trái và phải.
  // Trong Survey Creator, chúng ta sẽ cho phép nhập dưới dạng JSON string.
  get leftItems(): any { // Kiểu any để linh hoạt khi lấy từ JSON
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
      id: String(item.id || item.value || `item-${index}-${Math.random().toString(36).substring(2, 7)}`), // Đảm bảo có id duy nhất
      label: String(item.label || item.text || `Mục ${index + 1}`)
    }));
  }

  // Các hàm getter đã được parse
  get parsedLeftItems(): { id: string, label: string }[] {
    return this.parseJsonItems(this.leftItems);
  }

  get parsedRightItems(): { id: string, label: string }[] {
    return this.parseJsonItems(this.rightItems);
  }
}

// 2. Đăng ký model vào SurveyJS Factory và Serializer
QuestionFactory.Instance.registerQuestion(CUSTOM_QUESTION_TYPE, (name) => {
  const q = new QuestionItemConnectorModel(name);
  // Nếu bạn muốn các thuộc tính này có thể dịch được
  // q.createLocalizableString("leftItems", q, false); // false vì đây là JSON, không phải chuỗi text đơn giản
  // q.createLocalizableString("rightItems", q, false);
  return q;
});

Serializer.addClass(
  CUSTOM_QUESTION_TYPE,
  [
    {
      name: "leftItems:text", // Sử dụng kiểu 'text' để người dùng nhập chuỗi JSON trong Survey Creator
      serializationProperty: "leftItems", // Tên thuộc tính trong model
      category: "Data", // Nhóm thuộc tính trong Survey Creator
      displayName: "Các mục cột trái (JSON)",
      // description: "Nhập một mảng JSON, ví dụ: [{\"id\":\"l1\",\"label\":\"Mục A\"}, {\"id\":\"l2\",\"label\":\"Mục B\"}]"
    },
    {
      name: "rightItems:text",
      serializationProperty: "rightItems",
      category: "Data",
      displayName: "Các mục cột phải (JSON)",
      // description: "Nhập một mảng JSON, ví dụ: [{\"id\":\"r1\",\"label\":\"Lựa chọn 1\"}, {\"id\":\"r2\",\"label\":\"Lựa chọn 2\"}]"
    },
    // Bạn có thể thêm các thuộc tính khác nếu cần
  ],
  function () {
    return new QuestionItemConnectorModel("");
  },
  "question" // Kiểu cơ sở mà custom question này kế thừa
);

// 3. React Component để render câu hỏi trong Survey Runner
export class SurveyQuestionItemConnector extends SurveyQuestionElementBase {
  private get questionModel(): QuestionItemConnectorModel {
    return this.questionBase as QuestionItemConnectorModel;
  }

  // Hàm này được gọi khi giá trị (kết nối) của ItemConnector thay đổi
  private handleConnectionsChange = (connections: Connection[]) => {
    this.questionModel.value = connections; // Cập nhật giá trị của câu hỏi SurveyJS
  };

  renderElement(): JSX.Element {
    const leftItems = this.questionModel.parsedLeftItems;
    const rightItems = this.questionModel.parsedRightItems;

    // Kiểm tra điều kiện số lượng item
    if (leftItems.length > 0 && rightItems.length < leftItems.length) {
      return (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          Lỗi cấu hình: Số lượng mục ở cột phải({rightItems.length}) phải lớn hơn hoặc bằng số lượng mục ở cột trái({leftItems.length}).
        </div>
      );
    }

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
// Sử dụng ReactQuestionFactory nếu bạn dùng survey-react-ui >= v1.9.0
ReactQuestionFactory.Instance.registerQuestion(CUSTOM_QUESTION_TYPE, (props) => {
  return React.createElement(SurveyQuestionItemConnector, props);
});

// Nếu bạn dùng phiên bản cũ hơn hoặc cách đăng ký khác:
// ComponentCollection.Instance.add({
//   name: CUSTOM_QUESTION_TYPE,
//   component: SurveyQuestionItemConnector,
//   // questionJSON (tùy chọn, để định nghĩa mặc định khi kéo từ toolbox vào Survey Creator)
//   questionJSON: {
//     type: CUSTOM_QUESTION_TYPE,
//     name: "myConnectionQuestion",
//     title: "Nối các mục phù hợp:",
//     leftItems: JSON.stringify([
//       { id: "l1", label: "Mục Trái 1" },
//       { id: "l2", label: "Mục Trái 2" }
//     ]),
//     rightItems: JSON.stringify([
//       { id: "r1", label: "Mục Phải A" },
//       { id: "r2", label: "Mục Phải B" },
//       { id: "r3", label: "Mục Phải C" }
//     ])
//   }
// });

// Hàm để gọi một lần để đăng ký tất cả
export function registerItemConnectorQuestion() {
  // Đã thực hiện đăng ký ở trên, hàm này chỉ để gom lại nếu cần
  console.log("ItemConnector question type registered with SurveyJS.");
}