import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useUser } from "@/context/UserContext";
import { LoginRounded as LoginIcon } from '@mui/icons-material';
import { ErrorAlert, FormField } from "@/components/Items";
import {Button, Typography, Link, CircularProgress, Box, Divider} from "@mui/material";
import AuthProvidersList from "@/components/AuthProvidersList";
import SetTitle from "@/components/SetTitle";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const captcha = useRef();
    const { isLoggedIn } = useUser(); // Use global user state

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
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: { captchaToken },
        });

        if (error) {
            captcha.current.resetCaptcha();
            setError(error.message);
            setIsSubmitting(false);
            return;
        }

        window.location.href = '/'; // redirect & reload the webapp
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
                        <Link href="#" onClick={() => setShowForgotPassword(true)}>
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
        </>
    );
}