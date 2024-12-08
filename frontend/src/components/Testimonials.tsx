interface Testimonial {
  name: string;
  role: string;
  image: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Johnson',
    role: 'Product Manager at Tech Co',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
    quote: 'This tool has revolutionized our meeting workflow. The mixed-language support is exceptional!'
  },
  {
    name: 'Michael Chen',
    role: 'CEO at StartUp Inc',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
    quote: 'The AI summaries save me hours of work. It\'s like having a personal meeting assistant.'
  },
  {
    name: 'David Miller',
    role: 'Team Lead at Enterprise',
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=100&h=100',
    quote: 'Perfect for our international team meetings. The accuracy is impressive!'
  }
];

export default function Testimonials() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-gray-600">Trusted by professionals worldwide</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
