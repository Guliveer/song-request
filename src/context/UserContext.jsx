import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { isUserLoggedIn, isUserAdmin } from "@/utils/actions";
import {supabase} from "@/utils/supabase";
import PropTypes from "prop-types";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [uuid, setUuid] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    async function fetchUserData() {
        const loggedIn = await isUserLoggedIn();
        setIsLoggedIn(loggedIn);

        const admin = await isUserAdmin();
        setIsAdmin(admin);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUuid(user.id);
        }
    }

    useEffect(() => {
        fetchUserData();
    }, []);

    // Memorize the user state
    const userValue = useMemo(() => ({ isLoggedIn, isAdmin, uuid }), [isLoggedIn, isAdmin, uuid]);

    return (
        <UserContext.Provider value={userValue}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);

UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
}