import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { isUserLoggedIn, isUserAdmin } from "@/utils/actions";
import PropTypes from "prop-types";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function fetchUserData() {
            const loggedIn = await isUserLoggedIn();
            const admin = await isUserAdmin();
            setIsLoggedIn(loggedIn);
            setIsAdmin(admin);
        }
        fetchUserData();
    }, []);

    // Memorize the user state
    const userValue = useMemo(() => ({ isLoggedIn, isAdmin }), [isLoggedIn, isAdmin]);

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