import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { IndividualQuestion, SharedMediaData, FullQuestionSetData, MultipleChoiceOption, MatchingColumn, FillInBlankOption, SortingOption } from '@/components/Question/types';
import FullPreview from '@/components/Question/FullPreview';
import QuestionChoices from '@/components/Question/QuestionChoices';
import * as questionApi from '@/api/questionApi';
import { type LocationState, type SurveyValue, getQuestionsBySharedMedia } from '@/api/questionApi';
import RemoveIcon from '@/assets/remove.svg';
import { ConfirmationDialog } from '@/components/Common/ConfirmationDialog';

const QuestionEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const { subjectId } = location.state as LocationState || {};

  const [sharedMedia, setSharedMedia] = useState<SharedMediaData | undefined>(undefined);
  const [questions, setQuestions] = useState<IndividualQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [surveyValues, setSurveyValues] = useState<{ [key: string]: SurveyValue }>({});
  const [isSharedMediaDialogOpen, setIsSharedMediaDialogOpen] = useState(false);
  const [sharedMediaUsageCount, setSharedMediaUsageCount] = useState(0);
  const [sharedMediaId, setSharedMediaId] = useState<string | null>(null);
  const [newQuestionIds, setNewQuestionIds] = useState<Set<string>>(new Set());

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

  // Question Handlers
  const addNewQuestion = () => {
    const newId = Date.now().toString();
    setQuestions(prevQuestions => [
      ...prevQuestions,
      {
        id: newId,
        questionText: '',
        level: 2,
        type: 'radio',
        choices: [],
        tags: ''
      }
    ]);
    setNewQuestionIds(prev => new Set([...prev, newId]));
  };

  const removeQuestion = (id: string) => {
    setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== id));
    setNewQuestionIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // Init question(s)
  const getCorrectAnswer = (question: IndividualQuestion) => {
    switch (question.type) {
      case 'radio':
        const mcChoices = question.choices as MultipleChoiceOption[];
        return mcChoices.find(choice => choice.isCorrect)?.value;
      case 'checkbox':
        const mcOptions = question.choices as MultipleChoiceOption[];
        return mcOptions.filter(option => option.isCorrect).map(option => option.value);
      case 'itemConnector':
        return question.matchingPairs;
      case 'ranking':
        const sortingChoices = question.choices as SortingOption[];
        return sortingChoices
          .filter(option => option.orderIndex !== null)
          .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
          .map(choice => choice.value);
      case 'shortAnswer':
        return (question.choices as FillInBlankOption[])?.[0]?.value;
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) return;

      try {
        const question = await questionApi.getQuestionDetail(id);

        const individualQuestion: IndividualQuestion = {
          id: question.id,
          questionText: question.title,
          level: question.level,
          type: question.type,
          choices: question.type === 'itemConnector'
            ? question.matchingColumns?.map(column => ({
              id: column.id,
              value: column.id,
              text: column.label,
              side: column.side,
            } as MatchingColumn))
            : question.choices?.map(choice => ({
              id: choice.id,
              value: choice.value,
              content: choice.text,
              isCorrect: choice.isCorrect,
              orderIndex: choice.orderIndex,
              allowMultiple: question.type === 'checkbox'
            } as MultipleChoiceOption)),
          matchingColumns: question.matchingColumns || [],
          matchingPairs: question.matchingPairs || [],
          tags: question.categories.join(' ')
        };

        setQuestions([individualQuestion]);
        setSurveyValues({
          ...surveyValues, [individualQuestion.id]: {
            type: individualQuestion.type,
            name: individualQuestion.questionText,
            question: {
              name: individualQuestion.questionText,
              title: individualQuestion.questionText,
            },
            value: getCorrectAnswer(individualQuestion)
          }
        });

        // Handle shared media if exists
        if (question.sharedMedia) {
          if (question.sharedMedia.mediaType === 0 && question.sharedMedia.text) {
            setSharedMedia({
              type: 'text',
              content: question.sharedMedia.text
            });
            // Check if shared media is used by other questions
            if (question.sharedMedia.usageCount > 1) {
              setSharedMediaUsageCount(question.sharedMedia.usageCount);
              setSharedMediaId(question.sharedMedia.id);
              setIsSharedMediaDialogOpen(true);
            }
          } else if (question.sharedMedia.mediaUrl) {
            setSharedMedia({
              type: question.sharedMedia.mediaType === 1 ? 'image' : question.sharedMedia.mediaType === 2 ? 'audio' : 'video',
              url: `${question.sharedMedia.mediaUrl}`,
              fileName: question.sharedMedia.title
            });
            // Check if shared media is used by other questions
            if (question.sharedMedia.usageCount > 1) {
              setSharedMediaUsageCount(question.sharedMedia.usageCount);
              setSharedMediaId(question.sharedMedia.id);
              setIsSharedMediaDialogOpen(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching question:', error);
        toast.error('Không thể tải thông tin câu hỏi. Vui lòng thử lại.');
        navigate(-1);
      }
    };

    fetchQuestion();
  }, [id, navigate]);

  const handleLoadSharedQuestions = async () => {
    if (!sharedMediaId) return;

    try {
      const sharedQuestions = await getQuestionsBySharedMedia(sharedMediaId);
      const additionalQuestions = sharedQuestions
        .filter(q => q.id !== id)
        .map(q => ({
          id: q.id,
          questionText: q.title,
          level: q.level,
          type: q.type,
          choices: q.choices?.map(choice => ({
            id: choice.id,
            value: choice.value,
            content: choice.text,
            isCorrect: choice.isCorrect,
            orderIndex: choice.orderIndex,
          })) || [],
          matchingColumns: q.matchingColumns || [],
          matchingPairs: q.matchingPairs || [],
          tags: q.categories.join(' ')
        }));

      setQuestions(prev => [...prev, ...additionalQuestions]);
      const converted: { [key: string]: SurveyValue } = {};
      for (const question of additionalQuestions) {
        converted[question.id] = {
          type: question.type,
          name: question.questionText,
          question: {
            name: question.questionText,
            title: question.questionText,
          },
          value: getCorrectAnswer(question)
        };
      }

      setSurveyValues(prev => ({
        ...prev,
        ...converted
      }));

      toast.success(`Đã tải thêm ${additionalQuestions.length} câu hỏi khác.`);
    } catch (error) {
      console.error('Error loading shared questions:', error);
      toast.error('Không thể tải thêm câu hỏi. Vui lòng thử lại.');
    } finally {
      setIsSharedMediaDialogOpen(false);
    }
  };

  // --- Shared Media Handlers ---
  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSharedMedia({
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'video',
          url: e.target?.result as string,
          fileName: file.name,
          file: file
        });
      };
      if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        reader.readAsDataURL(file);
      } else {
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

  // --- Individual Question Handlers ---
  const updateQuestionField = <K extends keyof IndividualQuestion>(index: number, field: K, value: IndividualQuestion[K]) => {
    setQuestions(prevQuestions =>
      prevQuestions.map((q, i) => {
        if (i !== index) return q;

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

  // --- Survey Handlers ---
  const handleSurveyValueChange = useCallback((questionId: string, surveyDataFromPreview: SurveyValue) => {
    const questionInState = questions.find(q => q.id === questionId);
    if (!questionInState) {
      return;
    }

    let rawAnswerValue = surveyDataFromPreview.value;

    if (questionInState.type === 'itemConnector' && Array.isArray(rawAnswerValue)) {
      const leftItemIds = (questionInState.choices as MatchingColumn[])
        .filter(c => c.side === 'left')
        .map(c => c.id);
      const rightItemIds = (questionInState.choices as MatchingColumn[])
        .filter(c => c.side === 'right')
        .map(c => c.id);

      const cleanedConnections = rawAnswerValue.filter((pair: { from: string, to: string }) =>
        leftItemIds.includes(pair.from) && rightItemIds.includes(pair.to)
      );
      rawAnswerValue = cleanedConnections;
    }

    surveyDataFromPreview.value = rawAnswerValue;

    setSurveyValues(prev => ({
      ...prev,
      [questionId]: surveyDataFromPreview
    }));
  }, [questions]);

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
        question.choices = (question.choices as MultipleChoiceOption[]).filter(c => c.id !== removedChoiceId);
      }

      return prevAnswers;
    });
  }, [questions]);

  // --- Save Question ---
  const handleSaveQuestion = async () => {
    if (!id) return;

    // Validate answers
    const questionsWithoutAnswers = questions.filter(question => {
      const surveyValue = surveyValues[question.id];
      if (!surveyValue || (surveyValue.value === undefined || surveyValue.value === null || surveyValue.value === '' || (Array.isArray(surveyValue.value) && surveyValue.value.length === 0))) return true;

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
      let currentSharedMediaId: string | undefined = sharedMediaId || undefined;

      // Handle shared media if exists
      if (sharedMedia) {
        if (sharedMedia.type === 'text' && sharedMedia.content) {
          if (sharedMediaId) {
            // Update existing shared media
            const response = await questionApi.updateSharedMedia(sharedMediaId, {
              title: 'Shared Text',
              mediaType: 0,
              text: sharedMedia.content
            });
            currentSharedMediaId = response.id;
          } else {
            // Create new shared media
            const response = await questionApi.uploadSharedMedia({
              file: new File([sharedMedia.content], 'text.txt', { type: 'text/plain' }),
              title: 'Shared Text',
              mediaType: 0,
              text: sharedMedia.content
            });
            currentSharedMediaId = response.id;
          }
        } else if (sharedMedia.file) {
          if (sharedMediaId) {
            // Update existing shared media
            const response = await questionApi.updateSharedMedia(sharedMediaId, {
              file: sharedMedia.file,
              title: sharedMedia.fileName || 'Untitled Media',
              mediaType: sharedMedia.type === 'image' ? 1 : sharedMedia.type === 'audio' ? 2 : 3,
            });
            currentSharedMediaId = response.id;
          } else {
            // Create new shared media
            const response = await questionApi.uploadSharedMedia({
              file: sharedMedia.file,
              title: sharedMedia.fileName || 'Untitled Media',
              mediaType: sharedMedia.type === 'image' ? 1 : sharedMedia.type === 'audio' ? 2 : 3,
            });
            currentSharedMediaId = response.id;
          }
        }
      }

      // Process each question
      for (const question of questions) {
        const surveyValue = surveyValues[question.id];
        const isNewQuestion = newQuestionIds.has(question.id);

        if (isNewQuestion) {
          // Create new question
          const createdQuestion = await questionApi.createQuestion({
            title: question.questionText,
            type: question.type === 'radio' && (question.choices as MultipleChoiceOption[])?.[0]?.allowMultiple
              ? 'checkbox'
              : question.type,
            level: question.level,
            subjectId: subjectId,
            sharedMediaId: currentSharedMediaId,
            categories: question.tags.split(' ').filter(tag => tag !== '').map(tag => tag[0] === '#' ? tag : `#${tag}`)
          });

          // Create choices based on question type
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
                isCorrect = surveyValue?.value === choice.value;
              } else if (question.type === 'checkbox') {
                isCorrect = surveyValue?.value.includes(choice.value);
              } else if (question.type === 'ranking') {
                const idx = surveyValue?.value?.indexOf(choice.value);
                orderIndex = idx !== -1 ? idx + 1 : null;
              }

              return {
                text: choice.content || null,
                value: choice.value,
                orderIndex,
                isCorrect: isCorrect
              };
            });

            await questionApi.createChoicesBatch({
              questionId: createdQuestion.id,
              choices: choicesToCreate
            });
          }
        } else {
          await questionApi.updateQuestion(question.id, {
            title: question.questionText,
            type: question.type === 'radio' && (question.choices as MultipleChoiceOption[])?.[0]?.allowMultiple
              ? 'checkbox'
              : question.type,
            level: question.level,
            sharedMediaId: currentSharedMediaId,
            categories: question.tags.split(' ').filter(tag => tag !== '').map(tag => tag[0] === '#' ? tag : `#${tag}`)
          });

          // Update choices based on question type
          if (question.type === 'itemConnector') {
            const leftItems = (question.choices as any[]).filter(c => c.side === 'left');
            const rightItems = (question.choices as any[]).filter(c => c.side === 'right');

            const pairs = surveyValue?.value?.map((pair: { from: string, to: string }) => {
              const leftIndex = leftItems.findIndex(item => item.id === pair.from);
              const rightIndex = rightItems.findIndex(item => item.id === pair.to);
              return { leftIndex, rightIndex };
            }) || [];

            await questionApi.createMatchingQuestion({
              questionId: question.id,
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
              questionId: question.id,
              choices: choicesToCreate
            });
          } else {
            const choices = question.choices as any[];
            const choicesToCreate = choices.map((choice, _) => {
              let isCorrect = false;
              let orderIndex = null;

              if (question.type === 'radio') {
                isCorrect = surveyValue?.value === (choice.value || choice.id);
              } else if (question.type === 'checkbox') {
                isCorrect = surveyValue?.value.includes(choice.value || choice.id);
              } else if (question.type === 'ranking') {
                const idx = surveyValue?.value?.indexOf(choice.value);
                orderIndex = idx !== -1 ? idx + 1 : null;
              }

              return {
                text: choice.content || null,
                value: choice.value || choice.id,
                orderIndex,
                isCorrect: isCorrect
              };
            });

            await questionApi.createChoicesBatch({
              questionId: question.id,
              choices: choicesToCreate
            });
          }
        }
      }

      toast.success('Cập nhật câu hỏi thành công!');
      navigate('/question-bank');
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Có lỗi xảy ra khi cập nhật câu hỏi. Vui lòng thử lại.');
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
                    placeholder="Paste or type your passage here..."
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
                {newQuestionIds.has(question.id) && (
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                    title="Remove this question"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                  </button>
                )}
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
                        <label key={level.label} className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 text-xs font-medium leading-normal
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
                    <label key={qType.value} className={`flex items-center gap-2 rounded-xl border border-solid py-[8px] px-[15px] cursor-pointer hover:border-blue-400 ${question.type === qType.value || (question.type === "checkbox" && qType.value === "radio") ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-[#d0dbe7]'}`}>
                      <input
                        type="radio"
                        className="h-5 w-5 border-2 border-[#d0dbe7] bg-transparent text-transparent checked:border-[#1980e6] checked:bg-[image:var(--radio-dot-svg)] focus:outline-none focus:ring-0 focus:ring-offset-0 checked:focus:border-[#1980e6]"
                        name={`question-type-radio-group-${question.id}`}
                        value={qType.value}
                        checked={question.type === qType.value || (question.type === "checkbox" && qType.value === "radio")}
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
            {sharedMedia && (
              <button
                onClick={addNewQuestion}
                className="mt-4 flex items-center justify-center w-full h-10 px-4 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 tracking-wide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>
                Thêm câu hỏi
              </button>
            )}
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
              <span className="truncate">Hủy</span>
            </button>
            <button
              onClick={handleSaveQuestion}
              disabled={isSaving}
              className={`flex min-w-[84px] max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="truncate">{isSaving ? 'Đang lưu...' : 'Lưu câu hỏi'}</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isSharedMediaDialogOpen}
        onClose={() => setIsSharedMediaDialogOpen(false)}
        title="Media được dùng chung"
        message={`Còn ${sharedMediaUsageCount - 1} câu hỏi khác đang dùng chung media này, bạn có muốn load thêm các câu hỏi đó không?`}
        onConfirm={handleLoadSharedQuestions}
        confirmButtonText="Load thêm"
        cancelButtonText="Không"
        confirmButtonColorClass="bg-blue-600 hover:bg-blue-700"
      />
    </div>
  );
};

export default QuestionEditPage; 