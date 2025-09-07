import React from 'react';
import { Calculator, FileText, Link, Smartphone } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Calculator,
      title: 'Mean & Standard Deviation',
      subtitle: 'Sample vs Population',
      items: ['Weighted Average', 'GPA Calculator']
    },
    {
      icon: FileText,
      title: 'Step-by-Step Solutions',
      subtitle: 'Show your work with detailed calculation breakdowns',
      items: []
    },
    {
      icon: Calculator,
      title: 'Hypothesis Testing',
      subtitle: 't-test Calculator',
      items: ['Chi-square Test', 'ANOVA Calculator']
    },
    {
      icon: Link,
      title: 'Copy & Share Results',
      subtitle: 'Generate shareable links with your parameters',
      items: []
    },
    {
      icon: Calculator,
      title: 'Confidence Intervals',
      subtitle: 'Mean CI Calculator',
      items: ['Proportion CI', 'Difference Tests']
    },
    {
      icon: Smartphone,
      title: 'Works Everywhere',
      subtitle: 'Mobile, tablet, desktop - always accessible',
      items: []
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Features You'll Love</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive statistical tools with user-friendly features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <IconComponent className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">{feature.subtitle}</p>
                    {feature.items.length > 0 && (
                      <ul className="text-sm text-gray-500 space-y-1">
                        {feature.items.map((item, itemIndex) => (
                          <li key={itemIndex}>├ {item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;