"use client"

import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useEffect } from "react"

const fadeInUp = {
    hidden: {
        opacity: 0,
        y: 60,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: "easeOut"
        }
    }
}

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1
        }
    }
}

const FadeInSection = ({
                           children,
                           variant = "fadeInUp",
                           threshold = 0.3,
                           triggerOnce = true,
                           delay = 0,
                           ...props
                       }) => {
    const controls = useAnimation()
    const [ref, inView] = useInView({
        triggerOnce,
        threshold,
    })

    useEffect(() => {
        if (inView) {
            controls.start("visible")
        } else if (!triggerOnce) {
            controls.start("hidden")
        }
    }, [controls, inView, triggerOnce])

    const variants = {
        fadeInUp,
        staggerContainer,
        slideInLeft: {
            hidden: { opacity: 0, x: -100 },
            visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.8, ease: "easeOut" }
            }
        },
        slideInRight: {
            hidden: { opacity: 0, x: 100 },
            visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.8, ease: "easeOut" }
            }
        },
        scaleIn: {
            hidden: { opacity: 0, scale: 0.8 },
            visible: {
                opacity: 1,
                scale: 1,
                transition: { duration: 0.6, ease: "easeOut" }
            }
        }
    }

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={variants[variant]}
            style={{
                willChange: 'transform, opacity',
                ...(delay && { transitionDelay: `${delay}s` })
            }}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export default FadeInSection
