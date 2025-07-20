"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Vision from "@/components/Vision";
import JoinUs from "@/components/JoinUs";
import Cta from "@/components/Cta";
import Partners from "@/components/Partners";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Partners />
      <Features />
      <Vision />
      <JoinUs />
      <Cta />
    </main>
  );
}
