// url path: /register/success

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Button, Box } from '@mui/material';
import {isUserLoggedIn} from "@/utils/actions";

export default function RegisterSuccess() {
    const router = useRouter();

    useEffect(() => {
        async function checkUser() {
            if (await isUserLoggedIn()) {
                await router.push('/');
            }
        }

        checkUser();
    }, [router]);

    return (
        <Container maxWidth="sm">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="90vh"
                textAlign="center"
            >
                <Typography variant="h4" gutterBottom sx={{
                    textTransform: 'uppercase',
                    fontWeight: 700,
                }}>
                    Registration successful! 🎉
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Check your email to confirm your account and start using the app.
                </Typography>
                <Box mt={3}>
                    <Button variant="contained" color="primary" onClick={() => router.push('/login')}>
                        Go to Login
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}