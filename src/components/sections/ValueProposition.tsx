'use client'

import React from 'react'
import { Target, BookOpen, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const ValueProposition = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
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
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
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
    <section className="py-16 bg-white" ref={ref}>
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
            What You Get
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            variants={titleVariants}
          >
            Everything you need for accurate statistical calculations and learning
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {values.map((value, index) => {
            const IconComponent = value.icon
            return (
              <motion.div 
                key={index} 
                className="text-center group cursor-pointer"
                variants={itemVariants}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors duration-200 relative"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 rgba(59, 130, 246, 0)",
                        "0 0 0 8px rgba(59, 130, 246, 0.1)",
                        "0 0 0 16px rgba(59, 130, 246, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  />
                  <IconComponent className={`h-8 w-8 ${value.color} relative z-10`} />
                </motion.div>
                <motion.h3 
                  className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {value.title}
                </motion.h3>
                <motion.p 
                  className="mt-2 text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  {value.description}
                </motion.p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default ValueProposition