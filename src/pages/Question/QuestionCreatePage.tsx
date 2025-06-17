import React, { useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { IndividualQuestion, SharedMediaData, FullQuestionSetData, MultipleChoiceOption, SortingOption, FillInBlankOption } from '@/components/Question/types';
import FullPreview from '@/components/Question/FullPreview';
import QuestionChoices from '@/components/Question/QuestionChoices';
import * as questionApi from '@/api/questionApi';
import { uploadSharedMedia, type LocationState, type SurveyValue } from '@/api/questionApi';
import RemoveIcon from '@/assets/remove.svg';


// --- Main Page Component ---
const QuestionCreatePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subjectId, importedQuestions } = location.state as (LocationState & { importedQuestions?: IndividualQuestion[] }) || {};
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sharedMedia, setSharedMedia] = useState<SharedMediaData | undefined>(undefined);
  const [questions, setQuestions] = useState<IndividualQuestion[]>(importedQuestions || []);
  const [isSaving, setIsSaving] = useState(false);
  const [surveyValues, setSurveyValues] = useState<{ [key: string]: SurveyValue }>({});

  // Hiển thị thông báo khi có dữ liệu được import
  React.useEffect(() => {
    if (importedQuestions && importedQuestions.length > 0) {
      toast.success(`Đã import thành công ${importedQuestions.length} câu hỏi từ file!`);
    }
  }, [importedQuestions]);

  // Khởi tạo surveyValues cho các câu hỏi được import
  React.useEffect(() => {
    if (importedQuestions && importedQuestions.length > 0) {
      const initialSurveyValues: { [key: string]: SurveyValue } = {};

      importedQuestions.forEach(question => {
        let value: any = null;

        switch (question.type) {
          case 'radio':
            const radioChoices = question.choices as MultipleChoiceOption[];
            const correctRadioChoice = radioChoices.find(choice => choice.isCorrect);
            if (correctRadioChoice) {
              value = correctRadioChoice.value || correctRadioChoice.id;
            }
            break;

          case 'checkbox':
            const checkboxChoices = question.choices as MultipleChoiceOption[];
            const correctCheckboxChoices = checkboxChoices.filter(choice => choice.isCorrect);
            value = correctCheckboxChoices.map(choice => choice.value || choice.id);
            break;

          case 'ranking':
            const rankingChoices = question.choices as SortingOption[];
            // Sắp xếp theo orderIndex và lấy value (thứ tự từ file docx)
            const sortedChoices = rankingChoices
              .sort((a, b) => a.orderIndex - b.orderIndex);
            value = sortedChoices.map(choice => choice.value || choice.id);
            break;

          case 'shortAnswer':
            const shortAnswerChoices = question.choices as FillInBlankOption[];
            if (shortAnswerChoices && shortAnswerChoices.length > 0) {
              value = shortAnswerChoices[0].value;
            }
            break;
        }

        if (value !== null) {
          initialSurveyValues[question.id] = {
            type: question.type === 'radio' ? 'radiogroup' : question.type === 'checkbox' ? 'checkbox' : question.type === 'ranking' ? 'ranking' : 'text',
            name: `question_${question.id}`,
            question: {
              name: `question_${question.id}`,
              title: question.questionText,
            },
            value: value
          };
        }
      });

      setSurveyValues(initialSurveyValues);
    }
  }, [importedQuestions]);

  const levelOptions = [
    { label: 'Nhận biết', value: 1 },
    { label: 'Thông hiểu', value: 2 },
    { label: 'Vận dụng', value: 3 },
    { label: 'Vận dụng cao', value: 4 }
  ];

  const questionTypeOptions = [
    { value: "radio", title: "Trắc nghiệm", description: "Chọn một đáp án đúng từ danh sách các đáp án" },
    { value: "itemConnector", title: "Ghép đôi", description: "Ghép các mục từ hai cột" },
    { value: "ranking", title: "Sắp xếp", description: "Sắp xếp các mục theo thứ tự" },
    { value: "shortAnswer", title: "Điền vào chỗ trống", description: "Nhập đáp án đúng" },
  ];
  const checkType = (type: string) => {
    if (type === 'radio' || type === 'checkbox') {
      return 'radio';
    }
    return type;
  }

  // Shared media handlers
  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSharedMedia({
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'video',
          url: e.target?.result as string,
          fileName: file.name,
          file: file // Store the actual File object
        });
      };
      if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        reader.readAsDataURL(file); // Read as Data URL for preview
      } else {
        // For other types (though we accept only image/audio/video for now), maybe handle differently or show error
        toast.error('Định dạng file không được hỗ trợ.');
        setSharedMedia(undefined);
      }
    }
  };

  const handleSharedTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSharedMedia({
      type: 'text',
      content: event.target.value
    });
  };

  const handleRemoveFile = () => {
    setSharedMedia(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Question handlers
  const addNewQuestion = () => {
    setQuestions(prevQuestions => [
      ...prevQuestions,
      {
        id: Date.now().toString(),
        questionText: '',
        level: 2,
        category: [],
        type: 'radio',
        choices: [],
        tags: ''
      }
    ]);
  };
  const removeQuestion = (id: string) => {
    setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== id));
  };

  // Update handlers
  const updateQuestionField = <K extends keyof IndividualQuestion>(index: number, field: K, value: IndividualQuestion[K]) => {
    setQuestions(prevQuestions =>
      prevQuestions.map((q, i) => {
        if (i !== index) return q;

        // If changing the question type, initialize with appropriate default choices
        if (field === 'type') {
          const questionType = value as string;
          let choices: IndividualQuestion['choices'] = [];

          switch (questionType) {
            case 'Multiple Choice':
              choices = [];
              break;
            case 'Matching':
              choices = [];
              break;
            case 'Sorting':
              choices = [];
              break;
            case 'Fill in the Blank':
              choices = [];
              break;
          }

          return { ...q, [field]: value, choices };
        }

        return { ...q, [field]: value };
      })
    );
  };

  const updateQuestionChoices = (index: number, choices: IndividualQuestion['choices']) => {
    setQuestions(prevQuestions =>
      prevQuestions.map((q, i) => (i === index ? { ...q, choices } : q))
    );
  };

  const handleSurveyValueChange = useCallback((questionId: string, value: SurveyValue) => {
    setSurveyValues(prev => ({
      ...prev,
      [questionId]: value
    }));
  }, []);

  const handleRemoveChoice = useCallback((questionId: string, removedChoiceId: string) => {
    setSurveyValues(prevAnswers => {
      const question = questions.find(q => q.id === questionId);
      if (!question) return prevAnswers;

      const currentSurveyValue = prevAnswers[questionId];
      if (currentSurveyValue === undefined) return prevAnswers;

      if (question.type === 'itemConnector') {
        currentSurveyValue.value = currentSurveyValue.value.filter(
          (pair: { from: string, to: string }) =>
            pair.from !== removedChoiceId && pair.to !== removedChoiceId
        );
      } else if (question.type === 'radio') {
        if (currentSurveyValue.value === removedChoiceId) {
          currentSurveyValue.value = undefined;
        }
      } else if (Array.isArray(currentSurveyValue.value) && question.type === 'checkbox') {
        currentSurveyValue.value = currentSurveyValue.value.filter(id => id !== removedChoiceId);
      } else if (Array.isArray(currentSurveyValue.value) && question.type === 'ranking') {
        currentSurveyValue.value = currentSurveyValue.value.filter(id => id !== removedChoiceId);
      }

      return prevAnswers;
    });
  }, [questions]);

  // Save handlers
  const handleSaveQuestions = async () => {
    if (!subjectId) {
      toast.error('Vui lòng chọn môn học trước khi tạo câu hỏi.');
      return;
    }

    // Kiểm tra xem tất cả câu hỏi đã có đáp án chưa
    const questionsWithoutAnswers = questions.filter(question => {
      const surveyValue = surveyValues[question.id];
      if (!surveyValue || (surveyValue.value === undefined || surveyValue.value === null || surveyValue.value === '' || (Array.isArray(surveyValue.value) && surveyValue.value.length === 0))) return true;

      // Kiểm tra riêng cho từng loại câu hỏi
      switch (question.type) {
        case 'radio':
        case 'checkbox':
          return Array.isArray(surveyValue.value) ? surveyValue.value.length === 0 : !surveyValue.value;
        case 'itemConnector':
          return !surveyValue.value || surveyValue.value.length === 0;
        case 'ranking':
          return !surveyValue.value || surveyValue.value.length === 0;
        case 'shortAnswer':
          return !surveyValue.value || surveyValue.value.trim() === '';
        default:
          return true;
      }
    });

    if (questionsWithoutAnswers.length > 0) {
      toast.error(`Có ${questionsWithoutAnswers.length} câu hỏi chưa được chọn đáp án. Vui lòng kiểm tra lại.`);
      return;
    }

    setIsSaving(true);
    try {
      let sharedMediaId = null;
      if (sharedMedia) {
        if (sharedMedia.type === 'text' && sharedMedia.content) {
          const response = await questionApi.createSharedMedia({
            title: 'Shared Text',
            mediaType: 0,
            text: sharedMedia.content
          });
          sharedMediaId = response.id;
        } else if (sharedMedia.file) {
          const response = await uploadSharedMedia({
            file: sharedMedia.file,
            title: sharedMedia.fileName || 'Untitled Media',
            mediaType: sharedMedia.type === 'image' ? 1 : sharedMedia.type === 'audio' ? 2 : 3,
          });
          sharedMediaId = response.id;
        }
      }

      for (const question of questions) {
        const createdQuestion = await questionApi.createQuestion({
          title: question.questionText,
          type: question.type === 'radio' && (question.choices as MultipleChoiceOption[])?.[0]?.allowMultiple
            ? 'checkbox'
            : question.type,

          level: question.level,
          subjectId,
          sharedMediaId: sharedMediaId,
          categories: question.tags.split(' ').filter(tag => tag !== '').map(tag => tag[0] === '#' ? tag : `#${tag}`)
        });

        const surveyValue = surveyValues[question.id];

        if (question.type === 'itemConnector') {
          const leftItems = (question.choices as any[]).filter(c => c.side === 'left');
          const rightItems = (question.choices as any[]).filter(c => c.side === 'right');

          const pairs = surveyValue?.value?.map((pair: { from: string, to: string }) => {
            const leftIndex = leftItems.findIndex(item => item.id === pair.from);
            const rightIndex = rightItems.findIndex(item => item.id === pair.to);
            return { leftIndex, rightIndex };
          }) || [];

          await questionApi.createMatchingQuestion({
            questionId: createdQuestion.id,
            left: leftItems.map((item, index) => ({
              label: item.text,
              orderIndex: index + 1
            })),
            right: rightItems.map(item => ({
              label: item.text
            })),
            pairs
          });
        } else if (question.type === 'shortAnswer') {
          const choicesToCreate = [{
            text: null,
            value: surveyValue?.value || '',
            orderIndex: null,
            isCorrect: true
          }];

          await questionApi.createChoicesBatch({
            questionId: createdQuestion.id,
            choices: choicesToCreate
          });

        } else {
          const choices = question.choices as any[];

          const choicesToCreate = choices.map((choice, _) => {
            let isCorrect = false;
            let orderIndex = null;

            if (question.type === 'radio') {
              isCorrect = surveyValue?.value === choice.id;
            } else if (question.type === 'checkbox') {
              isCorrect = surveyValue.value.includes(String(choice.id));
            } else if (question.type === 'ranking') {
              const idx = surveyValue?.value?.indexOf(choice.id);
              orderIndex = idx !== -1 ? idx + 1 : null;
            }

            return {
              text: choice.content || null,
              value: choice.id,
              orderIndex,
              isCorrect: isCorrect
            };
          });

          questionApi.createChoicesBatch({
            questionId: createdQuestion.id,
            choices: choicesToCreate
          });
        }
      }
      toast.success('Lưu câu hỏi thành công!');
      navigate('/question-bank');
    } catch (error) {
      console.error('Error saving questions:', error);
      toast.error('Có lỗi xảy ra khi lưu câu hỏi. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/question-bank');
  };

  const fullPreviewData: FullQuestionSetData = {
    sharedMedia: sharedMedia,
    questions: questions,
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-100 group/design-root"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="flex flex-1" style={{ maxHeight: 'calc(100vh - 60px)' }}>
        {/* Left Pane: Form */}
        <div className="flex-1 w-[60%] px-5 py-5 overflow-y-auto">
          <div className="p-6 shadow-md rounded-lg bg-white">
            {/* --- Shared Media Section --- */}
            <div className="mb-8 p-4 border border-dashed border-gray-300 rounded-lg">
              <h2 className="text-[16px] font-bold leading-tight text-[#0e141b] mb-3">Media cho nhóm câu hỏi (Tuỳ chọn)</h2>
              <p className="text-[#4e7397] text-sm font-normal leading-normal mb-4">
                Thêm một đoạn văn, hình ảnh, hoặc file âm thanh sẽ được dùng chung bởi tất cả các câu hỏi dưới đây. (VD: bài nghe và trả lời các câu hỏi / đọc đoạn văn sau và trả lời các câu hỏi/ ...)
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="shared-media-text" className="block text-sm font-medium text-gray-700 mb-1">Đoạn văn / Nội dung văn bản:</label>
                  <textarea
                    id="shared-media-text"
                    placeholder="VD: Đọc đoạn văn sau và trả lời các câu hỏi..."
                    className="form-input flex w-full min-w-0 flex-1 resize-y rounded-xl text-[#0e141b] focus:outline-0 focus:ring-2 focus:ring-blue-500 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] min-h-32 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                    value={sharedMedia?.type === 'text' ? sharedMedia.content : ''}
                    onChange={handleSharedTextChange}
                  />
                </div>
                <div className="text-center my-2">
                  <span className="text-sm text-gray-500">HOẶC</span>
                </div>
                <div className='flex flex-row gap-2 items-center'>
                  <label htmlFor="media-upload-button" className="block text-sm font-medium text-gray-700 mb-1">Tải lên hình ảnh/audio/video</label>
                  <input
                    id="media-upload-button"
                    type="file"
                    accept="image/*,audio/*,video/*"
                    onChange={handleMediaUpload}
                    ref={fileInputRef}
                    className="block w-full text-sm text-slate-500
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-full file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-blue-50 file:text-blue-700
                                   hover:file:bg-blue-100"
                  />
                  {sharedMedia?.file && (
                    <button
                      onClick={handleRemoveFile}
                      className="ml-auto flex items-center justify-center h-10 px-4 text-white text-sm font-bold rounded-xl hover:bg-slate-50 tracking-wide"
                    >
                      <img src={RemoveIcon} alt="Remove" className="" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* --- Questions Section --- */}
            <h2 className="text-[20px] font-bold leading-tight text-[#0e141b] mb-4 pt-4 border-t">Câu hỏi</h2>
            {questions.map((question, index) => (
              <div key={question.id} className="mb-6 p-4 border rounded-lg shadow-sm bg-slate-50 relative">
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                  title="Remove this question"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                </button>
                <p className="text-lg font-semibold text-[#0e141b] mb-1">Câu hỏi {index + 1}</p>
                <div className="flex max-w-[100%] flex-wrap items-end gap-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <span className="text-sm font-medium text-gray-700 mb-1">Nội dung</span>
                    <textarea
                      placeholder="Type your question here"
                      className="form-input flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-2 focus:ring-blue-500 border border-[#d0dbe7] bg-white focus:border-[#d0dbe7] min-h-24 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                      value={question.questionText}
                      onChange={(e) => updateQuestionField(index, 'questionText', e.target.value)}
                    />
                  </label>
                </div>
                <div className="flex flex-row gap-2 items-center py-3">
                  <h3 className="text-[#0e141b] text-base font-semibold leading-tight tracking-[-0.015em] w-1/4">Tag</h3>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="VD: #daodongdieuhoa #conlacdon ..."
                      className="form-input flex w-full min-w-0 flex-1 rounded-xl text-[#0e141b] focus:outline-0 focus:ring-2 focus:ring-blue-500 border border-[#d0dbe7] bg-white focus:border-[#d0dbe7] h-10 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                      value={question.tags}
                      onChange={(e) => updateQuestionField(index, 'tags', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <h3 className="text-[#0e141b] text-base font-semibold leading-tight tracking-[-0.015em] pb-1 pt-3">Độ khó</h3>
                  <div className='flex flex-5' />
                  <div className="flex py-2">
                    <div className="flex h-9 flex-1 items-center justify-center rounded-xl bg-[#e7edf3] p-0.5 max-w-[100%]">
                      {levelOptions.map(level => (
                        <label key={level.value} className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 text-xs font-medium leading-normal
                                            ${question.level === level.value ? 'bg-slate-50 shadow-[0_0_4px_rgba(0,0,0,0.1)] text-[#0e141b]' : 'text-[#4e7397] hover:bg-slate-200'}`}>
                          <span className="truncate">{level.label}</span>
                          <input
                            type="radio"
                            name={`level-radio-group-${question.id}`}
                            className="invisible w-0"
                            value={level.value}
                            checked={question.level === level.value}
                            onChange={(e) => updateQuestionField(index, 'level', parseInt(e.target.value))}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <h3 className="text-[#0e141b] text-base font-semibold leading-tight tracking-[-0.015em] pb-1 pt-3">Loại câu hỏi</h3>
                <div className="flex flex-wrap gap-2 py-2 max-w-[100%]">
                  {questionTypeOptions.map(qType => (
                    <label key={qType.value} className={`flex items-center gap-2 rounded-xl border border-solid py-[8px] px-[15px] cursor-pointer hover:border-blue-400 ${checkType(question.type) === qType.value ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-[#d0dbe7]'}`}>
                      <input
                        type="radio"
                        className="h-5 w-5 border-2 border-[#d0dbe7] bg-transparent text-transparent checked:border-[#1980e6] checked:bg-[image:var(--radio-dot-svg)] focus:outline-none focus:ring-0 focus:ring-offset-0 checked:focus:border-[#1980e6]"
                        name={`question-type-radio-group-${question.id}`}
                        value={qType.value}
                        checked={checkType(question.type) === qType.value}
                        onChange={(e) => updateQuestionField(index, 'type', e.target.value)}
                      />
                      <div className="flex grow flex-col">
                        <p className="text-[#0e141b] text-sm font-medium leading-normal">{qType.title}</p>
                        <p className="text-[#4e7397] text-sm font-normal leading-normal">{qType.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Question Choices Section */}
                <QuestionChoices
                  question={question}
                  onUpdateChoices={(choices) => updateQuestionChoices(index, choices)}
                  onRemoveChoice={(id) => handleRemoveChoice(question.id, id)}
                />
              </div>
            ))}
            <button
              onClick={addNewQuestion}
              className="mt-4 flex items-center justify-center w-full h-10 px-4 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 tracking-wide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>
              Thêm câu hỏi
            </button>
          </div>
        </div>

        {/* Right Pane: Preview */}
        <div className="flex-1 w-[40%] pl-2.5 pr-5 py-5 overflow-y-auto">
          <div className="sticky">
            <FullPreview
              data={fullPreviewData}
              onSurveyValueChange={handleSurveyValueChange}
            />
          </div>
          <div className="flex w-full max-w-screen-xl px-5 justify-between items-center mt-3">
            <button
              onClick={handleCancel}
              className="flex min-w-[84px] max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-300"
            >
              <span className="truncate">Cancel</span>
            </button>
            <button
              onClick={handleSaveQuestions}
              disabled={isSaving}
              className={`flex min-w-[84px] max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="truncate">{isSaving ? 'Saving...' : 'Save All Questions'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCreatePage;