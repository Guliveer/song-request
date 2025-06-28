import { useRouter } from 'next/router';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { signUp, isUsernameAvailable, playSound } from "@/lib/actions";
import { useEffect, useRef, useState } from 'react';
import SetTitle from "@/components/SetTitle";
import { useUser } from "@/context/UserContext";
import { Input } from "shadcn/input"
import { Button } from "shadcn/button"
import { Alert, AlertTitle, AlertDescription } from "shadcn/alert"
import { UserPlus, Loader2 } from "lucide-react"

export default function Register() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [username, setUsername] = useState("")
    const [error, setError] = useState(null)
    const [captchaToken, setCaptchaToken] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const captcha = useRef()
    const { isLoggedIn } = useUser()

    useEffect(() => {
        if (isLoggedIn) {
            router.push("/")
        }
    }, [isLoggedIn, router])

    async function handleSignup(e) {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            await router.prefetch("/register/success")

            if (!captchaToken) throw new Error("Please complete the CAPTCHA")
            if (password !== confirmPassword) throw new Error("Passwords do not match")
            if (!/^[a-z0-9]+$/i.test(username))
                throw new Error("Username must be alphanumeric-only")

            await isUsernameAvailable(username)
            await signUp(email, password, username, captchaToken)
            await playSound("swoosh", 0.8)
            await router.push("/register/success")
        } catch (err) {
            captcha.current?.resetCaptcha()
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    function handleCaptchaChange(token) {
        setCaptchaToken(token)
    }

    return (
        <>
            <SetTitle text="Register" />

            <div className="flex flex-col gap-8 items-center justify-center h-[90vh] px-4">
                <h1 className="text-3xl font-bold">Register</h1>

                <form
                    onSubmit={handleSignup}
                    className="flex flex-col gap-4 fit max-w-sm"
                >
                    <Input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <HCaptcha
                        ref={captcha}
                        sitekey="b224d136-6a4c-407a-8d9c-01c2221a2dea"
                        theme="dark"
                        onVerify={handleCaptchaChange}
                    />

                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting || !email || !password || !captchaToken}
                        className="w-full"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <><UserPlus className="w-4 h-4 mr-2" />Create account</>
                        )}
                    </Button>
                </form>

                <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                    <span>Already have an account?</span>
                    <Button variant="link" className={"p-0"} onClick={() => router.push("/login")}>
                        Log in
                    </Button>
                </p>
            </div>
        </>
    )
}