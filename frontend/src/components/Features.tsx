import { Brain, Users, Languages } from 'lucide-react';

const features = [
  {
    icon: Languages,
    title: 'Mixed-Language Transcription',
    description: 'Accurately transcribe meetings in multiple languages with speaker identification'
  },
  {
    icon: Users,
    title: 'Speaker Recognition',
    description: 'Automatically identify and label different speakers in your meetings'
  },
  {
    icon: Brain,
    title: 'AI Summary',
    description: 'Get intelligent meeting summaries with key points and action items'
  }
];

export default function Features() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-600">Everything you need for efficient meeting documentation</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center p-6">
              <div className="w-16 h-16 bg-gray-900/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}