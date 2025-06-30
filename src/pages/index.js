import React from "react"
import Link from "next/link"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Avatar} from "@/components/ui/avatar"
import {Vote, Users, PlaylistCheck, Trophy, User} from "lucide-react"
import AnimatedBackground from "@/components/AnimatedBackground"
import FadeInSection from "@/components/FadeInSection"

export default function Home() {
    return (
        <>
            <AnimatedBackground/>
            <div className="min-h-screen relative z-10">
                {/* HERO */}
                <FadeInSection>
                    <div className="max-w-2xl mx-auto text-center py-20">
                        <h1 className="font-extrabold tracking-tight text-5xl md:text-7xl gradient-text mb-4">
                            Track Drop
                        </h1>
                        <p className="text-xl md:text-2xl font-semibold text-foreground/80 mb-8 drop-shadow-lg">
                            Vote, discover and share music with friends.<br/>
                            A professional social platform for music fans.
                        </p>
                        <Button
                            size="lg"
                            variant="secondary"
                            className="px-8 py-3 font-extrabold text-lg rounded-full shadow-lg text-primary-foreground bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary"
                            asChild
                        >
                            <Link href="/register">Get Started</Link>
                        </Button>
                    </div>
                </FadeInSection>

                {/* FEATURES */}
                <div className="max-w-5xl mx-auto mb-20">
                    <FadeInSection>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card
                                className="backdrop-blur-lg bg-card/90 border-2 border-primary text-card-foreground shadow-lg rounded-xl">
                                <CardContent className="text-center p-8 flex flex-col items-center">
                                    <Vote className="w-14 h-14 text-primary mb-2"/>
                                    <h2 className="font-extrabold text-lg mb-2">Vote for Songs</h2>
                                    <p className="text-muted-foreground">Choose your favorite tracks and help them reach
                                        the top of the list.</p>
                                </CardContent>
                            </Card>
                            <Card
                                className="backdrop-blur-lg bg-card/90 border-2 border-secondary text-card-foreground shadow-lg rounded-xl">
                                <CardContent className="text-center p-8 flex flex-col items-center">
                                    <Users className="w-14 h-14 text-secondary mb-2"/>
                                    <h2 className="font-extrabold text-lg mb-2">Follow Users</h2>
                                    <p className="text-accent-foreground">Follow your friends and discover what they
                                        listen to and vote for.</p>
                                </CardContent>
                            </Card>
                            <Card
                                className="backdrop-blur-lg bg-card/90 border-2 border-primary text-card-foreground shadow-lg rounded-xl">
                                <CardContent className="text-center p-8 flex flex-col items-center">
                                    <PlaylistCheck className="w-14 h-14 text-primary mb-2"/>
                                    <h2 className="font-extrabold text-lg mb-2">Private & Public Playlists</h2>
                                    <p className="text-muted-foreground">Share playlists publicly or keep them just for
                                        yourself.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </FadeInSection>
                </div>

                {/* TOP SONGS */}
                <FadeInSection>
                    <div className="max-w-2xl mx-auto mb-20">
                        <Card className="p-8 rounded-xl bg-card/95 border-2 border-secondary shadow-lg mb-4">
                            <div className="flex items-center gap-4 mb-6 justify-center">
                                <Trophy className="w-11 h-11 text-yellow-400"/>
                                <h2 className="text-3xl font-extrabold text-foreground">Top 3 Songs</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {[
                                    {title: 'Blinding Lights', artist: 'The Weeknd', votes: 124},
                                    {title: 'Levitating', artist: 'Dua Lipa', votes: 98},
                                    {title: 'Shape of You', artist: 'Ed Sheeran', votes: 87}
                                ].map((song, idx) => (
                                    <Card key={song.title}
                                          className="bg-primary/10 border-2 border-border text-card-foreground rounded-lg shadow-none text-center">
                                        <CardContent>
                                            <h3 className="font-extrabold text-lg">{idx + 1}. {song.title}</h3>
                                            <p className="text-muted-foreground">{song.artist}</p>
                                            <span className="font-extrabold text-primary">{song.votes} votes</span>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </Card>
                    </div>
                </FadeInSection>

                {/* FRIENDS ACTIVITY */}
                <FadeInSection>
                    <div className="max-w-2xl mx-auto pb-20">
                        <Card className="p-8 rounded-xl bg-card/95 border-2 border-primary shadow-lg">
                            <div className="flex items-center gap-4 mb-4">
                                <Users className="w-10 h-10 text-primary"/>
                                <h2 className="text-2xl font-extrabold text-foreground">Friends Activity</h2>
                            </div>
                            <div className="space-y-4">
                                {[
                                    {name: 'Anna', song: 'Blinding Lights'},
                                    {name: 'Mike', song: 'Levitating'},
                                    {name: 'Sara', song: 'Shape of You'}
                                ].map(user => (
                                    <div className="flex items-center gap-4" key={user.name}>
                                        <Avatar className="w-12 h-12">
                                            <User className="w-8 h-8 text-muted-foreground"/>
                                        </Avatar>
                                        <div>
                                            <span className="font-extrabold text-foreground">{user.name}</span>
                                            <p className="text-muted-foreground text-base">
                                                Voted for: <b className="text-primary">{user.song}</b>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </FadeInSection>
            </div>
        </>
    )
}