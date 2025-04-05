import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import {isUserLoggedIn} from "@/utils/actions";
import {ErrorAlert, FormField} from "@/components/Items";
import {Button, Typography, Link, CircularProgress} from "@mui/material";
import AuthProvidersList from "@/components/AuthProvidersList";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [loading, setLoading] = useState(true); // for skeleton loading
    const [isSubmitting, setIsSubmitting] = useState(false); // for button loading state
    const router = useRouter();
    const captcha = useRef();

    useEffect(function () {
        document.title = 'Login - Song Request';
        const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = '/logo.png';

        document.head.appendChild(link);
    }, []);

    useEffect(() => {
        async function checkUser() {
            if (await isUserLoggedIn()) {
                await router.push('/');
            }
        }

        checkUser();
        setLoading(false);
    }, [router]);

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
        } else {
            await router.push('/');
        }

        setIsSubmitting(false);
    }

    function handleCaptchaChange(token) {
        setCaptchaToken(token);
    }

    return (
        <div style={{
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
                    disabled={isSubmitting || !email || !password || !captchaToken}
                >
                    {isSubmitting ? <CircularProgress size={26}/> : 'Log in'}
                </Button>
                <AuthProvidersList />
            </form>
            <Typography variant="body2" align="center">
                First time around? <Link href="/register">Register</Link>
            </Typography>
        </div>
    );
}