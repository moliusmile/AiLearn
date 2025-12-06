export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-based index
  explanation: string;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ExplanationState {
  text: string;
  isComplete: boolean;
}

export interface ImageState {
  illustrationUrl: string | null;
  diagramUrl: string | null;
  isIllustrationLoading: boolean;
  isDiagramLoading: boolean;
}

export interface QuizState {
  data: QuizData | null;
  isLoading: boolean;
}