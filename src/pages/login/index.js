import {useEffect, useRef, useState} from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    const router = useRouter();
    const captcha = useRef();

    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                await router.push('/');
            }
        }

        checkUser();
    }, [router]);

    async function handleLogin(e) {
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h1>Login</h1>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '0.5rem', fontSize: '1rem' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '0.5rem', fontSize: '1rem' }}
                />
                <HCaptcha
                    ref={captcha}
                    sitekey="b224d136-6a4c-407a-8d9c-01c2221a2dea"
                    onVerify={handleCaptchaChange}
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ padding: '0.5rem', fontSize: '1rem' }}>Login</button>
            </form>
        </div>
    );
}