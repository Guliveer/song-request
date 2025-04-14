import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";
import SetTitle from "@/components/SetTitle";

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
        <div>
            <h1>User Panel</h1>
            <p>Witaj w panelu użytkownika!</p>
        </div>
        </>
    );
}
