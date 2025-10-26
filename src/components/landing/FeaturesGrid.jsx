import React from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Headphones, Music, Shield, Smartphone, Users, Vote, Zap } from "lucide-react";
import FadeInSection from "@/components/FadeInSection";

const FeaturesGrid = () => {
    const features = [
        {
            icon: Vote,
            title: "Democratic Voting",
            description: "Every guest can vote on their favorite tracks in real-time. The best songs automatically rise to the top of the playlist.",
            color: "#87e5dd",
            badge: "Core",
        },
        {
            icon: Music,
            title: "Spotify & YouTube Integration",
            description: "Direct search and adding tracks from Spotify and YouTube. Huge music library at your fingertips.",
            color: "#a171f8",
            badge: "Integration",
        },
        {
            icon: Users,
            title: "Guest Management",
            description: "Control who can add tracks and vote. Set vote limits per person and moderate playlist content.",
            color: "#87e5dd",
            badge: "Control",
        },
        {
            icon: Smartphone,
            title: "Mobile App",
            description: "Responsive design working on all devices. Guests can vote directly from their phones.",
            color: "#a171f8",
            badge: "Mobile",
        },
        {
            icon: Zap,
            title: "Live Updates",
            description: "All playlist changes are visible instantly to all participants. No delays or refreshing needed.",
            color: "#87e5dd",
            badge: "Real-time",
        },
        {
            icon: Shield,
            title: "Secure Rooms",
            description: "Private room access codes. Only invited guests can join your musical event.",
            color: "#a171f8",
            badge: "Privacy",
        },
        {
            icon: BarChart3,
            title: "Event Analytics",
            description: "Detailed voting statistics, most popular tracks and guest activity. Learn what your guests love.",
            color: "#87e5dd",
            badge: "Analytics",
        },
        {
            icon: Headphones,
            title: "Track Preview",
            description: "Guests can listen to a snippet before making decisions.",
            color: "#a171f8",
            badge: "Preview",
        }
    ];

    const containerVariants = {
        hidden: {opacity: 0},
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: {opacity: 0, y: 30, scale: 0.9},
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    return (
        <div className="py-20 lg:py-32 relative">
            <Container>
                {/* Section Header */}
                <FadeInSection>
                    <div className="text-center mb-16">
                        <Typography variant="h2" className="font-black text-[#e2f2fa] mb-4 text-3xl md:text-5xl">
                            Everything You Need
                        </Typography>
                        <Typography className="text-[#bdf6f2] text-lg md:text-xl max-w-3xl mx-auto">Complete toolkit for
                            creating perfect musical experiences at your events</Typography>
                    </div>
                </FadeInSection>

                {/* Features Grid */}
                <motion.div variants={containerVariants} initial="hidden" whileInView="visible"
                            viewport={{once: true, margin: "-100px"}}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{
                                y: -8,
                                transition: {duration: 0.3},
                            }}>
                            <Card
                                className="h-full backdrop-blur-xl bg-[rgba(32,36,58,0.92)] rounded-2xl border-2 border-[rgba(135,229,221,0.2)] hover:border-[rgba(135,229,221,0.4)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(135,229,221,0.15)] group">
                                <CardContent className="p-6">
                                    {/* Icon and Badge */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div
                                            className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
                                            style={{
                                                backgroundColor: `${feature.color}20`,
                                                border: `2px solid ${feature.color}30`,
                                            }}>
                                            <feature.icon className="w-6 h-6 transition-colors duration-300"
                                                          style={{color: feature.color}}/>
                                        </div>
                                        <Badge variant="outline"
                                               className="text-xs font-medium border-[rgba(135,229,221,0.3)] text-[#87e5dd] bg-[rgba(135,229,221,0.1)]">
                                            {feature.badge}
                                        </Badge>
                                    </div>

                                    {/* Title */}
                                    <Typography variant="h6"
                                                className="font-bold text-[#e2f2fa] mb-3 group-hover:text-[#87e5dd] transition-colors duration-300">
                                        {feature.title}
                                    </Typography>

                                    {/* Description */}
                                    <Typography
                                        className="text-[#bdf6f2] text-sm leading-relaxed">{feature.description}</Typography>

                                    {/* Hover Effect Line */}
                                    <div
                                        className="mt-4 h-1 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                                        style={{
                                            background: `linear-gradient(90deg, ${feature.color}, transparent)`,
                                        }}></div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom CTA */}
                <FadeInSection>
                    <motion.div initial={{opacity: 0, y: 30}} whileInView={{opacity: 1, y: 0}}
                                transition={{duration: 0.8, delay: 0.3}} viewport={{once: true}}
                                className="mt-16 text-center">
                        <Card
                            className="backdrop-blur-xl bg-gradient-to-r from-[rgba(135,229,221,0.1)] to-[rgba(161,113,248,0.1)] rounded-3xl border-2 border-[#87e5dd]/30 p-8 max-w-2xl mx-auto">
                            <CardContent className="p-0">
                                <Typography variant="h4" className="font-bold text-[#e2f2fa] mb-4">
                                    All Features in One Place
                                </Typography>
                                <Typography className="text-[#bdf6f2] mb-6">You don't need multiple apps. Track Drop has
                                    everything needed to create the perfect musical experience.</Typography>
                                <motion.button whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}
                                               className="px-8 py-3 font-bold rounded-full bg-gradient-to-r from-[#87e5dd] to-[#a171f8] text-[#181c2a] hover:shadow-[0_8px_32px_#87e5dd44] transition-all duration-300">
                                    Explore All Features
                                </motion.button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </FadeInSection>
            </Container>

            {/* Background Decorations */}
            <div
                className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-r from-[#87e5dd]/10 to-[#a171f8]/10 rounded-full blur-3xl animate-pulse"></div>
            <div
                className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-r from-[#a171f8]/10 to-[#87e5dd]/10 rounded-full blur-3xl animate-pulse"
                style={{animationDelay: "2s"}}></div>
        </div>
    );
};

export default FeaturesGrid;
