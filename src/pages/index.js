import React, { useEffect } from "react";
import Head from "next/head";
import AnimatedBackground from "@/components/AnimatedBackground";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSolution from "@/components/landing/ProblemSolution";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import FAQ from "@/components/landing/FAQ";

export default function Home() {
  // Smooth scrolling effect
  useEffect(() => {
    // Add smooth scrolling to the document
    document.documentElement.style.scrollBehavior = "smooth";

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <>
      <Head>
        <title>Track Drop - Democratize Music at Your Events</title>
        <meta name="description" content="Let your guests vote on their favorite tracks and create the perfect playlist for every event. Democratic voting, Spotify/YouTube integrations, real-time management." />
        <meta name="keywords" content="music, events, voting, playlist, Spotify, YouTube, DJ, party, wedding, event" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://trackdrop.com/" />
        <meta property="og:title" content="Track Drop - Democratize Music at Your Events" />
        <meta property="og:description" content="Let your guests vote on their favorite tracks and create the perfect playlist for every event." />
        <meta property="og:image" content="/favicon/web-app-manifest-512x512.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://trackdrop.com/" />
        <meta property="twitter:title" content="Track Drop - Democratize Music at Your Events" />
        <meta property="twitter:description" content="Let your guests vote on their favorite tracks and create the perfect playlist for every event." />
        <meta property="twitter:image" content="/favicon/web-app-manifest-512x512.png" />

        {/* Favicon */}
        <link rel="icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />

        {/* Theme Color */}
        <meta name="theme-color" content="#87e5dd" />
        <meta name="msapplication-TileColor" content="#87e5dd" />
      </Head>

      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Content */}
      <div className="min-h-screen relative z-10">
        {/* Hero Section */}
        <section id="hero" className="relative">
          <HeroSection />
        </section>

        {/* Problem & Solution Section */}
        <section id="problem-solution" className="relative">
          <ProblemSolution />
        </section>

        {/* Features Section */}
        <section id="features" className="relative">
          <FeaturesGrid />
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="relative">
          <HowItWorks />
        </section>

        {/* FAQ Section */}
        <section id="faq" className="relative">
          <FAQ />
        </section>

        {/* Final CTA Section */}
        <section id="final-cta" className="relative py-20 lg:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-black text-[#e2f2fa] mb-6 text-3xl md:text-5xl lg:text-6xl">Ready for the Music Revolution?</h2>
              <p className="text-[#bdf6f2] text-lg md:text-xl mb-8 leading-relaxed">Join thousands of organizers who are already creating unforgettable musical experiences with Track Drop. Start free today!</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <button className="px-12 py-4 font-bold text-xl rounded-full shadow-[0_8px_32px_#a171f855] bg-gradient-to-r from-[#a171f8] to-[#87e5dd] text-[#181c2a] hover:from-[#a171f8] hover:to-[#87e5dd] hover:text-[#181c2a] transition-all duration-300 hover:shadow-[0_12px_40px_#a171f866] hover:scale-105">Start Free</button>
                <button className="px-8 py-4 font-bold text-lg rounded-full border-2 border-[#87e5dd] text-[#87e5dd] bg-transparent hover:bg-[#87e5dd] hover:text-[#181c2a] transition-all duration-300 hover:scale-105">Watch Demo</button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto opacity-80">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-[#87e5dd] mb-1">✓</div>
                  <p className="text-[#bdf6f2] text-sm">Free Start</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-[#87e5dd] mb-1">✓</div>
                  <p className="text-[#bdf6f2] text-sm">No Commitments</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-black text-[#87e5dd] mb-1">✓</div>
                  <p className="text-[#bdf6f2] text-sm">24/7 Support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#87e5dd]/10 to-[#a171f8]/10 rounded-full blur-3xl animate-pulse"></div>
        </section>
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Track Drop",
            "description": "Democratize music at your events. Let guests vote on their favorite tracks.",
            "url": "https://trackdrop.com",
            "applicationCategory": "MusicApplication",
            "operatingSystem": "Web, iOS, Android",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "PLN",
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "1250",
            },
          }),
        }}
      />
    </>
  );
}
