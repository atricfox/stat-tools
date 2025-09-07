'use client'

import React, { useState } from 'react'
import { Menu, X, Calculator } from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center" aria-label="TheStatsCalculator home">
            <Calculator className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold text-gray-900">TheStatsCalculator</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#tools" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">
              Tools
            </a>
            <a href="#guides" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">
              Guides
            </a>
            <a href="#about" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">
              About
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-primary-nav"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div id="mobile-primary-nav" className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              <a 
                href="#tools" 
                className="text-gray-600 hover:text-blue-500 py-2 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Tools
              </a>
              <a 
                href="#guides" 
                className="text-gray-600 hover:text-blue-500 py-2 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Guides
              </a>
              <a 
                href="#about" 
                className="text-gray-600 hover:text-blue-500 py-2 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
