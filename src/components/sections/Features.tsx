'use client'

import React from 'react'
import { Calculator, FileText, Link, Smartphone } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const Features = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
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
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const titleVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  return (
    <section className="py-16 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.h2 
            className="text-3xl font-bold text-gray-900 mb-4"
            variants={titleVariants}
          >
            Features You&apos;ll Love
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            variants={titleVariants}
          >
            Comprehensive statistical tools with user-friendly features
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <motion.div 
                key={index} 
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 group cursor-pointer"
                variants={cardVariants}
                whileHover={{ 
                  y: -8, 
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start">
                  <motion.div 
                    className="flex-shrink-0"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-300"
                      whileHover={{ scale: 1.1 }}
                    >
                      <IconComponent className="h-6 w-6 text-blue-500 group-hover:text-blue-600 transition-colors duration-300" />
                    </motion.div>
                  </motion.div>
                  <div className="ml-4">
                    <motion.h3 
                      className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <motion.p 
                      className="text-gray-600 text-sm mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      {feature.subtitle}
                    </motion.p>
                    {feature.items.length > 0 && (
                      <motion.ul 
                        className="text-sm text-gray-500 space-y-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        {feature.items.map((item, itemIndex) => (
                          <motion.li 
                            key={itemIndex}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 + index * 0.1 + itemIndex * 0.1 }}
                            className="flex items-center"
                          >
                            <motion.span
                              className="mr-2 text-blue-400"
                              animate={{ rotate: [0, 5, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: itemIndex * 0.5 }}
                            >
                              ├
                            </motion.span>
                            {item}
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default Features
