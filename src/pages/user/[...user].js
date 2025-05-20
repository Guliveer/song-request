import { getUserInfo } from "@/utils/actions";
import UserProfile from "@/components/User_Panel/UserProfile";

export async function getServerSideProps(context) {
    const targetUser = context.params.user[0]; // Extract the first segment of the catch-all route

    // Query the database to find the targetUser by UUID
    const userData = await getUserInfo(targetUser);

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
