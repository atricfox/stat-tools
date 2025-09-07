import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about using our statistical tools
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;