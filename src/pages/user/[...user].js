import UserProfile from "@/components/User_Panel/UserProfile";
import {supabase} from "@/lib/supabase";

export async function getServerSideProps(context) {
    const targetUser = context.params.user[0]; // Extract the first segment of the catch-all route

    // Query the database to find the targetUser by UUID
    const { data: userDataByUuid, error: uuidError } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUser)
        .single();

    const { data: userDataByName, error: nameError } = await supabase
        .from('users')
        .select('*')
        .eq('username', targetUser)
        .single();

    if (uuidError && nameError) {
        console.error('Supabase error:', uuidError.message || nameError.message);
        return {
            notFound: true, // Return 404 if no user found
        };
    }

    const userData = userDataByUuid || userDataByName;
    if (!userData) {
        return {
            notFound: true, // Return 404 if targetUser is not found
        };
    }

    return {
        props: {
            userData: userData,
        },
    };
}


export default function UserPage({ userData }) {
    return (
        <UserProfile userData={userData} />
    );
}
