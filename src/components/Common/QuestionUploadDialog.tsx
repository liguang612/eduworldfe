import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import type { IndividualQuestion, MultipleChoiceOption, SortingOption, FillInBlankOption } from '@/components/Question/types';

interface ParsedQuestion {
  type: 'radio' | 'checkbox' | 'ranking' | 'shortAnswer';
  questionText: string;
  level: number;
  answers: { text: string; isCorrect: boolean }[];
}

interface QuestionUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  selectedSubjectId: string;
}

export function QuestionUploadDialog({
  isOpen,
  onClose,
  title,
  confirmButtonText = 'Xác nhận',
  cancelButtonText = 'Huỷ',
  selectedSubjectId,
}: QuestionUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  if (!isOpen) {
    return null;
  }

  const parseDocxContent = (xmlString: string): ParsedQuestion[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    const WORD_NAMESPACE = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

    const paragraphs = Array.from(xmlDoc.getElementsByTagNameNS(WORD_NAMESPACE, "p"));

    const questions: ParsedQuestion[] = [];
    let currentQuestion: ParsedQuestion | null = null;

    const extractText = (p: Element): string => {
      const textNodes = p.getElementsByTagNameNS(WORD_NAMESPACE, "t");
      return Array.from(textNodes).map(t => t.textContent).join('');
    };

    const isCorrect = (p: Element): boolean => {
      const boldNodes = p.getElementsByTagNameNS(WORD_NAMESPACE, 'b');
      return boldNodes.length > 0;
    };

    for (const p of paragraphs) {
      const text = extractText(p);

      const radioMatch = text.match(/<radio(?:\s+level=(\d+))?>(.*?)<\/>/);
      const checkboxMatch = text.match(/<checkbox(?:\s+level=(\d+))?>(.*?)<\/>/);
      const rankingMatch = text.match(/<ranking(?:\s+level=(\d+))?>(.*?)<\/>/);
      const shortAnswerMatch = text.match(/<shortAnswer(?:\s+level=(\d+))?>(.*?)<\/>/);

      const questionTypeMatch = radioMatch || checkboxMatch || rankingMatch || shortAnswerMatch;

      if (questionTypeMatch) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }

        let type: ParsedQuestion['type'] = 'radio';
        let level = 2; // Mặc định là "Thông hiểu"
        let questionText = '';

        if (radioMatch) {
          type = 'radio';
          level = radioMatch[1] ? parseInt(radioMatch[1]) : 2;
          questionText = radioMatch[2];
        } else if (checkboxMatch) {
          type = 'checkbox';
          level = checkboxMatch[1] ? parseInt(checkboxMatch[1]) : 2;
          questionText = checkboxMatch[2];
        } else if (rankingMatch) {
          type = 'ranking';
          level = rankingMatch[1] ? parseInt(rankingMatch[1]) : 2;
          questionText = rankingMatch[2];
        } else if (shortAnswerMatch) {
          type = 'shortAnswer';
          level = shortAnswerMatch[1] ? parseInt(shortAnswerMatch[1]) : 2;
          questionText = shortAnswerMatch[2];
        }

        // Validate level (phải từ 1-4, nếu không hợp lệ thì dùng mặc định)
        if (level < 1 || level > 4 || isNaN(level)) {
          level = 2;
        }

        currentQuestion = {
          type: type,
          questionText: questionText.trim(),
          level: level,
          answers: [],
        };
      } else if (currentQuestion && text.trim()) {
        if (currentQuestion.type === 'shortAnswer') {
          currentQuestion.answers.push({
            text: text.trim(),
            isCorrect: true,
          });
          questions.push(currentQuestion);
          currentQuestion = null;
        } else {
          currentQuestion.answers.push({
            text: text.trim(),
            isCorrect: isCorrect(p),
          });
        }
      }
    }

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return questions;
  };

  const convertParsedQuestionsToIndividualQuestions = (parsedQuestions: ParsedQuestion[]): IndividualQuestion[] => {
    return parsedQuestions.map((pq, index) => {
      const id = `imported_${Date.now()}_${index}`;

      let choices: IndividualQuestion['choices'] = [];

      switch (pq.type) {
        case 'radio':
          choices = pq.answers.map((answer, answerIndex) => ({
            id: `choice_${id}_${answerIndex}`,
            content: answer.text,
            isCorrect: answer.isCorrect,
            value: `choice_${id}_${answerIndex}`,
            allowMultiple: false
          } as MultipleChoiceOption));
          break;

        case 'checkbox':
          choices = pq.answers.map((answer, answerIndex) => ({
            id: `choice_${id}_${answerIndex}`,
            content: answer.text,
            isCorrect: answer.isCorrect,
            value: `choice_${id}_${answerIndex}`,
            allowMultiple: true
          } as MultipleChoiceOption));
          break;

        case 'ranking':
          choices = pq.answers.map((answer, answerIndex) => ({
            id: `choice_${id}_${answerIndex}`,
            content: answer.text,
            orderIndex: answerIndex + 1,
            value: `choice_${id}_${answerIndex}`
          } as SortingOption));
          break;

        case 'shortAnswer':
          choices = [{
            id: `choice_${id}_0`,
            content: pq.answers[0]?.text || '',
            value: pq.answers[0]?.text || ''
          } as FillInBlankOption];
          break;
      }

      return {
        id,
        questionText: pq.questionText,
        level: pq.level,
        type: pq.type,
        choices,
        tags: ''
      } as IndividualQuestion;
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.docx')) {
      toast.error("Vui lòng chỉ upload file .docx");
      return;
    }

    onClose();
    const toastId = toast.loading("Đang xử lý file, vui lòng chờ...");

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result;
          if (!content) {
            throw new Error("Không thể đọc được nội dung file.");
          }
          const zip = await JSZip.loadAsync(content);
          const docXml = zip.file("word/document.xml");

          if (!docXml) {
            throw new Error("File docx không hợp lệ hoặc không tìm thấy document.xml.");
          }

          const xmlContent = await docXml.async("string");
          const parsedQuestions = parseDocxContent(xmlContent);

          if (parsedQuestions.length === 0) {
            throw new Error("Không tìm thấy câu hỏi nào trong file. Vui lòng kiểm tra lại cấu trúc file.");
          }

          const individualQuestions = convertParsedQuestionsToIndividualQuestions(parsedQuestions);

          toast.update(toastId, {
            render: `Đã tải thành công ${parsedQuestions.length} câu hỏi từ file "${selectedFile.name}".`,
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });

          // Chuyển hướng đến trang tạo câu hỏi với dữ liệu đã import
          navigate('/question-bank/new', {
            state: {
              subjectId: selectedSubjectId,
              importedQuestions: individualQuestions
            }
          });

        } catch (parseError: any) {
          console.error('Error processing file:', parseError);
          toast.update(toastId, {
            render: `Lỗi xử lý file: ${parseError.message}`,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        toast.update(toastId, {
          render: "Có lỗi xảy ra khi đọc file.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }

      reader.readAsArrayBuffer(selectedFile);
    } catch (error: any) {
      console.error('Error preparing to read file:', error);
      toast.update(toastId, {
        render: `Lỗi không xác định: ${error.message}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.5)]"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 md:mx-auto flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-[#0e141b]">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close dialog"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <span>Vui lòng tải tệp theo định dạng cho sẵn. </span>
            <a
              href={"https://storage.googleapis.com/download/storage/v1/b/eduworld-6ba8b.firebasestorage.app/o/others%2F27256667-7169-44bb-81df-83696b2c1ea3_question_sample.docx?generation=1750099244526086&alt=media"}
              download
              className="text-blue-600 hover:underline"
            >
              Tải file mẫu
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            <button
              onClick={handleUploadButtonClick}
              className="px-4 py-2 bg-slate-100 text-slate-800 rounded-md hover:bg-slate-200 transition border border-slate-300"
            >
              Chọn file
            </button>
            {selectedFile && (
              <span className="text-gray-600">{selectedFile.name}</span>
            )}
          </div>
        </div>

        <div className="p-4 flex justify-end gap-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedFile}
            className="px-4 py-2 text-white rounded-md transition bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
} 