import { Upload, X } from 'lucide-react';
import { useState } from 'react';
import { Language } from '../types';

interface FileUploadProps {
  onUpload: (file: File, language: Language) => void;
  isLoading: boolean;
}

export default function FileUpload({ onUpload, isLoading }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>('English');
  const [dragActive, setDragActive] = useState(false);

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
    if (files?.[0]?.type === 'audio/wav') {
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
      onUpload(selectedFile, language);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8 border border-gray-100">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Language
        </label>
        <select 
          className="w-full border-gray-200 rounded-md"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
        >
          <option value="English">English</option>
          <option value="Arabic">Arabic</option>
          <option value="Mixed">Mixed</option>
        </select>
      </div>

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
              Drag and drop your WAV file here, or click to select
            </p>
            <input
              type="file"
              accept=".wav"
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
    </div>
  );
}