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

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const captcha = useRef();
    const { isLoggedIn } = useUser(); // Use global user state

    useEffect(() => {
        if (isLoggedIn) {
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
                        startIcon={<LoginIcon />}
                        disabled={isSubmitting || !email || !password || !captchaToken}
                    >
                        {isSubmitting ? <CircularProgress size={26} /> : 'Log in'}
                    </Button>

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