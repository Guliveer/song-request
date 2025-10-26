import React from "react";
import { motion } from "framer-motion";
import { Container } from "shadcn/container";
import { Typography } from "shadcn/typography";
import { Card, CardContent } from "shadcn/card";
import { AlertTriangle, CheckCircle, Music, ThumbsDown, Users, Volume2 } from "lucide-react";
import FadeInSection from "@/components/FadeInSection";

const ProblemSolution = () => {
    const problems = [
        {
            icon: ThumbsDown,
            title: "Unhappy Guests",
            description: "One person controls the music, the rest get bored or complain about song choices.",
        },
        {
            icon: Volume2,
            title: "Constant Change Requests",
            description: "Guests constantly approach with requests to play specific songs.",
        },
        {
            icon: Music,
            title: "Monotonous Playlist",
            description: "The same music at every party - lack of variety and freshness.",
        },
    ];

    const solutions = [
        {
            icon: Users,
            title: "Democratic Voting",
            description: "All guests can vote on their favorite tracks in real-time.",
        },
        {
            icon: Music,
            title: "Automatic Queue",
            description: "Most voted songs automatically rise to the top of the playlist.",
        },
        {
            icon: CheckCircle,
            title: "Everyone Happy",
            description: "Everyone has influence on the music, meaning better atmosphere and more fun.",
        },
    ];

    return (
        <div className="py-20 lg:py-32 relative">
            <Container>
                {/* Section Header */}
                <FadeInSection>
                    <div className="text-center mb-16">
                        <Typography variant="h2" className="font-black text-[#e2f2fa] mb-4 text-3xl md:text-5xl">
                            End Music Problems Forever
                        </Typography>
                        <Typography className="text-[#bdf6f2] text-lg md:text-xl max-w-3xl mx-auto">Discover the most
                            common music problems at events and see how Track Drop solves them</Typography>
                    </div>
                </FadeInSection>

                {/* Problem Section */}
                <FadeInSection variant="slideInLeft">
                    <div className="mb-20">
                        <div className="flex items-center justify-center gap-3 mb-12">
                            <AlertTriangle className="w-8 h-8 text-red-400"/>
                            <Typography variant="h3" className="font-bold text-red-400 text-2xl md:text-3xl">
                                Common Problems
                            </Typography>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {problems.map((problem, index) => (
                                <motion.div key={index} initial={{opacity: 0, y: 30}} whileInView={{opacity: 1, y: 0}}
                                            transition={{duration: 0.6, delay: index * 0.1}} viewport={{once: true}}>
                                    <Card
                                        className="h-full backdrop-blur-xl bg-[rgba(239,68,68,0.1)] rounded-2xl border-2 border-red-400/30 hover:border-red-400/50 transition-all duration-300">
                                        <CardContent className="p-6 text-center">
                                            <div className="mb-4 flex justify-center">
                                                <div className="p-3 rounded-full bg-red-400/20">
                                                    <problem.icon className="w-8 h-8 text-red-400"/>
                                                </div>
                                            </div>
                                            <Typography variant="h6" className="font-bold text-[#e2f2fa] mb-3">
                                                {problem.title}
                                            </Typography>
                                            <Typography
                                                className="text-[#bdf6f2] text-sm leading-relaxed">{problem.description}</Typography>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </FadeInSection>

                {/* Solution Section */}
                <FadeInSection variant="slideInRight">
                    <div>
                        <div className="flex items-center justify-center gap-3 mb-12">
                            <CheckCircle className="w-8 h-8 text-[#87e5dd]"/>
                            <Typography variant="h3" className="font-bold text-[#87e5dd] text-2xl md:text-3xl">
                                Our Solution
                            </Typography>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {solutions.map((solution, index) => (
                                <motion.div key={index} initial={{opacity: 0, y: 30}} whileInView={{opacity: 1, y: 0}}
                                            transition={{duration: 0.6, delay: index * 0.1}} viewport={{once: true}}
                                            whileHover={{y: -5}}>
                                    <Card
                                        className="h-full backdrop-blur-xl bg-[rgba(135,229,221,0.1)] rounded-2xl border-2 border-[#87e5dd]/30 hover:border-[#87e5dd]/60 transition-all duration-300 hover:shadow-[0_8px_32px_#87e5dd22]">
                                        <CardContent className="p-6 text-center">
                                            <div className="mb-4 flex justify-center">
                                                <div className="p-3 rounded-full bg-[#87e5dd]/20">
                                                    <solution.icon className="w-8 h-8 text-[#87e5dd]"/>
                                                </div>
                                            </div>
                                            <Typography variant="h6" className="font-bold text-[#e2f2fa] mb-3">
                                                {solution.title}
                                            </Typography>
                                            <Typography
                                                className="text-[#bdf6f2] text-sm leading-relaxed">{solution.description}</Typography>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </FadeInSection>

                {/* Call to Action */}
                <FadeInSection>
                    <motion.div initial={{opacity: 0, scale: 0.9}} whileInView={{opacity: 1, scale: 1}}
                                transition={{duration: 0.8}} viewport={{once: true}} className="mt-16 text-center">
                        <Card
                            className="backdrop-blur-xl bg-gradient-to-r from-[rgba(135,229,221,0.1)] to-[rgba(161,113,248,0.1)] rounded-3xl border-2 border-[#87e5dd]/30 p-8">
                            <CardContent className="p-0">
                                <Typography variant="h4" className="font-bold text-[#e2f2fa] mb-4">
                                    Ready for Change?
                                </Typography>
                                <Typography className="text-[#bdf6f2] mb-6 max-w-2xl mx-auto">Join thousands of event
                                    organizers who already use Track Drop to create unforgettable musical experiences
                                    for their guests.</Typography>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                                        <button
                                            className="px-8 py-3 font-bold rounded-full bg-gradient-to-r from-[#87e5dd] to-[#a171f8] text-[#181c2a] hover:shadow-[0_8px_32px_#87e5dd44] transition-all duration-300">Try
                                            Free
                                        </button>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </FadeInSection>
            </Container>

            {/* Background Elements */}
            <div
                className="absolute top-1/4 left-0 w-64 h-64 bg-gradient-to-r from-red-500/10 to-transparent rounded-full blur-3xl"></div>
            <div
                className="absolute bottom-1/4 right-0 w-64 h-64 bg-gradient-to-l from-[#87e5dd]/10 to-transparent rounded-full blur-3xl"></div>
        </div>
    );
};

export default ProblemSolution;
