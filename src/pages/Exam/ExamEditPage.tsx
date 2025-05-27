import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SearchableDialogMulti } from '@/components/Common/SearchableDialogMulti';
import { useAuth } from '@/contexts/AuthContext';
import { searchQuestions } from '@/api/lectureApi';
import { type Question } from '@/api/questionApi';
import AddIcon from '@/assets/add.svg';
import { getCourseById, type Course } from '@/api/courseApi';
import { updateExam, type CreateExamRequest, getExamQuestionsDetails } from '@/api/examApi';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import QuestionDetailPreview from "@/components/Question/QuestionDetailPreview";

interface ExamFormData {
  examName: string;
  numRecognitionQuestions: string;
  pointsPerRecognitionQuestion: string;
  numComprehensionQuestions: string;
  pointsPerComprehensionQuestion: string;
  numApplicationQuestions: string;
  pointsPerApplicationQuestion: string;
  numHighApplicationQuestions: string;
  pointsPerHighApplicationQuestion: string;
  enableOpenDateTime: boolean;
  openDateTime: string;
  enableCloseDateTime: boolean;
  closeDateTime: string;
  duration: string;
  revealAnswers: boolean;
  setTimeLimit: boolean;
  shuffleQuestions: boolean;
  allowSeeAnswers: boolean;
  allowReviewAfterSubmit: boolean;
  allowRetake: boolean;
  maxRetakeAttempts: string;
}

type ActiveTabType = 'general' | 'other' | 'questionBank';

