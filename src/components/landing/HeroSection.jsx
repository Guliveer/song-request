import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "shadcn/container";
import { Typography } from "shadcn/typography";
import { Button } from "shadcn/button";
import { Music, Play, Users, Vote } from "lucide-react";

const HeroSection = () => {
    const floatingIcons = [
        {Icon: Music, delay: 0, x: -100, y: -50},
        {Icon: Users, delay: 0.5, x: 100, y: -30},
        {Icon: Vote, delay: 1, x: -80, y: 50},
        {Icon: Play, delay: 1.5, x: 120, y: 80},
    ];

    return (
        <Container className="relative py-20 lg:py-32 text-center overflow-hidden">
            {/* Floating Icons */}
            {floatingIcons.map(({Icon, delay, x, y}, index) => (
                <motion.div
                    key={index}
                    initial={{opacity: 0, scale: 0, x: 0, y: 0}}
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [0.8, 1.2, 0.8],
                        x: [0, x, 0],
                        y: [0, y, 0],
                    }}
                    transition={{
                        duration: 6,
                        delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute hidden lg:block"
                    style={{
                        left: `${20 + index * 20}%`,
                        top: `${30 + index * 10}%`,
                    }}>
                    <Icon className="w-8 h-8 text-[#87e5dd] opacity-40"/>
                </motion.div>
            ))}

            {/* Main Content */}
            <motion.div initial={{opacity: 0, y: 50}} animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.8, ease: "easeOut"}}>
                <motion.div initial={{scale: 0.9}} animate={{scale: 1}}
                            transition={{duration: 1, ease: "easeOut", delay: 0.2}}>
                    <Typography variant="h1"
                                className="font-black tracking-tight bg-gradient-to-r from-[#87e5dd] via-[#87e5dd] to-[#a171f8] bg-clip-text text-transparent mb-6 text-5xl md:text-7xl lg:text-8xl">
                        Track Drop
                    </Typography>
                </motion.div>

                <motion.div initial={{opacity: 0, y: 30}} animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.8, delay: 0.4}}>
                    <Typography variant="h2" className="text-[#e2f2fa] mb-4 font-bold text-2xl md:text-4xl lg:text-5xl"
                                style={{textShadow: "0 2px 8px #181c2a"}}>
                        Democratize Music at Your Events
                    </Typography>
                </motion.div>

                <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.8, delay: 0.6}}>
                    <Typography variant="h5"
                                className="text-[#bdf6f2] mb-12 font-medium text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed"
                                style={{textShadow: "0 1px 4px #181c2a"}}>
                        Let your guests vote on their favorite tracks and create the perfect playlist for every event.
                        No more music disputes - just democratic decisions and great fun!
                    </Typography>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div initial={{opacity: 0, y: 30, scale: 0.9}} animate={{opacity: 1, y: 0, scale: 1}}
                            transition={{duration: 0.8, delay: 0.8}}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                        <Button asChild size="lg"
                                className="px-8 py-4 font-bold text-lg rounded-full shadow-[0_8px_32px_#a171f855] bg-gradient-to-r from-[#a171f8] to-[#87e5dd] text-[#181c2a] hover:from-[#a171f8] hover:to-[#87e5dd] hover:text-[#181c2a] transition-all duration-300 hover:shadow-[0_12px_40px_#a171f866]">
                            <Link href="/register" className="flex items-center gap-2">
                                <Play className="w-5 h-5"/>
                                Start Free
                            </Link>
                        </Button>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Gradient Orbs */}
            <div
                className="absolute top-20 left-10 w-fit h-fit bg-gradient-to-r from-[#87e5dd] to-[#a171f8] rounded-full opacity-20 blur-3xl animate-pulse"/>
            <div
                className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-[#a171f8] to-[#87e5dd] rounded-full opacity-15 blur-3xl animate-pulse"
                style={{animationDelay: "1s"}}/>
        </Container>
    );
};

export default HeroSection;
