import React, { useState } from 'react';
import { Search, ArrowRight, CheckCircle } from 'lucide-react';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log('Search query:', searchQuery);
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Professional Statistical
            <br />
            <span className="text-blue-500">Calculators</span>
          </h1>
          
          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            For Students, Researchers & Professionals
          </p>
          
          {/* Value proposition */}
          <p className="mt-4 text-base sm:text-lg text-gray-700 max-w-4xl mx-auto">
            Get accurate calculations with step-by-step explanations in plain English. 
            No complex software needed.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tools... (e.g., mean calculator, t-test)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center font-medium"
              >
                <Search className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>
          </div>

          {/* Primary CTA */}
          <div className="mt-8">
            <button className="bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 inline-flex items-center">
              Start Calculating
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>20+ Statistical Tools</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Step-by-Step Guides</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>100% Free</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;