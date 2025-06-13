import {Box} from "@mui/material"
import {motion} from "framer-motion"
import {useEffect, useState} from "react"

const AnimatedBackground = () => {
    const [dimensions, setDimensions] = useState({width: 0, height: 0})

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        updateDimensions()
        window.addEventListener('resize', updateDimensions)
        return () => window.removeEventListener('resize', updateDimensions)
    }, [])

    const stars = Array.from({length: 100}, (_, i) => ({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
    }))

    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: "none",
                zIndex: 0,
                overflow: "hidden",
            }}
        >
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    initial={{
                        x: star.x,
                        y: star.y,
                        scale: 0.5,
                        opacity: 0.3,
                    }}
                    animate={{
                        y: [star.y, star.y - 100, star.y],
                        x: [star.x, star.x + 50, star.x],
                        scale: [0.5, 1, 0.5],
                        opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: star.delay,
                        ease: "easeInOut",
                    }}
                    style={{
                        position: "absolute",
                        width: star.size,
                        height: star.size,
                        borderRadius: "50%",
                        background: Math.random() > 0.5 ? "#87e5dd" : "#a171f8",
                    }}
                />
            ))}
        </Box>
    )
}

export default AnimatedBackground