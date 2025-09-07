import React from 'react';
import Hero from '../components/Hero';
import ValueProposition from '../components/ValueProposition';
import TargetAudience from '../components/TargetAudience';
import FeaturedTools from '../components/FeaturedTools';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <>
      <Hero />
      <ValueProposition />
      <TargetAudience />
      <FeaturedTools />
      <Features />
      <Testimonials />
      <FAQ />
      <Footer />
    </>
  );
};

export default LandingPage;