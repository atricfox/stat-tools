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
            <p className="mt-2 text-gray-700">In-depth statistics guides and how-tos (coming soon).</p>
          </div>
        </section>
        <section id="about" className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900">About</h2>
            <p className="mt-2 text-gray-700">TheStatsCalculator provides free statistical tools with explanations.</p>
          </div>
        </section>
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
