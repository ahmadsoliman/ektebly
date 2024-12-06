import { Brain } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-white pb-0">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold leading-tight text-gray-900 mb-6">
              Focus on What Matters.<br/>Let AI Handle the Notes
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Auto-transcribe & summarize meetings in Arabic/English with advanced AI technology. Save time and never miss important details.
            </p>
            <div className="flex space-x-4">
              <button className="rounded-md bg-gray-900 text-white px-8 py-3 font-medium text-lg hover:bg-gray-800">
                Try Free
              </button>
              <button className="rounded-md border border-gray-200 hover:border-gray-900 px-8 py-3 font-medium text-lg">
                See Pricing
              </button>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=600&h=500" 
              alt="Hero" 
              className="w-full object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}