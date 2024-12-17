import { Download } from 'lucide-react';
import { TranscriptionResult } from '../types';
import { formatTime } from '../utils/time';
import { useState } from 'react';

interface ResultsProps {
  result: TranscriptionResult;
}

interface WordTooltipProps {
  startTime: number;
  endTime: number;
}

const WordTooltip = ({ startTime, endTime }: WordTooltipProps) => (
  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap'>
    {formatTime(startTime)} - {formatTime(endTime)}
  </div>
);

export default function Results({ result }: ResultsProps) {
  const [hoveredWord, setHoveredWord] = useState<number | null>(null);

  const downloadResults = () => {
    const content = JSON.stringify(result, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription-results.json';
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
          <div className='space-y-4'>
            {Object.entries(result.transcript?.speakers || {}).map(
              ([speakerId, sentences]) => (
                <div key={speakerId} className='bg-gray-50 p-4 rounded-md'>
                  <div className='font-medium text-gray-900 mb-2'>
                    {speakerId.replace('_', ' ').toUpperCase()}
                  </div>
                  {sentences.map((sentence, sentenceIndex) => (
                    <div
                      key={sentenceIndex}
                      className='text-gray-700 flex flex-wrap'
                      //  flex-row-reverse for rtl
                    >
                      {result.transcript?.words
                        .filter(
                          (word) =>
                            word.start_time >= sentence.start_time &&
                            word.end_time <= sentence.end_time
                        )
                        .map((word, wordIndex) => (
                          <div
                            key={wordIndex}
                            className='relative inline hover:bg-gray-200 cursor-pointer px-0.5 rounded'
                            onMouseEnter={() => setHoveredWord(wordIndex)}
                            onMouseLeave={() => setHoveredWord(null)}
                          >
                            {word.word}
                            {hoveredWord === wordIndex && (
                              <WordTooltip
                                startTime={word.start_time}
                                endTime={word.end_time}
                              />
                            )}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )
            )}
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
