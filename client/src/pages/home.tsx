import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import AIShowcase from "@/components/AIShowcase";
import Testimonials from "@/components/Testimonials";
import PricingTeaser from "@/components/PricingTeaser";
import Footer from "@/components/Footer";
import CircuitBackground from "@/components/Glass/CircuitBackground";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sfs-black to-sfs-brown relative overflow-hidden">
      <CircuitBackground opacity={0.05} animate={true} />
      <div className="relative z-10">
        <Navigation />
        <main>
          <HeroSection />
          <FeaturesGrid />
          <AIShowcase />
          <Testimonials />
          <PricingTeaser />
        </main>
        <Footer />
      </div>
    </div>
  );
}
