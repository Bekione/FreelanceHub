import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import DashboardShowcase from "@/components/landing/DashboardShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FinalCTA from "@/components/landing/FinalCTA";
import type { Dictionary } from "@/lib/i18n/getDictionary";

interface IndexProps {
  dict: Dictionary;
  lang: string;
}

// Server Component — passes serializable dict (plain JSON) to client components.
// Each client component calls createT(dict) internally.
const Index = ({ dict, lang }: IndexProps) => (
  <div className="min-h-screen">
    <Hero dict={dict} lang={lang} />
    <Features dict={dict} />
    <DashboardShowcase dict={dict} />
    <HowItWorks dict={dict} />
    <Testimonials dict={dict} />
    <Pricing dict={dict} lang={lang} />
    <FinalCTA dict={dict} />
  </div>
);

export default Index;
