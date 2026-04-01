import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import DashboardShowcase from "@/components/landing/DashboardShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FinalCTA from "@/components/landing/FinalCTA";

const Index = () => (
  <div className="min-h-screen">
    <Hero />
    <Features />
    <DashboardShowcase />
    <HowItWorks />
    <Testimonials />
    <Pricing />
    <FinalCTA />
  </div>
);

export default Index;
