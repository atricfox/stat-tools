'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const faqs = [
    {
      question: "Are the calculations accurate?",
      answer: "Yes, all our calculators use industry-standard formulas and are tested against academic sources. We follow best practices for numerical accuracy and provide references for our methods."
    },
    {
      question: "Do I need to create an account?",
      answer: "No registration required. All tools are free to use immediately. We believe in providing instant access to statistical calculations without barriers."
    },
    {
      question: "Can I use this for academic work?",
      answer: "Absolutely! Our calculators provide detailed steps perfect for homework and research. Many students and researchers use our tools for assignments, thesis work, and academic publications."
    },
    {
      question: "Does it work on mobile?",
      answer: "Yes, all calculators are optimized for mobile, tablet, and desktop use. The responsive design ensures a great experience across all devices."
    },
    {
      question: "What statistical methods do you support?",
      answer: "We support a wide range of statistical methods including descriptive statistics, hypothesis testing, confidence intervals, correlation analysis, ANOVA, and more. New tools are added regularly."
    },
    {
      question: "How do I cite these results?",
      answer: "Each calculator provides proper citation format for academic use. You can reference the specific tool, methodology, and our website in your academic work."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

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

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Frequently Asked Questions
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600"
            variants={titleVariants}
          >
            Everything you need to know about using our statistical tools
          </motion.p>
        </motion.div>

        <motion.div 
          className="space-y-4"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {faqs.map((faq, index) => (
            <motion.div 
              key={index} 
              className="border border-gray-200 rounded-lg overflow-hidden"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                transition: { duration: 0.2 }
              }}
            >
              <motion.button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </motion.div>
              </motion.button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    className="overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <motion.div 
                      className="px-6 pb-4 bg-gray-50"
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default FAQ
