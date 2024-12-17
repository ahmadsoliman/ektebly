import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import FileUpload from './components/FileUpload';
import Results from './components/Results';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import {
  TranscriptionResponse,
  TranscriptionResult,
  UploadState,
} from './types';

function App() {
  const [state, setState] = useState<UploadState>({
    file: null,
    isLoading: false,
    error: null,
    result: null,
    sessionId: null,
    messages: [],
  });

  const handleUpload = async (file: File, speakers: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('speakers', speakers.toString());

    try {
      const response = await fetch('http://localhost:8000/process-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const data: TranscriptionResponse = await response.json();
      setState((prev) => ({
        ...prev,
        isLoading: false,
        result: data.transcription,
        sessionId: data.session_id,
        messages: data.messages,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to process audio. Please try again. ' + error,
      }));
    }
  };

  // Update the handleUrlUpload function
  const handleUrlUpload = async (url: string, speakers: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('http://localhost:8000/process-audio-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          speakers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process audio URL');
      }

      const result: TranscriptionResult = await response.json();
      setState((prev) => ({ ...prev, isLoading: false, result }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to process audio URL. Please try again. ' + error,
      }));
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />
      <Hero />

      <div className='bg-white pt-0 pb-20'>
        <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='max-w-2xl mx-auto text-center mb-8'>
            <h2 className='text-3xl font-bold mb-4'>
              Start Converting Your Meetings
            </h2>
            <p className='text-gray-600'>Choose your preferred input method</p>
          </div>

          {state.error && (
            <div className='max-w-3xl mx-auto mb-8'>
              <div className='bg-red-50 text-red-700 p-4 rounded-md'>
                {state.error}
              </div>
            </div>
          )}

          <FileUpload
            onUpload={handleUpload}
            onUrlUpload={handleUrlUpload}
            isLoading={state.isLoading}
          />

          {state.result && state.sessionId && (
            <div className='mt-8'>
              <Results
                result={state.result}
                sessionId={state.sessionId}
                messages={state.messages}
              />
            </div>
          )}
        </div>
      </div>

      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;
