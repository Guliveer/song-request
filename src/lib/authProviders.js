import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpotify, faGoogle, faFacebook, faGithub } from '@fortawesome/free-brands-svg-icons'

export const authProviders = [
    { providerName: 'spotify', displayName: 'Spotify', icon: <FontAwesomeIcon icon={faSpotify} /> },
    { providerName: 'google', displayName: 'Google', icon: <FontAwesomeIcon icon={faGoogle} /> },
    { providerName: 'facebook', displayName: 'Facebook', icon: <FontAwesomeIcon icon={faFacebook} /> },
    { providerName: 'github', displayName: 'GitHub', icon: <FontAwesomeIcon icon={faGithub} /> },
];
