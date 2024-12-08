export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="h-8 w-auto mb-4 text-2xl font-bold">AI Meeting Notes</div>
            <p className="text-gray-400">
              Transform your meetings with AI-powered transcription and summarization.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Stay Updated</h4>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white placeholder-gray-400"
              />
              <button className="w-full bg-gray-900 text-white py-2 rounded-md font-medium border border-gray-700 hover:bg-gray-800">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>© 2024 AI Meeting Notes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
