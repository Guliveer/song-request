import PropTypes from "prop-types";
import { AuthProvider } from '@/components/Items';
import { Box } from '@mui/material';
import {Google, GitHub, FacebookRounded as Facebook} from '@mui/icons-material';

export const availableProviders = [
    // {providerName: 'spotify', displayName: 'Spotify', icon: <Spotify />}, //! has some problems, idk why
    //? https://supabase.com/docs/guides/auth/social-login/auth-spotify?queryGroups=language&language=js&queryGroups=environment&environment=server

    {providerName: 'google', displayName: 'Google', icon: <Google />},
    {providerName: 'facebook', displayName: 'Facebook', icon: <Facebook />},
    {providerName: 'github', displayName: 'GitHub', icon: <GitHub />},
];

export default function AuthProvidersList({prompt}) {
    return (
        <Box display="flex" flexDirection="column" gap={2}>
            {availableProviders.map((provider) => (
                <AuthProvider
                    key={provider.providerName}
                    providerName={provider.providerName}
                    displayName={provider.displayName}
                    icon={provider.icon}
                    prompt={prompt}
                />
            ))}
        </Box>
    );
}

AuthProvidersList.propTypes = {
    prompt: PropTypes.string,
};

// Icons
export function Spotify() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height="21" width="23" fill="currentColor" viewBox="0 0 16 16">
            <path
                d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288"/>
        </svg>
    )
}
