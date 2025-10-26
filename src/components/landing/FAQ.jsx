import React from "react";
import { motion } from "framer-motion";
import { Container } from "shadcn/container";
import { Typography } from "shadcn/typography";
import { Card, CardContent } from "shadcn/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "shadcn/accordion";
import { HelpCircle } from "lucide-react";
import FadeInSection from "@/components/FadeInSection";

const FAQ = () => {
    const faqs = [
        {
            question: "Is Track Drop free?",
            answer: "Yes! Track Drop is completly free.",
        },
        {
            question: "Do I need a Spotify or YouTube account?",
            answer: "No, guests don't need their own accounts. They can search and add tracks directly through Track Drop. However, connecting your Spotify or YouTube Music account allows for better integration and more features.",
        },
        {
            question: "How does track voting work?",
            answer: "Every participant can vote on added tracks. Songs with the most votes automatically rise to the top of the playlist.",
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
        }
    ];

    return (
        <div className="py-20 lg:py-32 relative">
            <Container>
                {/* Section Header */}
                <FadeInSection>
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <HelpCircle className="w-8 h-8 text-[#87e5dd]"/>
                            <Typography variant="h2" className="font-black text-[#e2f2fa] text-3xl md:text-5xl">
                                Frequently Asked Questions
                            </Typography>
                        </div>
                        <Typography className="text-[#bdf6f2] text-lg md:text-xl max-w-3xl mx-auto">Find answers to the
                            most important questions about Track Drop</Typography>
                    </div>
                </FadeInSection>

                {/* FAQ Accordion */}
                <FadeInSection>
                    <div className="max-w-4xl mx-auto mb-16">
                        <Card
                            className="backdrop-blur-xl bg-[rgba(32,36,58,0.92)] rounded-3xl border-2 border-[rgba(135,229,221,0.2)] overflow-hidden">
                            <CardContent className="p-0">
                                <Accordion type="single" collapsible className="w-full">
                                    {faqs.map((faq, index) => (
                                        <AccordionItem key={index} value={`item-${index}`}
                                                       className="border-b border-[rgba(135,229,221,0.1)] last:border-b-0">
                                            <AccordionTrigger
                                                className="px-8 py-6 text-left hover:no-underline hover:bg-[rgba(135,229,221,0.05)] transition-colors duration-200">
                                                <Typography
                                                    className="font-bold text-[#e2f2fa] text-lg">{faq.question}</Typography>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-8 pb-6">
                                                <Typography
                                                    className="text-[#bdf6f2] leading-relaxed">{faq.answer}</Typography>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>
                </FadeInSection>

                {/* Quick Tips */}
                <FadeInSection>
                    <div className="mt-16">
                        <Typography variant="h4" className="font-bold text-[#e2f2fa] text-center mb-8">
                            Quick Tips
                        </Typography>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {["Set clear voting rules before starting", "Encourage guests to add diverse music", "Check internet connection before event"].map((tip, index) => (
                                <motion.div key={index} initial={{opacity: 0, scale: 0.9}}
                                            whileInView={{opacity: 1, scale: 1}}
                                            transition={{duration: 0.5, delay: index * 0.1}} viewport={{once: true}}
                                            className="p-4 rounded-xl bg-[rgba(135,229,221,0.05)] border border-[rgba(135,229,221,0.2)] hover:bg-[rgba(135,229,221,0.1)] transition-colors duration-300">
                                    <Typography className="text-[#bdf6f2] text-sm text-center">💡 {tip}</Typography>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </FadeInSection>
            </Container>

            {/* Background Elements */}
            <div
                className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-r from-[#87e5dd]/10 to-[#a171f8]/10 rounded-full blur-3xl animate-pulse"></div>
            <div
                className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-r from-[#a171f8]/10 to-[#87e5dd]/10 rounded-full blur-3xl animate-pulse"
                style={{animationDelay: "2s"}}></div>
        </div>
    );
};

export default FAQ;
