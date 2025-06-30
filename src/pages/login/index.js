import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useUser } from "@/context/UserContext";
import AuthProvidersList from "@/components/AuthProvidersList";
import SetTitle from "@/components/SetTitle";
import { Input } from "shadcn/input"
import { Button } from "shadcn/button"
import { Separator } from "shadcn/separator"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "shadcn/dialog"
import { Alert, AlertDescription, AlertTitle } from "shadcn/alert"
import { Loader2, LogIn } from "lucide-react"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [captchaToken, setCaptchaToken] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const captcha = useRef()
    const { isLoggedIn } = useUser()

    const [showMfaDialog, setShowMfaDialog] = useState(false)
    const [mfaCode, setMfaCode] = useState("")
    const [factorId, setFactorId] = useState("")
    const [challengeId, setChallengeId] = useState("")
    const [mfaError, setMfaError] = useState("")

    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [forgotEmail, setForgotEmail] = useState("")
    const [forgotError, setForgotError] = useState("")
    const [forgotSuccess, setForgotSuccess] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [forgotCaptchaToken, setForgotCaptchaToken] = useState(null)
    const forgotCaptcha = useRef()

    useEffect(() => {
        if (
            isLoggedIn &&
            !["/reset-password", "/login"].includes(window.location.pathname)
        ) {
            router.push("/")
        }
    }, [isLoggedIn, router])

    async function handleLogin(e) {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        if (!captchaToken) {
            setError("Please complete the CAPTCHA")
            setIsSubmitting(false)
            return
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: { captchaToken },
        })

        if (error) {
            captcha.current?.resetCaptcha()
            setError(error.message)
            setIsSubmitting(false)
            return
        }

        const { data: aalData, error: aalError } =
            await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

        if (aalError) {
            setError(aalError.message)
            setIsSubmitting(false)
            return
        }

        if (aalData.currentLevel === "aal1" && aalData.nextLevel === "aal2") {
            const { data: factorsData, error: factorsError } =
                await supabase.auth.mfa.listFactors()

            if (factorsError) {
                setError(factorsError.message)
                setIsSubmitting(false)
                return
            }

            const totpFactor = factorsData?.all?.find(
                (f) => f.status === "verified" && f.factor_type === "totp"
            )

            if (totpFactor) {
                const { data: challenge, error: challengeError } =
                    await supabase.auth.mfa.challenge({ factorId: totpFactor.id })

                if (challengeError) {
                    setError(challengeError.message)
                    setIsSubmitting(false)
                    return
                }

                setFactorId(totpFactor.id)
                setChallengeId(challenge.id)
                setShowMfaDialog(true)
                setIsSubmitting(false)
                return
            } else {
                setError("No verified TOTP factor found for this user.")
                setIsSubmitting(false)
                return
            }
        }

        window.location.href = "/"
    }

    async function handleVerifyMfa() {
        setMfaError("")
        const { error } = await supabase.auth.mfa.verify({
            factorId,
            challengeId,
            code: mfaCode.trim(),
        })
        if (error) {
            setMfaError(error.message)
            return
        }
        window.location.href = "/"
    }

    async function handleForgotPassword() {
        setForgotError("")
        setForgotSuccess("")
        setIsSending(true)

        if (!forgotCaptchaToken) {
            setForgotError("Please complete the CAPTCHA")
            setIsSending(false)
            return
        }

        const redirectTo =
            process.env.NEXT_PUBLIC_REDIRECT_URL ||
            "./reset-password"

        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
            captchaToken: forgotCaptchaToken,
            redirectTo,
        })

        setIsSending(false)

        if (error) {
            forgotCaptcha.current?.resetCaptcha()
            setForgotError(error.message)
        } else {
            setForgotSuccess("A password reset link has been sent to your email address.")
        }
    }

    return (
        <>
            <SetTitle text="Log in" />

            <div className="flex flex-col gap-8 items-center justify-center h-[90vh] px-4">
                <h1 className="text-3xl font-bold">Log in</h1>

                <form
                    onSubmit={handleLogin}
                    className="flex flex-col gap-4 w-fit max-w-sm"
                >
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

                    <HCaptcha
                        ref={captcha}
                        sitekey="b224d136-6a4c-407a-8d9c-01c2221a2dea"
                        theme="dark"
                        onVerify={(token) => setCaptchaToken(token)}
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
                        {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <><LogIn className="w-4 h-4 mr-2" /> Log in</>}
                    </Button>

                    <p className="text-right text-sm">
                        <Button variant="link" className={"text-muted-foreground p-0"} onClick={() => setShowForgotPassword(true)}>
                            Forgot password?
                        </Button>
                    </p>

                    <Separator />

                    <AuthProvidersList />
                </form>

                <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                    <span>First time around?</span>
                    <Button variant="link" className={"p-0"} onClick={() => router.push("/register")}>
                        Create an account
                    </Button>
                </p>
            </div>

            {/* Forgot Password Dialog */}
            <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reset your password</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground mb-2">
                        Enter your email address. You will receive a link to reset your password.
                    </p>
                    <Input
                        type="email"
                        placeholder="Email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                    />
                    {forgotError && <p className="text-sm text-destructive">{forgotError}</p>}
                    {forgotSuccess && <p className="text-sm text-green-600">{forgotSuccess}</p>}
                    <HCaptcha
                        ref={forgotCaptcha}
                        sitekey="b224d136-6a4c-407a-8d9c-01c2221a2dea"
                        theme="dark"
                        onVerify={(token) => setForgotCaptchaToken(token)}
                    />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setShowForgotPassword(false)
                                setForgotEmail("")
                                setForgotError("")
                                setForgotSuccess("")
                                setForgotCaptchaToken(null)
                                forgotCaptcha.current?.resetCaptcha()
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleForgotPassword}
                            disabled={isSending || !forgotEmail || !forgotCaptchaToken}
                        >
                            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MFA Dialog */}
            <Dialog open={showMfaDialog} onOpenChange={setShowMfaDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Two-Factor Authentication Required</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code from your authenticator app.
                    </p>
                    <Input
                        placeholder="6-digit code"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        inputMode="numeric"
                        maxLength={6}
                        className="tracking-widest text-center text-lg font-semibold"
                    />
                    {mfaError && <p className="text-sm text-destructive">{mfaError}</p>}
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setShowMfaDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleVerifyMfa} disabled={mfaCode.length !== 6}>
                            Verify
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
