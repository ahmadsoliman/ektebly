export interface TranscriptionResult {
  transcript: string;
  summary: string;
}

export interface UploadState {
  file: File | null;
  isLoading: boolean;
  error: string | null;
  result: TranscriptionResult | null;
}
