// --- Interfaces ---
export interface BaseChoice {
  id: string;
  content: string;
}

export interface MultipleChoiceOption extends BaseChoice {
  isCorrect: boolean;
  allowMultiple?: boolean;
}

export interface MatchingPair {
  id: string;
  text: string;
  side: 'left' | 'right';
}

export interface FillInBlankOption {
  id: string;
  content: string;
}

export interface SortingOption {
  id: string;
  content: string;
  order: number;
}

export interface SelectOption {
  id: string;
  content: string;
  blankCount: number;
}

export interface IndividualQuestion {
  id: string;
  questionText: string;
  level: string;
  category: string[];
  questionType: string;
  choices?: MultipleChoiceOption[] | MatchingPair[] | FillInBlankOption[] | SortingOption[];
}

export interface SharedMediaData {
  type: 'image' | 'audio' | 'video' | 'text';
  url?: string;
  fileName?: string;
  content?: string;
  file?: File;
}

export interface FullQuestionSetData {
  sharedMedia?: SharedMediaData;
  questions: IndividualQuestion[];
} 