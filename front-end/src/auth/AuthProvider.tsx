import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const isRun = useRef(false);

    useEffect(() => {
        if (isRun.current) return;
        isRun.current = true;

        // Check if already initialized (Hot Reload fix)
        if (keycloakInstance.authenticated !== undefined) {
            setIsAuthenticated(keycloakInstance.authenticated);
            if (keycloakInstance.authenticated && keycloakInstance.tokenParsed) {
                const tokenRoles = keycloakInstance.tokenParsed.realm_access?.roles as UserRole[] || [];
                setRoles(tokenRoles);
            }
            setIsInitialized(true);
            return;
        }

        keycloakInstance
            .init({
                onLoad: 'check-sso',
                checkLoginIframe: false,
                pkceMethod: 'S256',
            })
            .then((authenticated: boolean) => {
                setIsAuthenticated(authenticated);
                if (authenticated && keycloakInstance.tokenParsed) {
                    const tokenRoles = keycloakInstance.tokenParsed.realm_access?.roles as UserRole[] || [];
                    setRoles(tokenRoles);
                }
                setIsInitialized(true);
            })
            .catch((err: any) => {
                console.error("Keycloak init failed", err);
                setIsInitialized(true); // Stop loading even if it fails
            });
    }, []);

    const login = () => keycloakInstance.login().catch(console.error);
    const logout = () => keycloakInstance.logout({ redirectUri: window.location.origin });

    // 🛑 BLOCKING UI: Do not render children until Keycloak is ready
    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-semibold">Connecting to Security Server...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            token: keycloakInstance.token,
            roles,
            login,
            logout,
            username: keycloakInstance.tokenParsed?.preferred_username
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};