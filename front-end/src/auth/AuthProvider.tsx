import React, {createContext, useContext, useEffect, useState, ReactNode, useRef} from 'react';
import keycloakInstance from './keycloak';
import { UserRole } from '../types';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | undefined;
    roles: UserRole[];
    login: () => void;
    logout: () => void;
    username?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const isRun = useRef(false); // Verrou de sécurité
    const [isInitialized, setInitialized] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [roles, setRoles] = useState<UserRole[]>([]);

    useEffect(() => {
        // 1. Protection React Strict Mode (Double mount)
        if (isRun.current) return;
        isRun.current = true;

        keycloakInstance
            .init({
                onLoad: 'check-sso',
                checkLoginIframe: false,
                pkceMethod: 'S256'
            })
            .then((authenticated: boolean) => {
                // Cas nominal : Succès
                handleAuthSuccess(authenticated);
            })
            .catch((err:any) => {
                // 2. Protection HMR (Hot Module Replacement)
                // Si Keycloak dit "déjà initialisé", on considère que c'est un SUCCÈS
                const errorStr = JSON.stringify(err);
                if (errorStr.includes("initialized once") || (err?.message && err.message.includes("initialized once"))) {
                    console.warn("Keycloak déjà initialisé (rechargement détecté), récupération de l'état...");
                    // On force le succès car l'instance est déjà prête
                    handleAuthSuccess(keycloakInstance.authenticated || false);
                } else {
                    // Vraie erreur
                    console.error("Erreur critique Keycloak:", err);
                    setInitialized(true);
                }
            });

        // Fonction helper pour éviter de dupliquer le code dans le then et le catch
        function handleAuthSuccess(authenticated: boolean) {
            setIsAuthenticated(authenticated);
            if (authenticated && keycloakInstance.tokenParsed) {
                setRoles((keycloakInstance.tokenParsed.realm_access?.roles as UserRole[]) || []);
            }
            setInitialized(true);
        }

    }, []);
    // BLOCKING UI: This is required to stop the "undefined login" crash
    if (!isInitialized) {
        return <div className="h-screen flex items-center justify-center text-blue-600">Loading...</div>;
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                token: keycloakInstance.token,
                roles,
                login: () => keycloakInstance.login(),
                logout: () => keycloakInstance.logout({ redirectUri: window.location.origin }),
                username: keycloakInstance.tokenParsed?.preferred_username,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};