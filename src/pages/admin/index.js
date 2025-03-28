import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase";

export default function AdminPanel() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(function() {
        async function checkAdmin() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.replace("/404"); // Niezalogowany → 404
                return;
            }

            const { data, error } = await supabase
                .from("users")
                .select("admin")
                .eq("id", user.id)
                .single();

            if (error || !data?.admin) {
                router.replace("/404"); // Brak uprawnień → 404
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
