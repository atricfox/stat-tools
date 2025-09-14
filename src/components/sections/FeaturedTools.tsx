'use client'

import React from 'react'
import { Calculator, BarChart3, TrendingUp, ArrowRight, GraduationCap, Target, Ruler, Percent } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const FeaturedTools = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const tools = [
    {
      name: 'Mean Calculator',
      slug: 'mean',
      href: '/calculator/mean',
      description: 'Calculate arithmetic mean with step-by-step explanation',
      icon: Calculator,
      popular: true
    },
    {
      name: 'Median Calculator',
      slug: 'median',
      href: '/calculator/median',
      description: 'Calculate median (middle value) with quartiles and outlier detection',
      icon: Target,
      popular: true
    },
    {
      name: 'Standard Deviation Calculator',
      slug: 'standard-deviation',
      href: '/calculator/standard-deviation',
      description: 'Calculate sample and population standard deviation with comprehensive statistical analysis',
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
      name: 'Weighted Mean Calculator',
      slug: 'weighted-mean',
      href: '/calculator/weighted-mean',
      description: 'Calculate weighted averages with multiple input methods',
      icon: Calculator,
      popular: true
    },
    {
      name: 'GPA Calculator',
      slug: 'gpa',
      href: '/calculator/gpa',
      description: 'Calculate weighted Grade Point Average with multiple grading systems (4.0/4.3/4.5)',
      icon: GraduationCap,
      popular: true
    },
    {
      name: 'Unweighted GPA Calculator',
      slug: 'unweighted-gpa',
      href: '/calculator/unweighted-gpa',
      description: 'Calculate unweighted Grade Point Average with standard 4.0 and plus/minus grading systems',
      icon: GraduationCap,
      popular: true
    },
    {
      name: 'Range Calculator',
      slug: 'range',
      href: '/calculator/range',
      description: 'Calculate data range, minimum, maximum, and spread analysis',
      icon: Ruler,
      popular: true
    },
    {
      name: 'Percent Error Calculator',
      slug: 'percent-error',
      href: '/calculator/percent-error',
      description: 'Calculate percentage error between theoretical and experimental values',
      icon: Percent,
      popular: true
    },
    {
      name: 'Final Grade Calculator',
      slug: 'final-grade',
      href: '/calculator/final-grade',
      description: 'Predict required final exam score to achieve target grade',
      icon: GraduationCap,
      popular: true
    },
    {
      name: 'Semester Grade Calculator',
      slug: 'semester-grade',
      href: '/calculator/semester-grade',
      description: 'Calculate weighted semester grade from multiple courses',
      icon: GraduationCap,
      popular: true
    },
    {
      name: 'Cumulative GPA Calculator',
      slug: 'cumulative-gpa',
      href: '/calculator/cumulative-gpa',
      description: 'Calculate cumulative GPA for graduate school applications',
      icon: GraduationCap,
      popular: true
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

  // Animation variants
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
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const titleVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section id="tools" className="py-16 bg-white" ref={ref}>
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
            Statistics Calculators
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            variants={titleVariants}
          >
            Professional statistical calculators with detailed explanations
          </motion.p>
        </motion.div>

        <motion.div 
          className="mb-8"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.h3 
            className="text-xl font-semibold text-gray-900 mb-6 flex items-center"
            variants={titleVariants}
          >
            <motion.span
              className="inline-block w-2 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"
              animate={{
                background: [
                  "linear-gradient(45deg, #3B82F6, #8B5CF6)",
                  "linear-gradient(45deg, #8B5CF6, #EC4899)",
                  "linear-gradient(45deg, #EC4899, #F59E0B)",
                  "linear-gradient(45deg, #F59E0B, #3B82F6)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            Popular Calculators
          </motion.h3>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={containerVariants}
          >
            {popularTools.map((tool, index) => {
              const IconComponent = tool.icon
              return (
                <motion.a
                  key={index}
                  href={tool.href || `/tool/${tool.slug}`}
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-left group block focus:outline-none focus:ring-2 focus:ring-blue-500 relative overflow-hidden"
                  variants={cardVariants}
                  whileHover={{ 
                    scale: 1.03,
                    y: -5,
                    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.2)",
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Animated background gradient */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-2">
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <IconComponent className="h-5 w-5 text-blue-500 mr-2" />
                      </motion.div>
                      <span className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                        {tool.name}
                      </span>
                    </div>
                    <motion.p 
                      className="text-sm text-gray-600 group-hover:text-gray-700"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {tool.description}
                    </motion.p>
                  </div>
                  
                  {/* Hover indicator */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              )
            })}
          </motion.div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {allTools.map((tool, index) => {
            const IconComponent = tool.icon
            return (
              <motion.a
                key={index}
                href={tool.href || `/tool/${tool.slug}`}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-left group block focus:outline-none focus:ring-2 focus:ring-blue-500 relative overflow-hidden"
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.02,
                  y: -3,
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-600/5"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center mb-2">
                    <motion.div
                      whileHover={{ rotate: 5, scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <IconComponent className="h-5 w-5 text-gray-600 mr-2 group-hover:text-gray-700" />
                    </motion.div>
                    <span className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
                      {tool.name}
                    </span>
                  </div>
                  <motion.p 
                    className="text-sm text-gray-600"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {tool.description}
                  </motion.p>
                </div>
              </motion.a>
            )
          })}
        </motion.div>

        <motion.div 
          className="text-center"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={titleVariants}
        >
          <motion.a 
            href="/statistics-calculators" 
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
            whileHover={{ 
              scale: 1.05,
              y: -2,
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)" 
            }}
            whileTap={{ scale: 0.95 }}
          >
            View All Calculators
            <motion.div
              className="ml-2"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturedTools
