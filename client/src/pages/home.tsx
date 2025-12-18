import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import AIShowcase from "@/components/AIShowcase";
import Testimonials from "@/components/Testimonials";
import PricingTeaser from "@/components/PricingTeaser";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-sfs-black">
      <Navigation />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesGrid />
        <AIShowcase />
        <Testimonials />
        <PricingTeaser />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
