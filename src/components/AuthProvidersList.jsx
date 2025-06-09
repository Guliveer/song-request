import PropTypes from "prop-types";
import { AuthProviderButton } from '@/components/Items';
import { Box } from '@mui/material';
import { authProviders } from '@/utils/authProviders';

export default function AuthProvidersList({prompt}) {
    return (
        <Box display="flex" flexDirection="column" gap={2}>
            {authProviders.map((provider) => (
                <AuthProviderButton
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
