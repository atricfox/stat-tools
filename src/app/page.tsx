import Header from '@/components/sections/Header'
import Hero from '@/components/sections/Hero'
import ValueProposition from '@/components/sections/ValueProposition'
import TargetAudience from '@/components/sections/TargetAudience'
import FeaturedTools from '@/components/sections/FeaturedTools'
import Features from '@/components/sections/Features'
import Testimonials from '@/components/sections/Testimonials'
import FAQ from '@/components/sections/FAQ'
import Footer from '@/components/sections/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <ValueProposition />
        <TargetAudience />
        <FeaturedTools />
        <Features />
        <Testimonials />
        {/* Placeholder sections to satisfy navigation anchors */}
        <section id="guides" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900">Guides</h2>
            <p className="mt-2 text-gray-700">
              Step-by-step tutorials to help you master statistical calculations and data analysis. Learn at your own pace with clear instructions and examples.
            </p>
          </div>
        </section>
        <section id="about" className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Welcome to TheStatsCalculator, your trusted destination for powerful, easy-to-use statistical calculators and reliable learning resources. Our mission is to make statistics simple, accurate, and accessible for everyone—students, educators, researchers, analysts, and lifelong learners.
              </p>
              <p>
                At TheStatsCalculator, we combine the practical utility of a wide range of online calculators with the academic authority of clear explanations and step-by-step guides. Each tool is built to provide instant, accurate results while helping you understand the underlying formulas, concepts, and real-world applications.
              </p>
            </div>
          </div>
        </section>
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
