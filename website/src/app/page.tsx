import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";

import { UseCases } from "@/components/UseCases";
import { Comparison } from "@/components/Comparison";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Hero />
        <Problem />
        <Features />
        <HowItWorks />
        <UseCases />
        <Comparison />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
