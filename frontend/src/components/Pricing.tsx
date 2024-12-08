interface PricingTier {
  name: string;
  price: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    features: [
      '5 hours/month',
      'Basic transcription',
      'English only'
    ],
    buttonText: 'Get Started'
  },
  {
    name: 'Pro',
    price: '$29',
    features: [
      '50 hours/month',
      'Advanced transcription',
      'All languages',
      'AI summaries'
    ],
    buttonText: 'Get Started',
    isPopular: true
  },
  {
    name: 'Team',
    price: '$99',
    features: [
      'Unlimited hours',
      'All Pro features',
      'Team collaboration',
      'Priority support'
    ],
    buttonText: 'Contact Sales'
  }
];

export default function Pricing() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-gray-600">Choose the plan that works for you</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`${
                tier.isPopular 
                  ? 'border-2 border-gray-900' 
                  : 'border border-gray-200'
              } rounded-lg p-8 relative`}
            >
              {tier.isPopular && (
                <div className="absolute top-0 right-0 bg-gray-900 text-white px-3 py-1 text-sm rounded-bl-lg">
                  Popular
                </div>
              )}
              <h3 className="text-xl font-semibold mb-4">{tier.name}</h3>
              <div className="text-4xl font-bold mb-6">
                {tier.price}<span className="text-lg text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                className={`w-full py-2 rounded-md font-medium ${
                  tier.isPopular
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'border border-gray-200 hover:border-gray-900'
                }`}
              >
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
