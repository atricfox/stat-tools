import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Award, BarChart3, TrendingUp, Flame, ArrowRight } from 'lucide-react';

const PopularTools = () => {
  const popularTools = [
    {
      name: 'Mean Calculator',
      description: 'Calculate arithmetic mean with step-by-step explanation',
      icon: Calculator,
      path: '/mean-calculator',
      usage: '15.2K',
      trend: '+12%'
    },
    {
      name: 'Weighted GPA Calculator',
      description: 'Calculate GPA with credit hour weighting',
      icon: Award,
      path: '/weighted-gpa-calculator',
      usage: '8.7K',
      trend: '+18%'
    },
    {
      name: 'Standard Deviation',
      description: 'Sample and population standard deviation',
      icon: BarChart3,
      path: '/standard-deviation-calculator',
      usage: '6.3K',
      trend: '+8%'
    },
    {
      name: 't-Test Calculator',
      description: 'One-sample and two-sample t-test analysis',
      icon: TrendingUp,
      path: '/t-test-calculator',
      usage: '4.9K',
      trend: '+15%'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Flame className="h-5 w-5 text-orange-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Most Popular Tools</h3>
        </div>
        <Link 
          to="/#tools" 
          className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      <div className="space-y-3">
        {popularTools.map((tool, index) => {
          const IconComponent = tool.icon;
          return (
            <Link
              key={index}
              to={tool.path}
              className="block p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <IconComponent className="h-4 w-4 text-orange-600" />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-orange-900 truncate">
                      {tool.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-600">{tool.usage}</span>
                      <span className="text-green-600 font-medium">{tool.trend}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {tool.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-orange-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Updated hourly</span>
          <span>Based on usage data</span>
        </div>
      </div>
    </div>
  );
};

export default PopularTools;