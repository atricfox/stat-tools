import React from 'react';
import { Calculator, Award, BarChart3, TrendingUp, Flame, ArrowRight, Target, Ruler, Percent } from 'lucide-react';

const PopularTools = () => {
  const popularTools = [
    {
      name: 'Mean Calculator',
      description: 'Calculate arithmetic mean with step-by-step explanation',
      icon: Calculator,
      path: '/calculator/mean',
      usage: '15.2K',
      trend: '+12%'
    },
    {
      name: 'Median Calculator',
      description: 'Calculate median (middle value) with quartiles analysis',
      icon: Target,
      path: '/calculator/median',
      usage: '12.8K',
      trend: '+25%'
    },
    {
      name: 'Unweighted GPA Calculator',
      description: 'Calculate simple GPA without credit hour weighting',
      icon: Award,
      path: '/calculator/gpa',
      usage: '11.4K',
      trend: '+20%'
    },
    {
      name: 'Weighted GPA Calculator',
      description: 'Calculate GPA with credit hour weighting',
      icon: Award,
      path: '/calculator/weighted-mean',
      usage: '8.7K',
      trend: '+18%'
    },
    {
      name: 'Range Calculator',
      description: 'Calculate data range and spread analysis',
      icon: Ruler,
      path: '/calculator/range',
      usage: '7.2K',
      trend: '+14%'
    },
    {
      name: 'Percent Error Calculator',
      description: 'Calculate percentage error and accuracy',
      icon: Percent,
      path: '/calculator/percent-error',
      usage: '6.8K',
      trend: '+16%'
    },
    {
      name: 'Standard Deviation',
      description: 'Sample and population standard deviation',
      icon: BarChart3,
      path: '/calculator/standard-deviation',
      usage: '6.3K',
      trend: '+8%'
    },
    {
      name: 't-Test Calculator',
      description: 'One-sample and two-sample t-test analysis',
      icon: TrendingUp,
      path: '/tool/t-test',
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
        <a 
          href="/#tools" 
          className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </a>
      </div>
      
      <div className="space-y-3">
        {popularTools.map((tool, index) => {
          const IconComponent = tool.icon;
          return (
            <a
              key={index}
              href={tool.path}
              className="block p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded flex items-center justify-center group-hover:bg-orange-200 transition-colors mr-2">
                      <IconComponent className="h-3 w-3 text-orange-600" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-orange-900 truncate">
                      {tool.name}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-1 text-xs">
                    <span className="text-gray-600">{tool.usage}</span>
                    <span className="text-green-600 font-medium">{tool.trend}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-1 leading-tight">
                  {tool.description}
                </p>
              </div>
            </a>
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