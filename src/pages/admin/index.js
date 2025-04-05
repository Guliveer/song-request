import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {isUserAdmin, isUserLoggedIn} from "@/utils/actions";

export default function AdminPanel() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(function () {
        document.title = 'Admin Panel - Song Request';
        const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = '/logo.png';

        document.head.appendChild(link);
    }, []);

    useEffect(function() {
        async function checkAdmin() {
            const checkLoggedIn = await isUserLoggedIn();

            if (!checkLoggedIn) {
                await router.replace("/404"); // Niezalogowany → 404
                return;
            }

            const checkAdmin = await isUserAdmin();

            if (!checkAdmin) {
                await router.replace("/404"); // Brak uprawnień → 404
                return;
            }

            setIsAdmin(true);
            setIsLoading(false);
        }

        checkAdmin();
    }, [router]);


    if (!isAdmin) return null;

    return (
        <div>
            <h1>Admin Panel</h1>
            <p>Tylko dla administratorów.</p>
        </div>
    );
}
