import React from 'react';
import { Calculator, BarChart3, TrendingUp, Award, ArrowRight } from 'lucide-react';

interface RelatedToolsProps {
  currentTool: string;
  category?: 'statistics' | 'gpa' | 'analysis';
}

const RelatedTools: React.FC<RelatedToolsProps> = ({ currentTool, category = 'statistics' }) => {
  const allTools = {
    statistics: [
      {
        name: 'Standard Deviation Calculator',
        description: 'Calculate sample and population standard deviation',
        icon: BarChart3,
        path: '/tool/standard-deviation',
        difficulty: 'Intermediate'
      },
      {
        name: 'Confidence Interval Calculator',
        description: 'Calculate confidence intervals for means and proportions',
        icon: TrendingUp,
        path: '/tool/confidence-interval',
        difficulty: 'Advanced'
      },
      {
        name: 't-Test Calculator',
        description: 'Perform one-sample and two-sample t-tests',
        icon: Calculator,
        path: '/tool/t-test',
        difficulty: 'Advanced'
      },
      {
        name: 'Correlation Calculator',
        description: 'Calculate Pearson and Spearman correlation coefficients',
        icon: BarChart3,
        path: '/tool/correlation',
        difficulty: 'Intermediate'
      }
    ],
    gpa: [
      {
        name: 'Unweighted GPA Calculator',
        description: 'Calculate simple average GPA without credit weights',
        icon: Calculator,
        path: '/calculator/weighted-mean',
        difficulty: 'Basic'
      },
      {
        name: 'Semester GPA Calculator',
        description: 'Calculate GPA for a specific semester',
        icon: Award,
        path: '/calculator/weighted-mean',
        difficulty: 'Basic'
      },
      {
        name: 'Cumulative GPA Calculator',
        description: 'Calculate overall GPA across multiple semesters',
        icon: TrendingUp,
        path: '/calculator/weighted-mean',
        difficulty: 'Intermediate'
      },
      {
        name: 'Grade Point Calculator',
        description: 'Convert letter grades to grade points',
        icon: Calculator,
        path: '/tool/grade-point',
        difficulty: 'Basic'
      }
    ],
    analysis: [
      {
        name: 'ANOVA Calculator',
        description: 'Perform one-way and two-way analysis of variance',
        icon: BarChart3,
        path: '/tool/anova',
        difficulty: 'Advanced'
      },
      {
        name: 'Chi-Square Test',
        description: 'Test for independence and goodness of fit',
        icon: TrendingUp,
        path: '/tool/chi-square',
        difficulty: 'Advanced'
      },
      {
        name: 'Regression Calculator',
        description: 'Linear and multiple regression analysis',
        icon: Calculator,
        path: '/tool/regression',
        difficulty: 'Advanced'
      }
    ]
  };

  // Filter out current tool and get related tools
  const relatedTools = allTools[category]
    .filter(tool => !currentTool.toLowerCase().includes(tool.name.toLowerCase().split(' ')[0].toLowerCase()))
    .slice(0, 3);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Basic': return 'text-green-600 bg-green-50';
      case 'Intermediate': return 'text-blue-600 bg-blue-50';
      case 'Advanced': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Related Tools</h3>
        <a 
          href="/#tools" 
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </a>
      </div>
      
      <div className="space-y-3">
        {relatedTools.map((tool, index) => {
          const IconComponent = tool.icon;
          return (
            <a
              key={index}
              href={tool.path}
              className="block p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded flex items-center justify-center group-hover:bg-blue-100 transition-colors mr-2">
                      <IconComponent className="h-3 w-3 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-900 truncate">
                      {tool.name}
                    </h4>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getDifficultyColor(tool.difficulty)}`}>
                    {tool.difficulty}
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 leading-tight">
                  {tool.description}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedTools;