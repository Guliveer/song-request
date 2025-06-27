"use client"

import { useEffect } from "react"
import { useRouter } from "next/router"
import { motion } from "framer-motion"
import { useUser } from "@/context/UserContext"
import { Button } from "shadcn/button"
import SetTitle from "@/components/SetTitle"

export default function RegisterSuccess() {
    const router = useRouter()
    const { isLoggedIn } = useUser()

    useEffect(() => {
        if (isLoggedIn) {
            router.push("/")
        }
    }, [isLoggedIn, router])

    return (
        <>
            <SetTitle text="Welcome!" />

            <div className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden px-6">
                <div className="absolute inset-0 bg-background" />

                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative z-10 max-w-xl text-center"
                >
                    <motion.h1
                        className="text-4xl sm:text-5xl font-bold uppercase tracking-tight text-foreground mb-4"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 }}
                    >
                        Registration successful! 🎉
                    </motion.h1>

                    <motion.p
                        className="text-lg sm:text-xl text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.75 }}
                    >
                        Check your email to confirm your account and start your journey 🚀
                    </motion.p>

                    <motion.div
                        className="mt-8"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2 }}
                    >
                        <Button
                            onClick={() => router.push("/login")}
                            className="px-6 py-2 text-base sm:text-lg font-semibold shadow-sm hover:scale-[1.03] transition-transform"
                        >
                            Go to Login
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </>
    )
}