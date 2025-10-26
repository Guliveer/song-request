import React from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, Mail, Phone } from "lucide-react";
import FadeInSection from "@/components/FadeInSection";

const FAQ = () => {
  const faqs = [
    {
      question: "Is Track Drop free?",
      answer: "Yes! Track Drop offers a free plan that allows organizing events with basic features. We also have premium plans with additional capabilities for larger events and advanced features.",
    },
    {
      question: "How many people can join one room?",
      answer: "In the free plan, up to 50 people can join a room. In premium plans, limits are much higher - up to 500 people in Pro plan and unlimited in Enterprise plan.",
    },
    {
      question: "Do I need a Spotify or YouTube account?",
      answer: "No, guests don't need their own accounts. They can search and add tracks directly through Track Drop. However, connecting your Spotify or YouTube Music account allows for better integration and more features.",
    },
    {
      question: "How does track voting work?",
      answer: "Every participant can vote on added tracks. Songs with the most votes automatically rise to the top of the playlist. You can set vote limits per person and other moderation rules.",
    },
    {
      question: "Can I moderate playlist content?",
      answer: "Absolutely! As an organizer, you have full control over the playlist. You can remove inappropriate tracks, block users, set content filters, and define rules for adding music.",
    },
    {
      question: "Does Track Drop work on phones?",
      answer: "Yes! Track Drop is fully responsive and works great on all devices - phones, tablets, and computers. Guests can easily join and vote from their smartphones.",
    },
    {
      question: "How long does it take to create a room?",
      answer: "Creating a new room takes literally seconds! Just provide a name, choose basic settings and you're done. The access code is generated automatically.",
    },
    {
      question: "Can I save the playlist after the event?",
      answer: "Yes! All playlists are automatically saved in your account. You can later export them, share with friends, or use as templates for future events.",
    },
    {
      question: "What if I have technical problems during the event?",
      answer: "We offer 24/7 technical support for all users. Premium plans also include phone support and a dedicated account manager.",
    },
    {
      question: "Does Track Drop integrate with DJ systems?",
      answer: "Yes! We have a special DJ mode with advanced features, API for integration with popular DJ software, and the ability to export playlists to various formats.",
    },
  ];

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Instant online help",
      action: "Start Chat",
      color: "#87e5dd",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Response within 24h",
      action: "Send Email",
      color: "#a171f8",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "For Premium users",
      action: "Call Now",
      color: "#87e5dd",
    },
  ];

  return (
    <div className="py-20 lg:py-32 relative">
      <Container>
        {/* Section Header */}
        <FadeInSection>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <HelpCircle className="w-8 h-8 text-[#87e5dd]" />
              <Typography variant="h2" className="font-black text-[#e2f2fa] text-3xl md:text-5xl">
                Frequently Asked Questions
              </Typography>
            </div>
            <Typography className="text-[#bdf6f2] text-lg md:text-xl max-w-3xl mx-auto">Find answers to the most important questions about Track Drop</Typography>
          </div>
        </FadeInSection>

        {/* FAQ Accordion */}
        <FadeInSection>
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="backdrop-blur-xl bg-[rgba(32,36,58,0.92)] rounded-3xl border-2 border-[rgba(135,229,221,0.2)] overflow-hidden">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-b border-[rgba(135,229,221,0.1)] last:border-b-0">
                      <AccordionTrigger className="px-8 py-6 text-left hover:no-underline hover:bg-[rgba(135,229,221,0.05)] transition-colors duration-200">
                        <Typography className="font-bold text-[#e2f2fa] text-lg">{faq.question}</Typography>
                      </AccordionTrigger>
                      <AccordionContent className="px-8 pb-6">
                        <Typography className="text-[#bdf6f2] leading-relaxed">{faq.answer}</Typography>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </FadeInSection>

        {/* Support Options */}
        <FadeInSection>
          <div className="mb-16">
            <div className="text-center mb-12">
              <Typography variant="h3" className="font-bold text-[#e2f2fa] mb-4 text-2xl md:text-3xl">
                Need More Help?
              </Typography>
              <Typography className="text-[#bdf6f2] text-lg">Our support team is ready to help you</Typography>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {supportOptions.map((option, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} whileHover={{ y: -5, scale: 1.02 }}>
                  <Card className="text-center backdrop-blur-xl bg-[rgba(32,36,58,0.92)] rounded-2xl border-2 border-[rgba(135,229,221,0.2)] hover:border-[rgba(135,229,221,0.4)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(135,229,221,0.15)] group">
                    <CardContent className="p-6">
                      <div
                        className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                        style={{
                          backgroundColor: `${option.color}20`,
                          border: `2px solid ${option.color}30`,
                        }}>
                        <option.icon className="w-8 h-8" style={{ color: option.color }} />
                      </div>

                      <Typography variant="h6" className="font-bold text-[#e2f2fa] mb-2">
                        {option.title}
                      </Typography>

                      <Typography className="text-[#bdf6f2] text-sm mb-4">{option.description}</Typography>

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="sm" className="font-medium border-[rgba(135,229,221,0.3)] text-[#87e5dd] bg-[rgba(135,229,221,0.1)] hover:bg-[rgba(135,229,221,0.2)] hover:border-[rgba(135,229,221,0.5)]">
                          {option.action}
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInSection>

        {/* Knowledge Base CTA */}
        <FadeInSection>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} viewport={{ once: true }} className="text-center">
            <Card className="backdrop-blur-xl bg-gradient-to-r from-[rgba(135,229,221,0.1)] to-[rgba(161,113,248,0.1)] rounded-3xl border-2 border-[#87e5dd]/30 p-8 max-w-2xl mx-auto">
              <CardContent className="p-0">
                <Typography variant="h4" className="font-bold text-[#e2f2fa] mb-4">
                  Didn't Find Your Answer?
                </Typography>
                <Typography className="text-[#bdf6f2] mb-6">Check our complete knowledge base with step-by-step guides, video tutorials, and detailed documentation.</Typography>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 font-bold rounded-full bg-gradient-to-r from-[#87e5dd] to-[#a171f8] text-[#181c2a] hover:shadow-[0_8px_32px_#87e5dd44] transition-all duration-300">
                    Browse Knowledge Base
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 font-bold rounded-full border-2 border-[#87e5dd] text-[#87e5dd] bg-transparent hover:bg-[#87e5dd] hover:text-[#181c2a] transition-all duration-300">
                    Contact Us
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </FadeInSection>

        {/* Quick Tips */}
        <FadeInSection>
          <div className="mt-16">
            <Typography variant="h4" className="font-bold text-[#e2f2fa] text-center mb-8">
              Quick Tips
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {["Set clear voting rules before starting", "Use content filters for family events", "Encourage guests to add diverse music", "Check internet connection before event"].map((tip, index) => (
                <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className="p-4 rounded-xl bg-[rgba(135,229,221,0.05)] border border-[rgba(135,229,221,0.2)] hover:bg-[rgba(135,229,221,0.1)] transition-colors duration-300">
                  <Typography className="text-[#bdf6f2] text-sm text-center">💡 {tip}</Typography>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </Container>

      {/* Background Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-r from-[#87e5dd]/10 to-[#a171f8]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-r from-[#a171f8]/10 to-[#87e5dd]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
    </div>
  );
};

export default FAQ;
