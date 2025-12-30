import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:9090/',
    realm: process.env.REACT_APP_KEYCLOAK_REALM || 'mini-project',
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'ecom-frontend',
};

// Handle "Default Export" issue for CRA/Webpack
const KeycloakConstructor = (Keycloak as any).default || Keycloak;
const keycloakInstance = new (KeycloakConstructor as any)(keycloakConfig);

export default keycloakInstance;