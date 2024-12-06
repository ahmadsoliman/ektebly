export type Language = 'Arabic' | 'English' | 'Mixed';

export interface TranscriptionResult {
  transcript: string;
  summary: string;
}

export interface UploadState {
  file: File | null;
  language: Language;
  isLoading: boolean;
  error: string | null;
  result: TranscriptionResult | null;
}
