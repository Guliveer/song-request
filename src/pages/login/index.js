import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useUser } from "@/context/UserContext";
import { LoginRounded as LoginIcon } from '@mui/icons-material';
import { ErrorAlert, FormField } from "@/components/Items";
import { Button, Typography, Link, CircularProgress, Box, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import AuthProvidersList from "@/components/AuthProvidersList";
import SetTitle from "@/components/SetTitle";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const captcha = useRef();
    const { isLoggedIn } = useUser();

    // MFA state
    const [showMfaDialog, setShowMfaDialog] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [factorId, setFactorId] = useState('');
    const [challengeId, setChallengeId] = useState('');
    const [mfaError, setMfaError] = useState('');

    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [forgotCaptchaToken, setForgotCaptchaToken] = useState(null);
    const forgotCaptcha = useRef();

    async function handleForgotPassword() {
        setForgotError('');
        setForgotSuccess('');
        setIsSending(true);

        if (!forgotCaptchaToken) {
            setForgotError('Please complete the CAPTCHA');
            setIsSending(false);
            return;
        }

        const redirectTo = process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL || "http://localhost:3000/reset-password";
        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
            captchaToken: forgotCaptchaToken,
            redirectTo,
        });

        setIsSending(false);

        if (error) {
            if (forgotCaptcha.current) forgotCaptcha.current.resetCaptcha();
            setForgotError(error.message);
        } else {
            setForgotSuccess('A password reset link has been sent to your email address.');
        }
    }


    useEffect(() => {
        // NIE przekierowuj jeśli jesteś na /reset-password lub /login
        if (
            isLoggedIn &&
            !['/reset-password', '/login'].includes(window.location.pathname)
        ) {
            router.push('/');
        }
    }, [isLoggedIn, router]);


    async function handleLogin(e) {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!captchaToken) {
            setError('Please complete the CAPTCHA');
            setIsSubmitting(false);
            return;
        }

        // 1. Logowanie hasłem
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: { captchaToken },
        });
        console.log("signInWithPassword:", { data, error });

        if (error) {
            captcha.current.resetCaptcha();
            setError(error.message);
            setIsSubmitting(false);
            return;
        }
      
        // 2. Sprawdź poziom MFA (AAL)
        const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        console.log("getAuthenticatorAssuranceLevel:", { aalData, aalError });

        if (aalError) {
            setError(aalError.message);
            setIsSubmitting(false);
            return;
        }

        // Jeśli currentLevel === 'aal1' i nextLevel === 'aal2', użytkownik ma aktywne MFA i musi podać kod
        if (aalData.currentLevel === 'aal1' && aalData.nextLevel === 'aal2') {
            // 3. Pobierz czynnik TOTP
            const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
            console.log("listFactors:", { factorsData, factorsError });

            if (factorsError) {
                setError(factorsError.message);
                setIsSubmitting(false);
                return;
            }

            const totpFactor = factorsData?.all?.find(
                f => f.status === 'verified' && (f.factor_type === 'totp' || f.factorType === 'totp')
            );
            console.log('Factors:', factorsData?.all);

            if (totpFactor) {
                // 4. Rozpocznij challenge
                const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
                console.log("challenge:", { challenge, challengeError });

                if (challengeError) {
                    setError(challengeError.message);
                    setIsSubmitting(false);
                    return;
                }
                setFactorId(totpFactor.id);
                setChallengeId(challenge.id);
                setShowMfaDialog(true);
                setIsSubmitting(false);
                return;
            } else {
                setError("No verified TOTP factor found for this user.");
                setIsSubmitting(false);
                return;
            }
        }

        // 5. Zwykłe logowanie bez 2FA lub już zalogowany na poziomie aal2
        console.log("No MFA required or already aal2, redirecting.");
        window.location.href = '/';
    }

    async function handleVerifyMfa() {
        setMfaError('');
        const { error } = await supabase.auth.mfa.verify({
            factorId,
            challengeId,
            code: mfaCode.trim(),
        });
        console.log("verify:", { error });
        if (error) {
            setMfaError(error.message);
            return;
        }
        window.location.href = '/';
    }

    function handleCaptchaChange(token) {
        setCaptchaToken(token);
    }

    return (
        <>
            <SetTitle text={"Log in"} />

            <Box sx={{
                display: 'flex',
                gap: '2em',
                flexWrap: 'nowrap',
                flexDirection: 'column',
                placeItems: 'center',
                placeContent: 'center',
                height: '90vh',
            }}>
                <h1>Log in</h1>
                <form
                    onSubmit={handleLogin}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        width: '19rem',
                    }}
                >
                    <FormField
                        type="email"
                        label="Email"
                        value={email}
                        fullWidth
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        variant="outlined"
                    />
                    <FormField
                        type="password"
                        label="Password"
                        value={password}
                        fullWidth
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        variant="outlined"
                    />
                    <HCaptcha
                        ref={captcha}
                        sitekey="b224d136-6a4c-407a-8d9c-01c2221a2dea"
                        theme="dark"
                        onVerify={handleCaptchaChange}
                    />
                    {error &&
                        <ErrorAlert
                            sx={{
                                width: '100%',
                            }}
                            onClose={() => {
                                setError(null);
                            }}
                        >{error}
                        </ErrorAlert>
                    }
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={!isSubmitting && <LoginIcon />}
                        disabled={isSubmitting || !email || !password || !captchaToken}
                    >
                        {isSubmitting ? <CircularProgress size={26} /> : 'Log in'}
                    </Button>

                    <Typography variant="body2" align="right" sx={{ mt: 1 }}>
                        <Link href="#" onClick={(e) => { e.preventDefault(); setShowForgotPassword(true); }}>
                            Forgot password?
                        </Link>
                    </Typography>

                    <Dialog open={showForgotPassword} onClose={() => {
                        setShowForgotPassword(false);
                        setForgotEmail('');
                        setForgotError('');
                        setForgotSuccess('');
                    }}>
                        <DialogTitle>Reset your password</DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Enter your email address. You will receive a link to reset your password.
                            </Typography>
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                value={forgotEmail}
                                onChange={e => setForgotEmail(e.target.value)}
                                sx={{ mt: 1 }}
                            />
                            {forgotError && (
                                <Typography color="error" sx={{ mt: 1 }}>{forgotError}</Typography>
                            )}
                            {forgotSuccess && (
                                <Typography color="success.main" sx={{ mt: 1 }}>{forgotSuccess}</Typography>
                            )}
                            <HCaptcha
                                ref={forgotCaptcha}
                                sitekey="b224d136-6a4c-407a-8d9c-01c2221a2dea"
                                theme="dark"
                                onVerify={token => setForgotCaptchaToken(token)}
                            />

                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setForgotEmail('');
                                    setForgotError('');
                                    setForgotSuccess('');
                                    setForgotCaptchaToken(null);
                                    if (forgotCaptcha.current) forgotCaptcha.current.resetCaptcha();
                                }}>
                                Cancel
                            </Button>

                            <Button
                                onClick={handleForgotPassword}
                                variant="contained"
                                disabled={isSending || !forgotEmail || !forgotCaptchaToken}
                            >
                                {isSending ? <CircularProgress size={20} /> : 'Send reset link'}
                            </Button>
                        </DialogActions>
                    </Dialog>


                    <Divider variant="fullWidth" flexItem />

                    <AuthProvidersList />
                </form>
                <Typography variant="body2" align="center">
                    First time around? <Link href="/register">Register</Link>
                </Typography>
            </Box>

            {/* MFA Dialog */}
            <Dialog
                open={showMfaDialog}
                onClose={() => setShowMfaDialog(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        backgroundColor: 'background.paper',
                        boxShadow: 6,
                        px: 3,
                        pt: 2,
                        pb: 3,
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'primary.main' }}>
                    Two-Factor Authentication Required
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                        Please enter the 6-digit code from your authenticator app to continue logging in.
                    </Typography>
                    <TextField
                        label="6-digit code"
                        value={mfaCode}
                        onChange={e => setMfaCode(e.target.value)}
                        fullWidth
                        autoFocus
                        inputProps={{
                            maxLength: 6,
                            inputMode: 'numeric',
                            pattern: '[0-9]*',
                            autoComplete: 'one-time-code',
                            style: { letterSpacing: '0.3em', fontWeight: 600, fontSize: '1.2rem' }
                        }}
                        sx={{ mb: 1 }}
                    />
                    {mfaError && (
                        <Typography color="error" sx={{ mt: 1 }}>
                            {mfaError}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ pt: 0 }}>
                    <Button onClick={() => setShowMfaDialog(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleVerifyMfa}
                        variant="contained"
                        disabled={mfaCode.length !== 6}
                        sx={{
                            fontWeight: 'bold',
                            letterSpacing: '0.05em',
                            px: 3,
                        }}
                    >
                        Verify
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
