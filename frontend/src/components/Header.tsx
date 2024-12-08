import { Menu } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Menu className="h-8 w-8 text-gray-900" />
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 font-medium">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-gray-900 font-medium">
              Pricing
            </a>
            <a href="#about" className="text-gray-700 hover:text-gray-900 font-medium">
              About
            </a>
            <button className="bg-gray-900 text-white px-4 py-2 rounded-md font-medium">
              Sign Up
            </button>
            <button className="border border-gray-200 hover:border-gray-900 px-4 py-2 rounded-md font-medium">
              Log In
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
