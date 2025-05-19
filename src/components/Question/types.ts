// --- Interfaces ---
export interface BaseChoice {
  id: string;
  content: string;
}

export interface MultipleChoiceOption extends BaseChoice {
  isCorrect: boolean;
  allowMultiple?: boolean;
  value: string;
}

export interface MatchingColumn {
  id: string;
  text: string;
  side: 'left' | 'right';
}

export interface FillInBlankOption {
  id: string;
  content: string;
  value: string;
}

export interface SortingOption {
  id: string;
  content: string;
  orderIndex: number;
  value: string;
}

export interface IndividualQuestion {
  id: string;
  questionText: string;
  level: number;
  type: string;
  choices?: MultipleChoiceOption[] | MatchingColumn[] | FillInBlankOption[] | SortingOption[];
  matchingColumns?: Array<{
    id: string;
    label: string;
    side: string;
  }>;
  matchingPairs?: Array<{
    id: string;
    from: string;
    to: string;
  }>;
  tags: string;
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