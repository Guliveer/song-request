import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";

export default function UserPanel() {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const [username, setUsername] = useState(null);

    useEffect(function () {
        async function getUsername() {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error('Brak użytkownika lub błąd:', userError);
                return;
            }

            const { data, error } = await supabase
                .from('users')
                .select('username')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Błąd podczas pobierania username:', error);
            } else {
                setUsername(data.username);
                document.title = 'User Panel - ' + data.username;
            }
            const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/png';
            link.href = '/logo.png';

            document.head.appendChild(link);
        }

        getUsername();
    }, []);

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
        <div>
            <h1>User Panel</h1>
            <p>Witaj w panelu użytkownika!</p>
        </div>
    );
}
