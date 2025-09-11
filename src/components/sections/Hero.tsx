'use client'

import React, { useState } from 'react'
import { Search, ArrowRight, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: route to search page when implemented
  }

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

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
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
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-16 lg:py-24 relative overflow-hidden">
      {/* Background animated elements */}
      <motion.div 
        className="absolute inset-0 opacity-10"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400 rounded-full blur-xl" />
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-400 rounded-full blur-xl" />
        <div className="absolute bottom-1/4 left-3/4 w-28 h-28 bg-pink-400 rounded-full blur-xl" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            variants={titleVariants}
          >
            Professional Statistical
            <br />
            <motion.span 
              className="text-blue-500 inline-block"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
            >
              Calculators
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            For Students, Researchers & Professionals
          </motion.p>
          
          <motion.p 
            className="mt-4 text-base sm:text-lg text-gray-700 max-w-4xl mx-auto"
            variants={itemVariants}
          >
            Get accurate calculations with step-by-step explanations in plain English. 
            No complex software needed.
          </motion.p>

          <motion.div 
            className="mt-8 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3" role="search" aria-label="Search statistical tools">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <label htmlFor="hero-search" className="sr-only">Search tools</label>
                <motion.input
                  type="text"
                  placeholder="Search tools... (e.g., mean calculator, t-test)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="hero-search"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-300"
                  whileFocus={{ scale: 1.02, boxShadow: "0 8px 25px rgba(59, 130, 246, 0.15)" }}
                />
              </div>
              <motion.button
                type="submit"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center font-medium"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </motion.button>
            </form>
          </motion.div>

          <motion.div 
            className="mt-8"
            variants={itemVariants}
          >
            <motion.a 
              href="/calculator/mean" 
              className="bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 inline-flex items-center"
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Start Calculating
              <motion.div
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </motion.a>
          </motion.div>

          <motion.div 
            className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600"
            variants={itemVariants}
          >
            {[
              { icon: CheckCircle, text: "20+ Statistical Tools" },
              { icon: CheckCircle, text: "Step-by-Step Guides" },
              { icon: CheckCircle, text: "100% Free" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.2 }}
                whileHover={{ scale: 1.1, color: "#10B981" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.2, type: "spring" }}
                >
                  <item.icon className="h-5 w-5 text-green-500 mr-2" />
                </motion.div>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
