import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import {isUserLoggedIn} from "@/utils/actions";
import {ErrorAlert, FormField} from "@/components/Items";
import {Button, Typography, Link} from "@mui/material";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [loading, setLoading] = useState(true); // for skeleton loading
    const router = useRouter();
    const captcha = useRef();

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
        'use server'
        e.preventDefault();
        setError(null);

        if (!captchaToken) {
            setError('Please complete the CAPTCHA');
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: { captchaToken },
        });

        captcha.current.resetCaptcha();

        if (error) {
            setError(error.message);
        } else {
            await router.push('/');
        }
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
            height: '80vh',
        }}>
            <h1>Log in</h1>
            <form
                onSubmit={handleLogin}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    width: '300px',
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
                >
                    Login
                </Button>
            </form>
            <Typography variant="body2" align="center">
                First time around? <Link href="/register">Register</Link>
            </Typography>
        </div>
    );
}