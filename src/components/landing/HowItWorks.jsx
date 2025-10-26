import React from "react";
import { motion } from "framer-motion";
import { Container } from "shadcn/container";
import { Typography } from "shadcn/typography";
import { Card, CardContent } from "shadcn/card";
import { Button } from "shadcn/button";
import { ArrowRight, CheckCircle, Plus, Share2, Vote } from "lucide-react";
import FadeInSection from "@/components/FadeInSection";

const HowItWorks = () => {
    const steps = [
        {
            number: "01",
            icon: Plus,
            title: "Create Room",
            description: "Create an account and set up a new music room for your event. Give it a name and configure basic settings.",
            details: ["Choose room name", "Set voting limits", "Configure content filters", "Generate access code"],
            color: "#87e5dd",
        },
        {
            number: "02",
            icon: Share2,
            title: "Share Code",
            description: "Share the room code with your guests. They can join through the website.",
            details: ["Send code via SMS/email", "Display QR code on screen", "Share direct link", "Guests join instantly"],
            color: "#a171f8",
        },
        {
            number: "03",
            icon: Vote,
            title: "Vote Together",
            description: "Guests add favorite tracks and vote for the best ones. Most popular songs rise to the top of the playlist.",
            details: ["Search in Spotify/YouTube", "Add tracks to queue", "Real-time voting", "Automatic sorting"],
            color: "#87e5dd",
        },
    ];

    const containerVariants = {
        hidden: {opacity: 0},
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2,
            },
        },
    };

    const stepVariants = {
        hidden: {opacity: 0, y: 50, scale: 0.9},
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut",
            },
        },
    };

    return (
        <div className="py-20 lg:py-32 relative overflow-hidden">
            <Container>
                {/* Section Header */}
                <FadeInSection>
                    <div className="text-center mb-20">
                        <Typography variant="h2" className="font-black text-[#e2f2fa] mb-4 text-3xl md:text-5xl">
                            How It Works?
                        </Typography>
                        <Typography className="text-[#bdf6f2] text-lg md:text-xl max-w-3xl mx-auto">Start your musical
                            journey in just three simple steps</Typography>
                    </div>
                </FadeInSection>

                {/* Steps */}
                <motion.div variants={containerVariants} initial="hidden" whileInView="visible"
                            viewport={{once: true, margin: "-100px"}} className="space-y-16 lg:space-y-24">
                    {steps.map((step, index) => (
                        <motion.div key={index} variants={stepVariants}
                                    className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-12 lg:gap-20`}>
                            {/* Step Content */}
                            <div className="flex-1 text-center lg:text-left">
                                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-[#181c2a] shadow-lg"
                                        style={{backgroundColor: step.color}}>
                                        {step.number}
                                    </div>
                                    <div
                                        className="p-3 rounded-xl"
                                        style={{
                                            backgroundColor: `${step.color}20`,
                                            border: `2px solid ${step.color}30`,
                                        }}>
                                        <step.icon className="w-8 h-8" style={{color: step.color}}/>
                                    </div>
                                </div>

                                <Typography variant="h3" className="font-bold text-[#e2f2fa] mb-4 text-2xl md:text-3xl">
                                    {step.title}
                                </Typography>

                                <Typography
                                    className="text-[#bdf6f2] text-lg mb-6 leading-relaxed">{step.description}</Typography>

                                {/* Step Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                                    {step.details.map((detail, detailIndex) => (
                                        <motion.div key={detailIndex} initial={{opacity: 0, x: -20}}
                                                    whileInView={{opacity: 1, x: 0}}
                                                    transition={{duration: 0.5, delay: detailIndex * 0.1}}
                                                    viewport={{once: true}} className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 flex-shrink-0" style={{color: step.color}}/>
                                            <Typography className="text-[#bdf6f2] text-sm">{detail}</Typography>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Arrow for desktop */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:flex justify-center lg:justify-start">
                                        <motion.div animate={{x: [0, 10, 0]}}
                                                    transition={{duration: 2, repeat: Infinity, ease: "easeInOut"}}>
                                            <ArrowRight className="w-8 h-8 opacity-50" style={{color: step.color}}/>
                                        </motion.div>
                                    </div>
                                )}
                            </div>

                            {/* Step Visual */}
                            <div className="flex-1 max-w-md">
                                <motion.div whileHover={{scale: 1.05, rotate: 1}} transition={{duration: 0.3}}>
                                    <Card
                                        className="backdrop-blur-xl bg-[rgba(32,36,58,0.92)] rounded-3xl border-2 border-[rgba(135,229,221,0.2)] hover:border-[rgba(135,229,221,0.4)] transition-all duration-300 overflow-hidden">
                                        <CardContent className="p-8">
                                            {/* Mock Interface */}
                                            <div className="space-y-4">
                                                {/* Header */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                                    </div>
                                                    <Typography className="text-xs text-[#bdf6f2]">Track
                                                        Drop</Typography>
                                                </div>

                                                {/* Content based on step */}
                                                {index === 0 && (
                                                    <div className="space-y-3">
                                                        <div
                                                            className="h-8 bg-gradient-to-r from-[#87e5dd]/20 to-[#a171f8]/20 rounded-lg flex items-center px-3">
                                                            <Typography className="text-xs text-[#87e5dd]">Room name:
                                                                "Anna's Party"</Typography>
                                                        </div>
                                                        <div className="h-6 bg-[#87e5dd]/10 rounded w-3/4"></div>
                                                        <div className="h-6 bg-[#a171f8]/10 rounded w-1/2"></div>
                                                        <div className="flex justify-center pt-2">
                                                            <div
                                                                className="px-4 py-2 rounded-full text-xs font-bold text-[#181c2a]"
                                                                style={{backgroundColor: step.color}}>
                                                                Create Room
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {index === 1 && (
                                                    <div className="space-y-3">
                                                        <div className="text-center py-4">
                                                            <div
                                                                className="w-24 h-24 mx-auto bg-gradient-to-r from-[#87e5dd]/20 to-[#a171f8]/20 rounded-2xl flex items-center justify-center mb-3">
                                                                <Typography
                                                                    className="text-2xl font-black text-[#a171f8]">QR</Typography>
                                                            </div>
                                                            <Typography
                                                                className="text-lg font-bold text-[#a171f8]">ABC123</Typography>
                                                            <Typography className="text-xs text-[#bdf6f2]">Room
                                                                code</Typography>
                                                        </div>
                                                    </div>
                                                )}

                                                {index === 2 && (
                                                    <div className="space-y-2">
                                                        {[
                                                            {song: "Blinding Lights", votes: 12},
                                                            {song: "Levitating", votes: 8},
                                                            {song: "Shape of You", votes: 5},
                                                        ].map((item, i) => (
                                                            <div key={i}
                                                                 className="flex items-center justify-between p-2 bg-[#87e5dd]/10 rounded-lg">
                                                                <Typography
                                                                    className="text-xs text-[#e2f2fa]">{item.song}</Typography>
                                                                <div className="flex items-center gap-1">
                                                                    <Vote className="w-3 h-3 text-[#87e5dd]"/>
                                                                    <Typography
                                                                        className="text-xs text-[#87e5dd]">{item.votes}</Typography>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>

                            {/* Mobile Arrow */}
                            {index < steps.length - 1 && (
                                <div className="lg:hidden">
                                    <motion.div animate={{y: [0, 10, 0]}}
                                                transition={{duration: 2, repeat: Infinity, ease: "easeInOut"}}
                                                className="rotate-90">
                                        <ArrowRight className="w-8 h-8 opacity-50" style={{color: step.color}}/>
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom CTA */}
                <FadeInSection>
                    <motion.div initial={{opacity: 0, y: 30}} whileInView={{opacity: 1, y: 0}}
                                transition={{duration: 0.8, delay: 0.3}} viewport={{once: true}}
                                className="mt-20 text-center">
                        <Card
                            className="backdrop-blur-xl bg-gradient-to-r from-[rgba(135,229,221,0.1)] to-[rgba(161,113,248,0.1)] rounded-3xl border-2 border-[#87e5dd]/30 p-8 max-w-2xl mx-auto">
                            <CardContent className="p-0">
                                <Typography variant="h4" className="font-bold text-[#e2f2fa] mb-4">
                                    Ready to Start?
                                </Typography>
                                <Typography className="text-[#bdf6f2] mb-6">Create your first music room now and see how
                                    easy it is to democratize music at events.</Typography>
                                <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                                    <Button
                                        className="px-8 py-3 font-bold rounded-full bg-gradient-to-r from-[#87e5dd] to-[#a171f8] text-[#181c2a] hover:shadow-[0_8px_32px_#87e5dd44] transition-all duration-300">Create
                                        First Room</Button>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </FadeInSection>
            </Container>

            {/* Background Elements */}
            <div
                className="absolute top-1/4 left-0 w-64 h-64 bg-gradient-to-r from-[#87e5dd]/5 to-transparent rounded-full blur-3xl"></div>
            <div
                className="absolute bottom-1/4 right-0 w-64 h-64 bg-gradient-to-l from-[#a171f8]/5 to-transparent rounded-full blur-3xl"></div>
        </div>
    );
};

export default HowItWorks;
