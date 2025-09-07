import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
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
  ];

  return (
    <section className="py-16 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Users Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trusted by students, researchers, and professionals worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, starIndex) => (
                  <Star key={starIndex} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <div className="mb-4">
                <Quote className="h-8 w-8 text-blue-200 mb-2" />
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <p className="font-medium text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Usage statistics */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">50,000+</div>
              <div className="text-sm text-gray-600">Calculations performed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">20+</div>
              <div className="text-sm text-gray-600">Statistical tools</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">95%</div>
              <div className="text-sm text-gray-600">User satisfaction</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600">Available access</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;