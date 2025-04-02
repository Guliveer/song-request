import { useRouter } from 'next/router';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import {Button, CircularProgress, Link, Typography} from '@mui/material';
import {isUserLoggedIn, signUp, isUsernameAvailable} from "@/utils/actions";
import {ErrorAlert, FormField} from "@/components/Items";
import AuthProviders from "@/components/AuthProviders";
import { useEffect, useRef, useState } from 'react';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [loading, setLoading] = useState(true); // for skeleton loading
    const [isSubmitting, setIsSubmitting] = useState(false); // for button loading state
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

    async function handleSignup(e) {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await router.prefetch('/register/success');

            if (!captchaToken) throw new Error('Please complete the CAPTCHA');
            if (password !== confirmPassword) throw new Error('Passwords do not match');
            if (!/^[a-z0-9]+$/i.test(username)) throw new Error('Username must be alphanumeric-only');

            await isUsernameAvailable(username);

            await signUp(email, password, username, captchaToken);

            await router.push('/register/success');
        } catch (err) {
            captcha.current.resetCaptcha();
            setError(err.message);
        } finally {
            setIsSubmitting(false);
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
            height: '90vh',
        }}>
            <h1>Register</h1>
            <form
                onSubmit={handleSignup}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    width: '19rem',
                }}
            >
                <FormField
                    type="test"
                    label="Username"
                    value={username}
                    fullWidth
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    variant="outlined"
                />
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
                <FormField
                    type="password"
                    label="Confirm Password"
                    value={confirmPassword}
                    fullWidth
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    {isSubmitting ? <CircularProgress size={26}/> : 'Create account'}
                </Button>
                <AuthProviders />
            </form>
            <Typography variant="body2" align="center">
                Already registered? <Link href="/login">Log in</Link>
            </Typography>
        </div>
    );
}
