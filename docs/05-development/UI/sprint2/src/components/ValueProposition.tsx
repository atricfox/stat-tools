import React from 'react';
import { Target, BookOpen, Zap } from 'lucide-react';

const ValueProposition = () => {
  const values = [
    {
      icon: Target,
      title: 'Accurate Results',
      description: 'Professional-grade calculations you can trust for academic work',
      color: 'text-blue-500'
    },
    {
      icon: BookOpen,
      title: 'Learn While You Calculate',
      description: 'Detailed explanations in plain English help you understand the concepts',
      color: 'text-green-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Results in seconds with mobile-optimized interface',
      color: 'text-orange-500'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What You Get</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need for accurate statistical calculations and learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div key={index} className="text-center group">
                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors duration-200">
                  <IconComponent className={`h-8 w-8 ${value.color}`} />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{value.title}</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;