// Hàm trợ giúp để chuyển đổi chuỗi ISO (UTC) sang chuỗi datetime-local
const formatISOToLocalDateTimeString = (isoString: string | null | undefined): string => {
  if (!isoString) return '';
  const date = new Date(isoString); // Date object này sẽ giữ thông tin múi giờ
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() trả về 0-11
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const ExamEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId: courseId, examId } = useParams<{ courseId?: string; examId?: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [isCourseLoading, setIsCourseLoading] = useState(true);
  const [isExamLoading, setIsExamLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<ActiveTabType>('general');
  const [formData, setFormData] = useState<ExamFormData>({
    examName: '',
    numRecognitionQuestions: '0',
    pointsPerRecognitionQuestion: '0',
    numComprehensionQuestions: '0',
    pointsPerComprehensionQuestion: '0',
    numApplicationQuestions: '0',
    pointsPerApplicationQuestion: '0',
    numHighApplicationQuestions: '0',
    pointsPerHighApplicationQuestion: '0',
    enableOpenDateTime: false,
    openDateTime: '',
    enableCloseDateTime: false,
    closeDateTime: '',
    duration: '45',
    revealAnswers: true,
    setTimeLimit: true,
    shuffleQuestions: false,
    allowSeeAnswers: true,
    allowReviewAfterSubmit: true,
    allowRetake: false,
    maxRetakeAttempts: '1',
  });

  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  const [isQuestionSearchOpen, setIsQuestionSearchOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);

  // Thêm các state mới cho chức năng tìm kiếm và sắp xếp trong tab kho câu hỏi
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [loadingAvailableQuestions, setLoadingAvailableQuestions] = useState(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [isSearchingQuestions, setIsSearchingQuestions] = useState(false);
  const [sortColumn, setSortColumn] = useState<'title' | 'level' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectAll, setSelectAll] = useState(false);

  // Thêm state mới cho Dialog
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // Thêm hàm helper để đếm số lượng câu hỏi theo từng loại
  const countQuestionsByLevel = (questions: Question[]) => {
    return questions.reduce((acc, q) => {
      const level = q.level;
      if (level === 1) acc.easy++;
      else if (level === 2) acc.medium++;
      else if (level === 3) acc.hard++;
      else if (level === 4) acc.veryHard++;
      return acc;
    }, { easy: 0, medium: 0, hard: 0, veryHard: 0 });
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        setIsCourseLoading(false);
        return;
      }

      try {
        const courseData = await getCourseById(courseId);
        setCourse(courseData);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setIsCourseLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    const fetchExamData = async () => {
      if (!examId) {
        setIsExamLoading(false);
        return;
      }

      try {
        const response = await getExamQuestionsDetails(examId);
        const exam = response.exam;
        const questions = response.questions;

        // Cập nhật form data từ dữ liệu đề thi
        setFormData({
          examName: exam.title,
          numRecognitionQuestions: exam.easyCount.toString(),
          pointsPerRecognitionQuestion: exam.easyScore.toString(),
          numComprehensionQuestions: exam.mediumCount.toString(),
          pointsPerComprehensionQuestion: exam.mediumScore.toString(),
          numApplicationQuestions: exam.hardCount.toString(),
          pointsPerApplicationQuestion: exam.hardScore.toString(),
          numHighApplicationQuestions: exam.veryHardCount.toString(),
          pointsPerHighApplicationQuestion: exam.veryHardScore.toString(),
          enableOpenDateTime: !!exam.openTime,
          // Sử dụng hàm trợ giúp để định dạng thời gian cho input datetime-local
          openDateTime: formatISOToLocalDateTimeString(exam.openTime),
          enableCloseDateTime: !!exam.closeTime,
          closeDateTime: formatISOToLocalDateTimeString(exam.closeTime),
          duration: exam.durationMinutes.toString(),
          revealAnswers: exam.allowViewAnswer,
          setTimeLimit: !!exam.durationMinutes && exam.durationMinutes > 0,
          shuffleQuestions: exam.shuffleQuestion,
          allowSeeAnswers: exam.allowViewAnswer,
          allowReviewAfterSubmit: exam.allowReview,
          allowRetake: exam.maxAttempts > 0,
          maxRetakeAttempts: exam.maxAttempts.toString(),
        });

        // Cập nhật danh sách câu hỏi đã chọn
        setSelectedQuestions(questions);
      } catch (error) {
        console.error('Error fetching exam:', error);
        toast.error('Có lỗi xảy ra khi tải dữ liệu đề thi');
      } finally {
        setIsExamLoading(false);
      }
    };

    fetchExamData();
  }, [examId]);

  useEffect(() => {
    const numRec = parseInt(formData.numRecognitionQuestions) || 0;
    const ptsRec = parseFloat(formData.pointsPerRecognitionQuestion) || 0;
    const numComp = parseInt(formData.numComprehensionQuestions) || 0;
    const ptsComp = parseFloat(formData.pointsPerComprehensionQuestion) || 0;
    const numApp = parseInt(formData.numApplicationQuestions) || 0;
    const ptsApp = parseFloat(formData.pointsPerApplicationQuestion) || 0;
    const numHighApp = parseInt(formData.numHighApplicationQuestions) || 0;
    const ptsHighApp = parseFloat(formData.pointsPerHighApplicationQuestion) || 0;

    const currentTotalQuestions = numRec + numComp + numApp + numHighApp;
    const currentTotalPoints = (numRec * ptsRec) + (numComp * ptsComp) + (numApp * ptsApp) + (numHighApp * ptsHighApp);

    setTotalQuestions(currentTotalQuestions);
    setTotalPoints(parseFloat(currentTotalPoints.toFixed(2)));
  }, [
    formData.numRecognitionQuestions, formData.pointsPerRecognitionQuestion,
    formData.numComprehensionQuestions, formData.pointsPerComprehensionQuestion,
    formData.numApplicationQuestions, formData.pointsPerApplicationQuestion,
    formData.numHighApplicationQuestions, formData.pointsPerHighApplicationQuestion,
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      if (name === 'maxRetakeAttempts') {
        const numValue = parseInt(value);
        if (numValue < 1 && value !== '') {
          setFormData(prev => ({ ...prev, [name]: '1' }));
        } else {
          setFormData(prev => ({ ...prev, [name]: value }));
        }
      } else if (type === 'number' && parseFloat(value) < 0) {
        setFormData(prev => ({ ...prev, [name]: '0' }));
      }
      else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  useEffect(() => {
    if (formData.allowRetake) {
      if (formData.maxRetakeAttempts === '' || parseInt(formData.maxRetakeAttempts) < 1) {
        setFormData(prev => ({ ...prev, maxRetakeAttempts: '1' }));
      }
    }
  }, [formData.allowRetake, formData.maxRetakeAttempts]);

  useEffect(() => {
    setFormData(prev => {
      const newSetTimeLimit = !!prev.duration && prev.duration !== "0" && prev.duration !== "";
      let newOpenDateTime = prev.openDateTime;
      let newCloseDateTime = prev.closeDateTime;

      if (!prev.enableOpenDateTime) {
        newOpenDateTime = '';
      }
      if (!prev.enableCloseDateTime) {
        newCloseDateTime = '';
      }

      return {
        ...prev,
        setTimeLimit: newSetTimeLimit,
        openDateTime: newOpenDateTime,
        closeDateTime: newCloseDateTime,
      };
    });
  }, [formData.duration, formData.enableOpenDateTime, formData.enableCloseDateTime]);

  const searchQuestionsHandler = async (keyword: string) => {
    if (!user || !course?.subjectId) {
      console.log('Missing user or course data:', { user, course });
      return [];
    }

    try {
      const data = await searchQuestions(keyword, course.subjectId, user.id);
      return data.map((q: any) => ({ ...q }));
    } catch (error) {
      console.error('Error searching questions:', error);
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.enableOpenDateTime && !formData.openDateTime) {
      toast.error('Vui lòng nhập thời gian mở đề hoặc tắt tùy chọn này.');
      return;
    }
    if (formData.enableCloseDateTime && !formData.closeDateTime) {
      toast.error('Vui lòng nhập thời gian đóng đề hoặc tắt tùy chọn này.');
      return;
    }

    // Kiểm tra số lượng câu hỏi trong kho
    const questionCounts = countQuestionsByLevel(selectedQuestions);
    const requiredCounts = {
      easy: parseInt(formData.numRecognitionQuestions) || 0,
      medium: parseInt(formData.numComprehensionQuestions) || 0,
      hard: parseInt(formData.numApplicationQuestions) || 0,
      veryHard: parseInt(formData.numHighApplicationQuestions) || 0
    };

    if (questionCounts.easy < requiredCounts.easy) {
      toast.error('Số lượng câu hỏi loại Nhận biết trong kho câu hỏi chưa đủ. Hãy chọn thêm.');
      return;
    }
    if (questionCounts.medium < requiredCounts.medium) {
      toast.error('Số lượng câu hỏi loại Thông hiểu trong kho câu hỏi chưa đủ. Hãy chọn thêm.');
      return;
    }
    if (questionCounts.hard < requiredCounts.hard) {
      toast.error('Số lượng câu hỏi loại Vận dụng trong kho câu hỏi chưa đủ. Hãy chọn thêm.');
      return;
    }
    if (questionCounts.veryHard < requiredCounts.veryHard) {
      toast.error('Số lượng câu hỏi loại Vận dụng cao trong kho câu hỏi chưa đủ. Hãy chọn thêm.');
      return;
    }

    // Chuyển đổi thời gian từ local (từ input datetime-local) sang UTC
    const convertToUTC = (localDateTime: string) => {
      if (!localDateTime) return undefined;
      const date = new Date(localDateTime); // Date này được hiểu là local time
      return date.toISOString(); // Chuyển sang UTC
    };

    const openTimeUTC = formData.enableOpenDateTime ? convertToUTC(formData.openDateTime) : undefined;
    const closeTimeUTC = formData.enableCloseDateTime ? convertToUTC(formData.closeDateTime) : undefined;

    if (formData.enableOpenDateTime && formData.enableCloseDateTime && openTimeUTC && closeTimeUTC && new Date(openTimeUTC) >= new Date(closeTimeUTC)) {
      toast.error('Thời gian đóng đề phải sau thời gian mở đề.');
      return;
    }
    if (totalQuestions <= 0 && selectedQuestions.length === 0) {
      toast.error('Tổng số câu hỏi hoặc số câu hỏi từ kho phải lớn hơn 0.');
      return;
    }
    if (formData.allowRetake && (parseInt(formData.maxRetakeAttempts) < 1 || formData.maxRetakeAttempts === '')) {
      toast.error('Số lần làm lại phải là một số lớn hơn hoặc bằng 1.');
      setFormData(prev => ({ ...prev, maxRetakeAttempts: '1' }));
      return;
    }
    if (!course?.id || !examId) {
      toast.error('Không thể cập nhật đề thi vì dữ liệu không khả dụng.');
      return;
    }

    try {
      const examData: CreateExamRequest = {
        classId: course.id,
        title: formData.examName,
        questionIds: selectedQuestions.map(q => q.id),
        easyCount: parseInt(formData.numRecognitionQuestions) || 0,
        mediumCount: parseInt(formData.numComprehensionQuestions) || 0,
        hardCount: parseInt(formData.numApplicationQuestions) || 0,
        veryHardCount: parseInt(formData.numHighApplicationQuestions) || 0,
        easyScore: parseFloat(formData.pointsPerRecognitionQuestion) || 0,
        mediumScore: parseFloat(formData.pointsPerComprehensionQuestion) || 0,
        hardScore: parseFloat(formData.pointsPerApplicationQuestion) || 0,
        veryHardScore: parseFloat(formData.pointsPerHighApplicationQuestion) || 0,
        openTime: openTimeUTC,
        closeTime: closeTimeUTC,
        maxScore: totalPoints + selectedQuestions.reduce((sum, q) => sum + (q.points || 0), 0),
        durationMinutes: parseInt(formData.duration) || 0,
        shuffleQuestion: formData.shuffleQuestions,
        shuffleChoice: formData.shuffleQuestions, // Giả sử bạn muốn đồng bộ cài đặt này
        categories: [], // Bạn có thể cần cập nhật logic này nếu có categories
        allowReview: formData.allowReviewAfterSubmit,
        allowViewAnswer: formData.revealAnswers, // Đã sửa: allowViewAnswer nên map với revealAnswers
        maxAttempts: formData.allowRetake ? parseInt(formData.maxRetakeAttempts) : 1
      };

      await updateExam(examId, examData);

      toast.success('Cập nhật đề thi thành công!');
      navigate(`/courses/${course.id}/exams`);
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error('Có lỗi xảy ra khi cập nhật đề thi. Vui lòng thử lại sau.');
    }
  };

  const renderToggleSwitch = (
    id: keyof ExamFormData,
    label: string,
    description: string
  ) => (
    <div className="flex items-center justify-between gap-4 bg-slate-100/50 dark:bg-slate-800/30 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[72px]">
      <div className="flex flex-col justify-center flex-grow">
        <p className="text-[#0d141c] dark:text-slate-100 text-base font-medium leading-normal line-clamp-1">
          {label}
        </p>
        <p className="text-[#49719c] dark:text-slate-400 text-sm font-normal leading-normal line-clamp-2">
          {description}
        </p>
      </div>
      <div className="shrink-0">
        <label
          htmlFor={id as string}
          className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out
            ${formData[id] ? 'bg-[#0d7cf2] justify-end' : 'bg-[#cbd5e1] dark:bg-slate-600 justify-start'}`}
        >
          <span
            className={`block h-[27px] w-[27px] rounded-full bg-white dark:bg-slate-300 transition-transform duration-200 ease-in-out shadow-md`}
            style={{ boxShadow: 'rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px' }}
          />
          <input
            type="checkbox"
            id={id as string}
            name={id as string}
            checked={!!formData[id]}
            onChange={handleInputChange}
            className="invisible absolute opacity-0 w-0 h-0"
          />
        </label>
      </div>
    </div>
  );

  const renderInlineToggle = (id: keyof ExamFormData, name: string) => (
    <label
      htmlFor={name}
      className={`relative flex h-[28px] w-[48px] cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out
        ${formData[id] ? 'bg-[#0d7cf2] justify-end' : 'bg-[#cbd5e1] dark:bg-slate-600 justify-start'}`}
    >
      <span
        className={`block h-[24px] w-[24px] rounded-full bg-white dark:bg-slate-300 transition-transform duration-200 ease-in-out shadow-sm`}
      />
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={!!formData[id]}
        onChange={handleInputChange}
        className="invisible absolute opacity-0 w-0 h-0"
      />
    </label>
  );

  const renderQuestionTypeInputs = (
    typeLabel: string,
    countName: keyof ExamFormData,
    pointsName: keyof ExamFormData
  ) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/30 mb-3">
      <div>
        <label htmlFor={countName as string} className="text-[#0d141c] dark:text-slate-200 text-sm font-medium leading-normal pb-1 block">
          Số câu {typeLabel}
        </label>
        <input
          id={countName as string}
          name={countName as string}
          type="number"
          placeholder="Số lượng"
          min="0"
          step="1"
          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-[#0d141c] dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0d7cf2] focus:border-transparent border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-10 placeholder:text-[#6b7f99] dark:placeholder:text-slate-400 p-2 text-sm font-normal leading-normal"
          value={formData[countName] as string}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <label htmlFor={pointsName as string} className="text-[#0d141c] dark:text-slate-200 text-sm font-medium leading-normal pb-1 block">
          Điểm mỗi câu {typeLabel}
        </label>
        <input
          id={pointsName as string}
          name={pointsName as string}
          type="number"
          placeholder="Điểm"
          min="0"
          step="0.05"
          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-[#0d141c] dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0d7cf2] focus:border-transparent border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-10 placeholder:text-[#6b7f99] dark:placeholder:text-slate-400 p-2 text-sm font-normal leading-normal"
          value={formData[pointsName] as string}
          onChange={handleInputChange}
          required
        />
      </div>
    </div>
  );

  // Hàm lấy văn bản hiển thị cho mức độ câu hỏi
  const getLevelText = (level: number) => {
    switch (level) {
      case 1:
        return 'Nhận biết';
      case 2:
        return 'Thông hiểu';
      case 3:
        return 'Vận dụng';
      case 4:
        return 'Vận dụng cao';
      default:
        return 'Unknown';
    }
  };

  // Hàm format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Màu cho từng level câu hỏi
  const levelColorClasses: { [key: string]: string } = {
    'Nhận biết': 'bg-green-100 text-green-800',
    'Thông hiểu': 'bg-blue-100 text-blue-800',
    'Vận dụng': 'bg-orange-100 text-orange-800',
    'Vận dụng cao': 'bg-red-100 text-red-800',
  };

  // Hàm xử lý sắp xếp câu hỏi
  const handleSort = (column: 'title' | 'level' | 'createdAt') => {
    if (sortColumn === column) {
      // Đảo chiều sắp xếp
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'createdAt' ? 'desc' : 'asc');
    }
  };

  // Sắp xếp danh sách câu hỏi
  const sortedAvailableQuestions = [...availableQuestions].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    if (sortColumn === 'title') {
      return a.title.localeCompare(b.title) * direction;
    } else if (sortColumn === 'level') {
      return (a.level - b.level) * direction;
    } else if (sortColumn === 'createdAt') {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
    }
    return 0;
  });

  // Hàm xử lý tìm kiếm câu hỏi
  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsSearchingQuestions(true);
      try {
        if (!user || !course?.subjectId) return;

        const data = await searchQuestions(searchInput, course.subjectId, user.id);
        setAvailableQuestions(data);
      } catch (error) {
        console.error('Error searching questions:', error);
        toast.error('Có lỗi xảy ra khi tìm kiếm câu hỏi');
      } finally {
        setIsSearchingQuestions(false);
      }
    }
  };

  // Hàm xử lý chọn/bỏ chọn tất cả câu hỏi
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      // Nếu chọn tất cả, thêm tất cả câu hỏi chưa được chọn vào danh sách
      const allSelectedIds = selectedQuestions.map(q => q.id);
      const newSelectedQuestions = [
        ...selectedQuestions,
        ...availableQuestions.filter(q => !allSelectedIds.includes(q.id))
      ];
      setSelectedQuestions(newSelectedQuestions);
    } else {
      setSelectedQuestions([]);
    }
  };

  // Hàm xử lý chọn/bỏ chọn một câu hỏi
  const handleSelectQuestion = (question: Question) => {
    const isSelected = selectedQuestions.some(q => q.id === question.id);

    if (isSelected) {
      // Nếu đã chọn, bỏ chọn
      setSelectedQuestions(prev => prev.filter(q => q.id !== question.id));
      setSelectAll(false);
    } else {
      // Nếu chưa chọn, thêm vào danh sách
      setSelectedQuestions(prev => [...prev, question]);

      // Kiểm tra nếu tất cả đã được chọn
      const allSelectedAfterAdd = availableQuestions.every(q =>
        selectedQuestions.some(sq => sq.id === q.id) || q.id === question.id
      );
      setSelectAll(allSelectedAfterAdd);
    }
  };

  // Tải danh sách câu hỏi khi tab kho câu hỏi được chọn
  useEffect(() => {
    if (activeTab === 'questionBank' && course?.subjectId && user) {
      setLoadingAvailableQuestions(true);
      searchQuestions('', course.subjectId, user.id)
        .then(data => {
          setAvailableQuestions(data);
        })
        .catch(error => {
          console.error('Error fetching available questions:', error);
        })
        .finally(() => {
          setLoadingAvailableQuestions(false);
        });
    }
  }, [activeTab, course?.subjectId, user]);

  const handleOpenPreview = (question: Question) => {
    setPreviewQuestion(question);
  };

  const handleClosePreview = () => {
    setPreviewQuestion(null);
  };

  if (isCourseLoading || isExamLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="text-blue-600">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden items-center"
        style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
      >
        <main className="px-4 sm:px-6 md:px-10 lg:px-40 flex flex-1 justify-center py-5 w-[calc(85%)]">
          <form onSubmit={handleSubmit} className="layout-content-container flex flex-col md:w-[600px] lg:w-[768px] py-5 gap-6 flex-1 space-y-3">
            <div className="p-4">
              <div className="flex min-w-72 flex-col gap-1">
                <h1 className="text-[#0d141c] dark:text-slate-100 text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Chỉnh sửa đề thi</h1>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg">
              <div className="pb-1 pt-2">
                <div className="flex border-b border-[#cedbe8] dark:border-slate-700 px-4 gap-4 sm:gap-8 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className={`flex-shrink-0 flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-3 transition-colors ${activeTab === 'general' ? 'border-b-[#0d7cf2] text-[#0d141c] dark:text-slate-100' : 'border-b-transparent text-[#49719c] dark:text-slate-400 hover:border-b-slate-300 dark:hover:border-b-slate-600'}`}
                  >
                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Thông tin chung</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('questionBank')}
                    className={`flex-shrink-0 flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-3 transition-colors ${activeTab === 'questionBank' ? 'border-b-[#0d7cf2] text-[#0d141c] dark:text-slate-100' : 'border-b-transparent text-[#49719c] dark:text-slate-400 hover:border-b-slate-300 dark:hover:border-b-slate-600'}`}
                  >
                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Kho câu hỏi</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('other')}
                    className={`flex-shrink-0 flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-3 transition-colors ${activeTab === 'other' ? 'border-b-[#0d7cf2] text-[#0d141c] dark:text-slate-100' : 'border-b-transparent text-[#49719c] dark:text-slate-400 hover:border-b-slate-300 dark:hover:border-b-slate-600'}`}
                  >
                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Cài đặt khác</p>
                  </button>
                </div>
              </div>

              {activeTab === 'general' && (
                <div className="p-4 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                      <label htmlFor="examName" className="text-[#0d141c] dark:text-slate-200 text-base font-medium leading-normal pb-2 block">Tên đề thi</label>
                      <input
                        id="examName"
                        name="examName"
                        type="text"
                        placeholder="Nhập tên đề thi"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141c] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:border-transparent border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 h-12 placeholder:text-[#6b7f99] dark:placeholder:text-slate-400 p-3 text-base font-normal leading-normal"
                        value={formData.examName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="duration" className="text-[#0d141c] dark:text-slate-200 text-base font-medium leading-normal pb-2 block">Thời gian làm bài (phút)</label>
                      <input
                        id="duration"
                        name="duration"
                        type="number"
                        placeholder="Nhập số phút"
                        min="0"
                        step="5"
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141c] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:border-transparent border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 h-12 placeholder:text-[#6b7f99] dark:placeholder:text-slate-400 p-3 text-base font-normal leading-normal"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <h3 className="text-[#0d141c] dark:text-slate-100 text-lg font-semibold leading-tight tracking-[-0.015em] pb-2">Phân bổ câu hỏi và điểm</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                      {renderQuestionTypeInputs("Nhận biết", "numRecognitionQuestions", "pointsPerRecognitionQuestion")}
                      {renderQuestionTypeInputs("Thông hiểu", "numComprehensionQuestions", "pointsPerComprehensionQuestion")}
                      {renderQuestionTypeInputs("Vận dụng", "numApplicationQuestions", "pointsPerApplicationQuestion")}
                      {renderQuestionTypeInputs("Vận dụng cao", "numHighApplicationQuestions", "pointsPerHighApplicationQuestion")}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-blue-700 dark:text-blue-300 text-base font-medium">Tổng số câu hỏi:</p>
                      <p className="text-blue-800 dark:text-blue-200 text-base font-semibold">{totalQuestions}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-blue-700 dark:text-blue-300 text-base font-medium">Tổng điểm:</p>
                      <p className="text-blue-800 dark:text-blue-200 text-base font-semibold">{totalPoints}</p>
                    </div>
                    {totalQuestions > 0 && totalPoints === 0 && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Lưu ý: Tổng điểm hiện tại là 0. Hãy chắc chắn rằng bạn đã nhập điểm cho các câu hỏi.</p>
                    )}
                    {totalQuestions <= 0 && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">Vui lòng nhập số lượng câu hỏi.</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start pt-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="openDateTime" className="text-[#0d141c] dark:text-slate-200 text-base font-medium leading-normal">Thời gian mở đề</label>
                        {renderInlineToggle('enableOpenDateTime', 'enableOpenDateTime')}
                      </div>
                      <input
                        id="openDateTime"
                        name="openDateTime"
                        type="datetime-local"
                        className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141c] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:border-transparent border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 h-12 placeholder:text-[#6b7f99] dark:placeholder:text-slate-400 p-3 text-base font-normal leading-normal ${!formData.enableOpenDateTime ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={formData.openDateTime}
                        onChange={handleInputChange}
                        disabled={!formData.enableOpenDateTime}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="closeDateTime" className="text-[#0d141c] dark:text-slate-200 text-base font-medium leading-normal">Thời gian đóng đề</label>
                        {renderInlineToggle('enableCloseDateTime', 'enableCloseDateTime')}
                      </div>
                      <input
                        id="closeDateTime"
                        name="closeDateTime"
                        type="datetime-local"
                        className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141c] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:border-transparent border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 h-12 placeholder:text-[#6b7f99] dark:placeholder:text-slate-400 p-3 text-base font-normal leading-normal ${!formData.enableCloseDateTime ? 'opacity-50 cursor-not-allowed' : ''}`}
                        value={formData.closeDateTime}
                        onChange={handleInputChange}
                        disabled={!formData.enableCloseDateTime}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'questionBank' && (
                <div className="p-4 space-y-4">
                  <div className='flex flex-row gap-4 items-center'>
                    <h3 className="text-[#0d141c] dark:text-slate-200 text-lg font-semibold leading-tight tracking-[-0.015em]">
                      Kho câu hỏi
                    </h3>
                    <button
                      type="button"
                      className="text-[#0d141c] dark:text-slate-200 flex items-center justify-center size-7 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 transition"
                      onClick={() => setIsQuestionSearchOpen(true)}
                    >
                      <img src={AddIcon} alt="Add" className='w-4 h-4' />
                    </button>
                  </div>

                  <div className="mt-2">
                    <div className="relative bg-white dark:bg-slate-700">
                      <input
                        type="text"
                        placeholder="Tìm kiếm câu hỏi... (Nhấn Enter)"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearch}
                        className="w-full px-4 py-2 rounded-lg border border-[#d0dbe7] dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0d7cf2] focus:border-transparent text-sm dark:bg-slate-700 dark:text-slate-100"
                      />
                      {isSearchingQuestions && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0d7cf2] dark:border-blue-400"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {loadingAvailableQuestions ? (
                    <div className="flex justify-center items-center p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1980e6] dark:border-blue-400"></div>
                    </div>
                  ) : (
                    <div className="flex overflow-hidden rounded-xl border border-[#d0dbe7] dark:border-slate-600 bg-white dark:bg-slate-800">
                      <table className="flex-1 w-full">
                        <thead>
                          <tr className="bg-white dark:bg-slate-800">
                            <th className="px-4 py-3 text-left text-[#0e141b] dark:text-slate-200 w-[5%] text-sm font-bold leading-normal">
                              <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAll}
                                className="accent-blue-500 size-4"
                              />
                            </th>
                            <th
                              className="px-4 py-3 text-left text-[#0e141b] dark:text-slate-200 w-[40%] text-sm font-bold leading-normal cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                              onClick={() => handleSort('title')}
                            >
                              Câu hỏi
                              {sortColumn === 'title' && (
                                <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                              )}
                            </th>
                            <th
                              className="px-4 py-3 text-left text-[#0e141b] dark:text-slate-200 w-[15%] text-sm font-bold leading-normal cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                              onClick={() => handleSort('level')}
                            >
                              Độ khó
                              {sortColumn === 'level' && (
                                <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                              )}
                            </th>
                            <th
                              className="px-4 py-3 text-left text-[#0e141b] dark:text-slate-200 w-[20%] text-sm font-bold leading-normal cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                              onClick={() => handleSort('createdAt')}
                            >
                              Ngày tạo
                              {sortColumn === 'createdAt' && (
                                <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                              )}
                            </th>
                            <th className="px-4 py-3 text-left text-[#0e141b] dark:text-slate-200 w-[20%] text-sm font-bold leading-normal">
                              Tag
                            </th>
                            <th className="h-[72px] px-4 py-2 text-[#0e141b] dark:text-slate-200 text-sm font-bold leading-normal align-top pt-3">
                              Xem trước
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedAvailableQuestions.length === 0 ? (
                            <tr className="border-t border-t-[#d0dbe7] dark:border-slate-600">
                              <td colSpan={5} className="h-[72px] px-4 py-2 text-[#4e7397] dark:text-slate-400 text-sm font-normal leading-normal text-center">
                                Không tìm thấy câu hỏi
                              </td>
                            </tr>
                          ) : (
                            sortedAvailableQuestions.map((q) => {
                              const isSelected = selectedQuestions.some(sq => sq.id === q.id);
                              return (
                                <tr
                                  key={q.id}
                                  className={`border-t border-t-[#d0dbe7] dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                >
                                  <td className="h-[72px] px-4 py-2 text-[#0e141b] dark:text-slate-200 text-sm font-normal leading-normal align-top pt-3">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleSelectQuestion(q)}
                                      className="accent-blue-500 size-4"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </td>
                                  <td
                                    className="h-[72px] px-4 py-2 text-[#0e141b] dark:text-slate-200 text-sm font-normal leading-normal align-top pt-3"
                                    onClick={() => handleSelectQuestion(q)}
                                  >
                                    {q.title}
                                  </td>
                                  <td
                                    className="h-[72px] px-4 py-2 text-sm font-normal leading-normal align-top pt-3"
                                    onClick={() => handleSelectQuestion(q)}
                                  >
                                    <button
                                      className={`flex min-w-[70px] max-w-[120px] cursor-default items-center justify-center overflow-hidden rounded-md h-7 px-3 text-xs font-medium leading-normal w-full ${levelColorClasses[getLevelText(q.level)] || 'bg-[#d0dbe7] text-[#0e141b]'}`}
                                    >
                                      <span className="truncate">{getLevelText(q.level)}</span>
                                    </button>
                                  </td>
                                  <td
                                    className="h-[72px] px-4 py-2 text-[#4e7397] dark:text-slate-400 text-sm font-normal leading-normal align-top pt-3"
                                    onClick={() => handleSelectQuestion(q)}
                                  >
                                    {formatDate(q.createdAt)}
                                  </td>
                                  <td
                                    className="h-[72px] px-4 py-2 text-sm font-normal leading-normal align-top pt-3"
                                    onClick={() => handleSelectQuestion(q)}
                                  >
                                    <span className="block max-w-[150px]">{q.categories?.join(', ') || 'No categories'}</span>
                                  </td>
                                  <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal align-top pt-3">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleOpenPreview(q);
                                      }}
                                      className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 active:bg-gray-200 transition"
                                    >
                                      <span className="text-gray-500">👁️</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'other' && (
                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="text-[#0d141c] dark:text-slate-200 text-lg font-semibold leading-tight tracking-[-0.015em] pb-2">Cài đặt chung</h3>
                    <div className="space-y-3">
                      {renderToggleSwitch(
                        'revealAnswers',
                        'Xem đáp án',
                        'Học sinh sẽ có thể xem đáp án đúng và cách làm (nếu có).'
                      )}
                      {renderToggleSwitch(
                        'shuffleQuestions',
                        'Trộn câu hỏi và lựa chọn',
                        'Thứ tự câu hỏi và các lựa chọn (nếu có) sẽ được xáo trộn ngẫu nhiên.'
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-[#0d141c] dark:text-slate-200 text-lg font-semibold leading-tight tracking-[-0.015em] pb-2">Làm lại bài thi</h3>
                    <div className="space-y-3">
                      {renderToggleSwitch(
                        'allowRetake',
                        'Cho phép học viên làm lại bài thi',
                        'Nếu được bật, học viên có thể làm lại bài thi số lần nhất định.'
                      )}
                      {formData.allowRetake && (
                        <div className="flex items-center gap-4 bg-slate-100/50 dark:bg-slate-800/30 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700">
                          <label htmlFor="maxRetakeAttempts" className="text-[#0d141c] dark:text-slate-200 text-base font-medium leading-normal whitespace-nowrap">
                            Số lần làm lại tối đa:
                          </label>
                          <input
                            id="maxRetakeAttempts"
                            name="maxRetakeAttempts"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Số lần"
                            className="form-input flex w-full sm:w-auto min-w-[80px] max-w-[120px] flex-1 resize-none overflow-hidden rounded-md text-[#0d141c] dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0d7cf2] focus:border-transparent border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-10 placeholder:text-[#6b7f99] dark:placeholder:text-slate-400 p-2 text-sm font-normal leading-normal"
                            value={formData.maxRetakeAttempts}
                            onChange={handleInputChange}
                            required={formData.allowRetake}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-[#0d141c] dark:text-slate-200 text-lg font-semibold leading-tight tracking-[-0.015em] pb-2">Tùy chọn xem lại</h3>
                    <div className="space-y-3">
                      {renderToggleSwitch(
                        'allowReviewAfterSubmit',
                        'Cho phép học viên xem lại bài thi sau khi nộp',
                        'Học viên có thể mở lại và xem toàn bộ bài thi sau khi đã nộp.'
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-center gap-3 px-4 py-6 sticky bottom-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"> {/* Added bg for sticky footer */}
              <button
                type="button"
                onClick={() => navigate(`/courses/${courseId}/exams`)}
                className="flex w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-6 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-[#0d141c] dark:text-slate-100 text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
              >
                <span className="truncate">Huỷ</span>
              </button>
              <button
                type="submit"
                className="flex w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-6 bg-[#0d7cf2] hover:bg-[#0b68d1] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
              >
                <span className="truncate">Cập nhật</span>
              </button>
            </div>
          </form>
        </main>
      </div>
      <ToastContainer />
      <SearchableDialogMulti<Question>
        isOpen={isQuestionSearchOpen}
        onClose={() => setIsQuestionSearchOpen(false)}
        title="Tìm kiếm câu hỏi"
        searchPlaceholder="Nhập từ khóa tìm kiếm câu hỏi (+ enter)"
        onSearch={searchQuestionsHandler}
        renderItem={(question, selected, onToggle) => {
          return (
            <div
              key={question.id}
              onClick={() => onToggle(question)}
              className={`cursor-pointer border rounded-lg p-3 mb-2 transition ${selected ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600'}`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected}
                  readOnly
                  className="accent-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <p className="font-medium text-[#0d141c] dark:text-slate-100">{question.title}</p>
                  {question.sharedMedia && (
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                      {question.sharedMedia.title}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        }}
        onItemsSelected={(questions) => {
          setSelectedQuestions(prev => {
            const newQuestions = questions.filter(q => !prev.find(p => p.id === q.id));
            return [...prev, ...newQuestions];
          });
        }}
        confirmButtonText="Thêm các câu hỏi đã chọn"
      />
      <Dialog open={!!previewQuestion} onOpenChange={() => handleClosePreview()}>
        <DialogContent className="max-w-4xl">
          {previewQuestion && (
            <QuestionDetailPreview
              question={previewQuestion}
              showFunction={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExamEditPage;