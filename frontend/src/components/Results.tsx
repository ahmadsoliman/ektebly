import { Download } from 'lucide-react';
import { TranscriptionResult } from '../types';

interface ResultsProps {
  result: TranscriptionResult;
}

export default function Results({ result }: ResultsProps) {
  const downloadResults = () => {
    const content = `
Transcription:
${result.transcript}

Summary:
${result.summary}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meeting-notes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8 border border-gray-100'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold'>Results</h2>
        <button
          onClick={downloadResults}
          className='flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800'
        >
          <Download className='h-4 w-4' />
          Download
        </button>
      </div>

      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-semibold mb-3'>Transcription</h3>
          <div className='bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto'>
            <p className='whitespace-pre-wrap'>{result.transcript}</p>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-semibold mb-3'>Summary</h3>
          <div className='bg-gray-50 p-4 rounded-md'>
            <p className='whitespace-pre-wrap'>{result.summary}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
