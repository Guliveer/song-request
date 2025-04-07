import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {isUserAdmin, isUserLoggedIn} from "@/utils/actions";
import SetTitle from "@/components/SetTitle";

export default function AdminPanel() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

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
        <>
        <SetTitle text={"Admin Panel"} />
        <div>
            <h1>Admin Panel</h1>
            <p>Tylko dla administratorów.</p>
        </div>
        </>
    );
}
