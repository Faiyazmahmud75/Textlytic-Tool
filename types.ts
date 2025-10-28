export enum Tool {
  Formatter = 'formatter',
  Counter = 'counter',
}

export interface TopWord {
  word: string;
  count: number;
  density: number;
}

export interface AnalysisResult {
  totalWordCount: number;
  totalCharCount: number;
  totalCharCountNoSpaces: number;
  preview: string;
  topWords: TopWord[];
}
