import { Upload, X, Mic, Link } from 'lucide-react';
import { useState, useRef } from 'react';

interface FileUploadProps {
  onUpload: (file: File) => void;
  onUrlUpload: (url: string) => void;
  isLoading: boolean;
}

export default function FileUpload({ onUpload, onUrlUpload, isLoading }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [url, setUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const handleUrlSubmit = () => {
    if (url) {
      onUrlUpload(url);
      setUrl('');
      setShowUrlInput(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        setSelectedFile(file);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8 border border-gray-100">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => {
            setShowUrlInput(false);
            document.getElementById('file-input')?.click();
          }}
          className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:border-gray-900"
        >
          <Upload className="h-6 w-6 mb-2" />
          <span>Upload File</span>
        </button>

        <button
          onClick={() => {
            setShowUrlInput(true);
            setSelectedFile(null);
          }}
          className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:border-gray-900"
        >
          <Link className="h-6 w-6 mb-2" />
          <span>Enter URL</span>
        </button>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex flex-col items-center justify-center p-6 border rounded-lg ${
            isRecording 
              ? 'border-red-500 text-red-500' 
              : 'border-gray-200 hover:border-gray-900'
          }`}
        >
          <Mic className="h-6 w-6 mb-2" />
          <span>{isRecording ? 'Stop Recording' : 'Record Audio'}</span>
        </button>
      </div>

      {showUrlInput ? (
        <div className="space-y-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter audio file URL"
            className="w-full p-2 border border-gray-200 rounded-md"
          />
          <button
            onClick={handleUrlSubmit}
            disabled={!url || isLoading}
            className={`w-full py-3 rounded-md font-medium ${
              !url || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isLoading ? 'Processing...' : 'Process URL'}
          </button>
        </div>
      ) : (
        <>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!selectedFile ? (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop your audio file here, or click to select
                </p>
                <input
                  id="file-input"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                <span className="text-gray-900 font-medium">{selectedFile.name}</span>
                <button 
                  onClick={removeFile}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className={`w-full mt-6 py-3 rounded-md font-medium ${
              !selectedFile || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isLoading ? 'Processing...' : 'Start Transcription'}
          </button>
        </>
      )}
    </div>
  );
}
