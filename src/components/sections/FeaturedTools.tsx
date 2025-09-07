import React from 'react'
import { Calculator, BarChart3, TrendingUp, ArrowRight } from 'lucide-react'

const FeaturedTools = () => {
  const tools = [
    {
      name: 'Mean Calculator',
      slug: 'mean',
      description: 'Calculate arithmetic mean with step-by-step explanation',
      icon: Calculator,
      popular: true
    },
    {
      name: 'Standard Deviation',
      slug: 'standard-deviation',
      description: 'Sample and population standard deviation calculator',
      icon: BarChart3,
      popular: true
    },
    {
      name: 't-Test Calculator',
      slug: 't-test',
      description: 'One-sample and two-sample t-test analysis',
      icon: TrendingUp,
      popular: false
    },
    {
      name: 'Confidence Interval',
      slug: 'confidence-interval',
      description: 'Calculate confidence intervals for various parameters',
      icon: Calculator,
      popular: true
    },
    {
      name: 'GPA Calculator',
      slug: 'gpa',
      description: 'Calculate GPA with weighted and unweighted options',
      icon: Calculator,
      popular: false
    },
    {
      name: 'Correlation',
      slug: 'correlation',
      description: 'Pearson and Spearman correlation analysis',
      icon: BarChart3,
      popular: false
    },
    {
      name: 'ANOVA Calculator',
      slug: 'anova',
      description: 'One-way and two-way ANOVA analysis',
      icon: TrendingUp,
      popular: false
    },
    {
      name: 'Chi-Square Test',
      slug: 'chi-square',
      description: 'Goodness of fit and independence testing',
      icon: BarChart3,
      popular: false
    }
  ]

  const popularTools = tools.filter(tool => tool.popular)
  const allTools = tools.filter(tool => !tool.popular)

  return (
    <section id="tools" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tools & Calculators</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional statistical calculators with detailed explanations
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Popular Calculators</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularTools.map((tool, index) => {
              const IconComponent = tool.icon
              return (
                <a
                  key={index}
                  href={`/tool/${tool.slug}`}
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-left group block focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-center mb-2">
                    <IconComponent className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-medium text-gray-900 group-hover:text-blue-700">
                      {tool.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                </a>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {allTools.map((tool, index) => {
            const IconComponent = tool.icon
            return (
              <a
                key={index}
                href={`/tool/${tool.slug}`}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-left group block focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center mb-2">
                  <IconComponent className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900 group-hover:text-gray-700">
                    {tool.name}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{tool.description}</p>
              </a>
            )
          })}
        </div>

        <div className="text-center">
          <a href="/tool" className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium">
            View All Tools
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  )
}

export default FeaturedTools
