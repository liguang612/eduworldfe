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

  if (!isOpen) return null;

  const parseDocxContent = (xmlString: string): ParsedQuestion[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    const WORD_NAMESPACE = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

    const paragraphs = Array.from(xmlDoc.getElementsByTagNameNS(WORD_NAMESPACE, "p"));

    const questions: ParsedQuestion[] = [];
    let currentQuestion: ParsedQuestion | null = null;
    let isCollectingQuestionText = false;
    let questionTextParts: string[] = [];

    const extractText = (p: Element): string => {
      const textNodes = p.getElementsByTagNameNS(WORD_NAMESPACE, "t");
      return Array.from(textNodes).map(t => t.textContent).join('');
    };

    const isCorrect = (p: Element): boolean => {
      const boldNodes = p.getElementsByTagNameNS(WORD_NAMESPACE, 'b');
      return boldNodes.length > 0;
    };

    const isQuestionStart = (text: string): boolean => {
      return /<radio(?:\s+level=(\d+))?>/.test(text) ||
        /<checkbox(?:\s+level=(\d+))?>/.test(text) ||
        /<ranking(?:\s+level=(\d+))?>/.test(text) ||
        /<shortAnswer(?:\s+level=(\d+))?>/.test(text);
    };

    const isQuestionEnd = (text: string): boolean => {
      return text.includes('</>');
    };

    const extractQuestionInfo = (text: string): { type: ParsedQuestion['type'], level: number, startText: string } | null => {
      const radioMatch = text.match(/<radio(?:\s+level=(\d+))?>(.*?)(?:<\/>)?$/);
      const checkboxMatch = text.match(/<checkbox(?:\s+level=(\d+))?>(.*?)(?:<\/>)?$/);
      const rankingMatch = text.match(/<ranking(?:\s+level=(\d+))?>(.*?)(?:<\/>)?$/);
      const shortAnswerMatch = text.match(/<shortAnswer(?:\s+level=(\d+))?>(.*?)(?:<\/>)?$/);

      if (radioMatch) {
        return {
          type: 'radio',
          level: radioMatch[1] ? parseInt(radioMatch[1]) : 2,
          startText: radioMatch[2] || ''
        };
      } else if (checkboxMatch) {
        return {
          type: 'checkbox',
          level: checkboxMatch[1] ? parseInt(checkboxMatch[1]) : 2,
          startText: checkboxMatch[2] || ''
        };
      } else if (rankingMatch) {
        return {
          type: 'ranking',
          level: rankingMatch[1] ? parseInt(rankingMatch[1]) : 2,
          startText: rankingMatch[2] || ''
        };
      } else if (shortAnswerMatch) {
        return {
          type: 'shortAnswer',
          level: shortAnswerMatch[1] ? parseInt(shortAnswerMatch[1]) : 2,
          startText: shortAnswerMatch[2] || ''
        };
      }
      return null;
    };

    for (const p of paragraphs) {
      const trimmedText = extractText(p).trim();

      if (isQuestionStart(trimmedText)) {
        if (currentQuestion) questions.push(currentQuestion);

        const questionInfo = extractQuestionInfo(trimmedText);
        if (questionInfo) {
          let level = questionInfo.level;
          if (level < 1 || level > 4 || isNaN(level)) {
            level = 2;
          }

          currentQuestion = {
            type: questionInfo.type,
            questionText: questionInfo.startText,
            level: level,
            answers: [],
          };

          if (isQuestionEnd(trimmedText)) {
            isCollectingQuestionText = false;
            questionTextParts = [];
          } else {
            isCollectingQuestionText = true;
            questionTextParts = [questionInfo.startText];
          }
        }
      } else if (currentQuestion && isCollectingQuestionText) {
        if (isQuestionEnd(trimmedText)) {
          currentQuestion.questionText = questionTextParts.join('\n').trim();

          isCollectingQuestionText = false;
          questionTextParts = [];
        } else if (trimmedText) {
          questionTextParts.push(trimmedText);
        }
      } else if (currentQuestion && !isCollectingQuestionText && trimmedText) {
        if (currentQuestion.type === 'shortAnswer') {
          currentQuestion.answers.push({
            text: trimmedText,
            isCorrect: true,
          });
          questions.push(currentQuestion);
          currentQuestion = null;
        } else {
          currentQuestion.answers.push({
            text: trimmedText,
            isCorrect: isCorrect(p),
          });
        }
      }
    }

    if (currentQuestion) questions.push(currentQuestion);

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

  // Parse plain text (.txt) file
  const parseTxtContent = (txt: string): ParsedQuestion[] => {
    const lines = txt.split(/\r?\n/);
    const questions: ParsedQuestion[] = [];
    let current: ParsedQuestion | null = null;
    let collectingQuestionText = false;
    let questionTextParts: string[] = [];
    let answerParts: string[] = [];
    let currentType: ParsedQuestion['type'] = 'radio';
    let currentLevel: number = 2;

    const isQuestionStart = (line: string) => /<radio(?:\s+level=(\d+))?>/.test(line) || /<checkbox(?:\s+level=(\d+))?>/.test(line) || /<ranking(?:\s+level=(\d+))?>/.test(line) || /<shortAnswer(?:\s+level=(\d+))?>/.test(line);
    const isQuestionEnd = (line: string) => line.includes('</>');
    const extractQuestionInfo = (line: string) => {
      const radioMatch = line.match(/<radio(?:\s+level=(\d+))?>(.*?)(?:<\/>)?$/);
      const checkboxMatch = line.match(/<checkbox(?:\s+level=(\d+))?>(.*?)(?:<\/>)?$/);
      const rankingMatch = line.match(/<ranking(?:\s+level=(\d+))?>(.*?)(?:<\/>)?$/);
      const shortAnswerMatch = line.match(/<shortAnswer(?:\s+level=(\d+))?>(.*?)(?:<\/>)?$/);
      if (radioMatch) return { type: 'radio', level: radioMatch[1] ? parseInt(radioMatch[1]) : 2, startText: radioMatch[2]?.trim() || '' };
      if (checkboxMatch) return { type: 'checkbox', level: checkboxMatch[1] ? parseInt(checkboxMatch[1]) : 2, startText: checkboxMatch[2]?.trim() || '' };
      if (rankingMatch) return { type: 'ranking', level: rankingMatch[1] ? parseInt(rankingMatch[1]) : 2, startText: rankingMatch[2]?.trim() || '' };
      if (shortAnswerMatch) return { type: 'shortAnswer', level: shortAnswerMatch[1] ? parseInt(shortAnswerMatch[1]) : 2, startText: shortAnswerMatch[2]?.trim() || '' };
      return null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (isQuestionStart(line)) {
        if (current) {
          // push previous question
          if (currentType === 'shortAnswer' && answerParts.length > 0) {
            current.answers.push({ text: answerParts.join('\n').trim(), isCorrect: true });
          }
          questions.push(current);
        }
        const info = extractQuestionInfo(line);
        currentType = (info?.type as ParsedQuestion['type']) || 'radio';
        currentLevel = info?.level ?? 2;
        current = {
          type: currentType,
          questionText: info?.startText || '',
          level: currentLevel,
          answers: [],
        };
        collectingQuestionText = true;
        questionTextParts = [info?.startText || ''];
        answerParts = [];
        continue;
      }
      if (isQuestionEnd(line)) {
        if (current) {
          if (collectingQuestionText) {
            current.questionText = questionTextParts.join('\n').trim();
            collectingQuestionText = false;
          }
          if (currentType === 'shortAnswer' && answerParts.length > 0) {
            current.answers.push({ text: answerParts.join('\n').trim(), isCorrect: true });
          }
          questions.push(current);
          current = null;
          currentType = 'radio';
          questionTextParts = [];
          answerParts = [];
        }
        continue;
      }
      if (!current) continue;
      // Nếu đang collect questionText
      if (collectingQuestionText) {
        // Nếu gặp dòng bắt đầu bằng (x) hoặc () thì chuyển sang collect answer
        if (/^\(x\)|^\(\d+\)|^\(\)/.test(line)) {
          collectingQuestionText = false;
        } else if (line !== '') {
          questionTextParts.push(line);
          continue;
        }
      }
      // Nếu là đáp án
      if (!collectingQuestionText && line !== '') {
        if (currentType === 'radio' || currentType === 'checkbox') {
          // (x) Đáp án đúng, () Đáp án sai
          const match = line.match(/^\((x|\s*)\)\s*(.*)$/i);
          if (match) {
            current.answers.push({ text: match[2], isCorrect: match[1].toLowerCase() === 'x' });
          } else {
            // Nếu không match thì nối vào đáp án trước (nhiều dòng)
            if (current.answers.length > 0) {
              current.answers[current.answers.length - 1].text += '\n' + line;
            }
          }
        } else if (currentType === 'ranking') {
          // (1) text, (2) text, ...
          const match = line.match(/^\((\d+)\)\s*(.*)$/);
          if (match) {
            // Đáp án đúng là theo thứ tự số thứ tự (orderIndex = số thứ tự)
            current.answers.push({ text: match[2], isCorrect: true });
          } else {
            if (current.answers.length > 0) {
              current.answers[current.answers.length - 1].text += '\n' + line;
            }
          }
        } else if (currentType === 'shortAnswer') {
          // Đáp án đúng duy nhất, collect tất cả các dòng
          const match = line.match(/^\((x|\s*)\)\s*(.*)$/i);
          if (match) {
            current.answers.push({ text: match[2], isCorrect: match[1].toLowerCase() === 'x' });
          }
        }
      }
    }
    // push cuối cùng nếu còn
    if (current) {
      if (currentType === 'shortAnswer' && answerParts.length > 0) {
        current.answers.push({ text: answerParts.join('\n').trim(), isCorrect: true });
      }
      questions.push(current);
    }
    return questions;
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;

    const isDocx = selectedFile.name.endsWith('.docx');
    const isTxt = selectedFile.name.endsWith('.txt');

    if (!isDocx && !isTxt) {
      toast.error("Vui lòng chỉ upload file .docx hoặc .txt");
      return;
    }

    onClose();
    const toastId = toast.loading("Đang xử lý file, vui lòng chờ...");

    try {
      if (isDocx) {
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
      } else if (isTxt) {
        // Xử lý file txt
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            if (!content) {
              throw new Error("Không thể đọc được nội dung file.");
            }
            const parsedQuestions = parseTxtContent(content);
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
        reader.readAsText(selectedFile);
      }
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
              href={"https://storage.googleapis.com/download/storage/v1/b/eduworld-6ba8b.firebasestorage.app/o/others%2Fdb18e75f-476b-4ab7-9abc-73cf47d8c52c_question_sample.txt?generation=1750781651253907&alt=media"}
              download
              className="text-blue-600 hover:underline pr-2"
            >
              Tải file mẫu (.txt)
            </a>
            hoặc
            <a
              href={"https://storage.googleapis.com/download/storage/v1/b/eduworld-6ba8b.firebasestorage.app/o/others%2F27256667-7169-44bb-81df-83696b2c1ea3_question_sample.docx?generation=1750099244526086&alt=media"}
              download
              className="text-blue-600 hover:underline pl-2"
            >
              Tải file mẫu (.docx)
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain"
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