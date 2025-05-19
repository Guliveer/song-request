import { isUserLoggedIn, getUserInfo, isFollowingUser } from "@/utils/actions";
import UserProfile from "@/components/User_Panel/UserProfile";

export async function getServerSideProps(context) {
    const { user: targetUser } = context.params; // Get the targetUser parameter from the URL

    // Get the currently logged-in user
    if (await isUserLoggedIn()) {
        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    }

    // Query the database to find the targetUser by UUID
    const userData = await getUserInfo(targetUser);

    if (!userData) {
        return {
            notFound: true, // Return 404 if targetUser is not found
        };
    }

    const isFollowing = await isFollowingUser(targetUser);

    return {
        props: {
            userData: userData,
            isFollowing: isFollowing,
        },
    };
}


export default function UserPage({ userData }) {
    return (
        <UserProfile userData={userData} />
    );
}
