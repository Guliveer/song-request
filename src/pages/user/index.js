import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";
import SetTitle from "@/components/SetTitle";
import Account  from "@/components/User_Panel/Account";
import Followers from "@/components/User_Panel/Followers";
import Providers from "@/components/User_Panel/Providers";
import {Box} from "@mui/material";

export default function UserPanel() {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                await router.replace("/login"); // Przekierowanie na stronę logowania
                return;
            }
            setIsLoggedIn(true);
            setIsLoading(false);
        };

        checkUser();
    }, [router]);

    if (!isLoggedIn) return null;

    return (
        <>
            <SetTitle text={"User Panel"} />
            <Box sx={{ display: 'flex', flexDirection: 'column', placeItems: 'center', gap: '2rem', }}>
                <Account />
                <Followers />
                <Providers />
            </Box>

        </>
    );
}