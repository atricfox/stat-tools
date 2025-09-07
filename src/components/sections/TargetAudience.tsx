import React from 'react'
import { GraduationCap, Microscope, Briefcase } from 'lucide-react'

const TargetAudience = () => {
  const audiences = [
    {
      icon: GraduationCap,
      title: 'Students',
      subtitle: 'Homework & assignments',
      features: ['GPA calculations', 'Study statistics', 'Assignment help']
    },
    {
      icon: Microscope,
      title: 'Researchers',
      subtitle: 'Data analysis & papers',
      features: ['Hypothesis testing', 'Sample size planning', 'Publication ready']
    },
    {
      icon: Briefcase,
      title: 'Professionals',
      subtitle: 'Business analytics',
      features: ['Quality control', 'Performance metrics', 'Data insights']
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">For Who?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Designed for different user needs and expertise levels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => {
            const IconComponent = audience.icon
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{audience.title}</h3>
                    <p className="text-sm text-gray-600">{audience.subtitle}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {audience.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-gray-700 text-sm">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default TargetAudience
