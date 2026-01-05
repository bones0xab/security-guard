import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url:  'http://localhost:9090/',
    realm:  'mini-project',
    clientId: 'ecom-frontend',
};

const keycloakInstance = new (Keycloak as any)(keycloakConfig);

export default keycloakInstance;
