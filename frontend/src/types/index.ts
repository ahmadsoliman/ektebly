export type Language = 'Arabic' | 'English' | 'Mixed';

export interface WordInfo {
  word: string;
  speaker: number;
  start_time: number;
  end_time: number;
}

export interface SentenceInfo {
  text: string;
  start_time: number;
  end_time: number;
}

export interface TranscriptionResult {
  transcript: {
    speakers: {
      [key: string]: SentenceInfo[];
    };
    words: WordInfo[];
    raw_text: string;
  };
  summary: string;
}

export interface UploadState {
  file: File | null;
  isLoading: boolean;
  error: string | null;
  result: TranscriptionResult | null;
  sessionId: string | null;
  messages: ChatMessage[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TranscriptionResponse {
  transcription: TranscriptionResult;
  session_id: string;
  messages: ChatMessage[];
}
