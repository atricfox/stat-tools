import React from 'react'
import { Calculator, Twitter } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <Calculator className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">TheStatsCalculator</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Professional statistical calculators with step-by-step explanations. 
              Free tools for students, researchers, and professionals.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Popular Calculators</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/calculator/mean" className="hover:text-white transition-colors">Mean Calculator</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Standard Deviation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">t-Test Calculator</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Confidence Intervals</a></li>
              <li><a href="/calculator/weighted-mean" className="hover:text-white transition-colors">GPA Calculator</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/how-to" className="hover:text-white transition-colors">Statistics Guide</a></li>
              <li><a href="/how-to" className="hover:text-white transition-colors">How to Use</a></li>
              <li><a href="/glossary" className="hover:text-white transition-colors">Glossary</a></li>
              <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="/cases" className="hover:text-white transition-colors">Cases</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>

            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2024 TheStatsCalculator. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 mt-2 sm:mt-0">
            Made with ❤️ for students and researchers
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
