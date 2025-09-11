'use client'

import React from 'react'
import { Star, Quote } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const Testimonials = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const testimonials = [
    {
      quote: "Finally, a calculator that explains what the numbers mean!",
      author: "Sarah M.",
      role: "Graduate Student",
      rating: 5
    },
    {
      quote: "Saved hours on my research project. The step-by-step breakdown is perfect.",
      author: "Dr. James Liu",
      role: "Researcher",
      rating: 5
    },
    {
      quote: "Perfect for my statistics homework. Clear explanations help me learn.",
      author: "Mike K.",
      role: "Undergraduate Student",
      rating: 5
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
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
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

  const statsVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "backOut"
      }
    }
  }

  return (
    <section className="py-16 bg-blue-50" ref={ref}>
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
            What Users Say
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            variants={titleVariants}
          >
            Trusted by students, researchers, and professionals worldwide
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 group cursor-pointer"
              variants={cardVariants}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                transition: { duration: 0.3 }
              }}
            >
              <motion.div 
                className="flex items-center mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {[...Array(testimonial.rating)].map((_, starIndex) => (
                  <motion.div
                    key={starIndex}
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 0.5 + index * 0.1 + starIndex * 0.1,
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                  >
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  </motion.div>
                ))}
              </motion.div>
              
              <div className="mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                >
                  <Quote className="h-8 w-8 text-blue-200 mb-2" />
                </motion.div>
                <motion.p 
                  className="text-gray-700 italic group-hover:text-gray-800 transition-colors duration-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </motion.p>
              </div>
              
              <motion.div 
                className="border-t border-gray-100 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {testimonial.author}
                </p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-12 text-center"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={containerVariants}
          >
            {[
              { value: "50,000+", label: "Calculations performed" },
              { value: "20+", label: "Statistical tools" },
              { value: "95%", label: "User satisfaction" },
              { value: "24/7", label: "Available access" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                variants={statsVariants}
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer"
              >
                <motion.div 
                  className="text-2xl font-bold text-blue-600"
                  animate={{ 
                    color: ["#2563eb", "#3b82f6", "#1d4ed8", "#2563eb"]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
