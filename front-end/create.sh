#!/bin/bash

echo "🚀 Creating Create React App (CRA) + TypeScript + Tailwind project..."

# Étape 1: Créer le projet CRA avec TypeScript
echo "📦 Creating CRA project with TypeScript..."

# Naviguer dans le projet

# Étape 2: Installer les dépendances avec legacy-peer-deps
echo "📥 Installing dependencies..."
npm install axios react-router-dom keycloak-js @tanstack/react-query --legacy-peer-deps
npm install -D tailwindcss postcss autoprefixer --legacy-peer-deps
npm install lucide-react --legacy-peer-deps

# Initialiser Tailwind CSS
npx tailwindcss init -p

# Étape 3: Créer la structure des dossiers
echo "📁 Creating directory structure..."
mkdir -p src/{api,auth,components,pages,types}

# Étape 4: Configurer Tailwind
echo "⚙️ Configuring Tailwind CSS..."

# Mettre à jour tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Remplacer le contenu de src/index.css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
    @apply bg-gray-50;
}
EOF

# Étape 5: Créer le fichier .env
cat > .env << 'EOF'
# Gateway URL
REACT_APP_API_URL=http://localhost:8080/api

# Keycloak Configuration
REACT_APP_KEYCLOAK_URL=http://localhost:9090/
REACT_APP_KEYCLOAK_REALM=inventory-realm
REACT_APP_KEYCLOAK_CLIENT_ID=ecom-frontend
EOF

# Étape 6: Créer tous les fichiers de code

# Créer types/index.ts
cat > src/types/index.ts << 'EOF'
export type UserRole = 'ADMIN' | 'CLIENT';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: number;
    productId: number;
    quantity: number;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    roles: UserRole[];
}
EOF

# Créer auth/keycloak.ts
cat > src/auth/keycloak.ts << 'EOF'
import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:9090/',
    realm: process.env.REACT_APP_KEYCLOAK_REALM || 'inventory-realm',
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'ecom-frontend',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
EOF

# Créer auth/AuthProvider.tsx
cat > src/auth/AuthProvider.tsx << 'EOF'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

// Need to copy this file to public/ folder manually for silent SSO to work
const silentCheckSsoHtml = window.location.origin + '/silent-check-sso.html';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        keycloakInstance
            .init({
                onLoad: 'check-sso',
                silentCheckSsoRedirectUri: silentCheckSsoHtml,
                pkceMethod: 'S256',
            })
            .then((authenticated) => {
                setIsAuthenticated(authenticated);
                if (authenticated && keycloakInstance.tokenParsed) {
                    // Assuming roles are in realm_access. Adjust if using client roles.
                    const tokenRoles = keycloakInstance.tokenParsed.realm_access?.roles as UserRole[] || [];
                    setRoles(tokenRoles);
                }
                setIsInitialized(true);
            })
            .catch((err) => {
                console.error("Keycloak init failed", err);
                setIsInitialized(true);
            });
    }, []);

    const login = () => keycloakInstance.login();
    const logout = () => keycloakInstance.logout({ redirectUri: window.location.origin });

    if (!isInitialized) {
        return <div className="flex h-screen items-center justify-center text-xl">Loading Application...</div>;
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
EOF

# Créer api/axios.ts
cat > src/api/axios.ts << 'EOF'
import axios from 'axios';
import keycloak from '../auth/keycloak';

// Use the environment variable defined in .env
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const axiosInstance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: Add Token
axiosInstance.interceptors.request.use(async (config) => {
    if (keycloak.authenticated && keycloak.token) {
        try {
            // Refresh token if expired before sending request
            await keycloak.updateToken(30);
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        } catch (error) {
            keycloak.login();
        }
    }
    return config;
});

// Response Interceptor: Handle 401/403
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null;
        if (status === 401) {
             // Token expired or invalid session on backend
            keycloak.login();
        } else if (status === 403) {
            // Role Not Authorized
            window.location.href = "/unauthorized";
        }
        return Promise.reject(error);
    }
);
EOF

# Créer components/PrivateRoute.tsx
cat > src/components/PrivateRoute.tsx << 'EOF'
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { UserRole } from '../types';

interface PrivateRouteProps {
    requiredRoles?: UserRole[];
}

const PrivateRoute = ({ requiredRoles }: PrivateRouteProps) => {
    const { isAuthenticated, roles } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (requiredRoles && !requiredRoles.some(role => roles.includes(role))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
EOF

# Créer components/RoleGuard.tsx
cat > src/components/RoleGuard.tsx << 'EOF'
import { ReactNode } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { UserRole } from '../types';

interface RoleGuardProps {
    children: ReactNode;
    requiredRoles: UserRole[];
}

const RoleGuard = ({ children, requiredRoles }: RoleGuardProps) => {
    const { roles, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return null;
    }

    const hasRequiredRole = requiredRoles.some(role => roles.includes(role));

    return hasRequiredRole ? <>{children}</> : null;
};

export default RoleGuard;
EOF

# Créer components/NavBar.tsx
cat > src/components/NavBar.tsx << 'EOF'
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { ShoppingCart, Package, Settings, LogIn, LogOut, Home } from 'lucide-react';

const NavBar = () => {
    const { isAuthenticated, login, logout, roles, username } = useAuth();
    const isAdmin = roles.includes('ADMIN');

    return (
        <nav className="bg-white shadow-md p-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                <ShoppingCart className="w-8 h-8" /> E-Shop
            </Link>

            <div className="flex items-center gap-6">
                <Link to="/" className="hover:text-blue-600 font-medium flex items-center gap-1">
                    <Home size={18} /> Home
                </Link>
                <Link to="/catalog" className="hover:text-blue-600 font-medium">Catalog</Link>

                {isAuthenticated && (
                    <Link to="/orders" className="hover:text-blue-600 font-medium flex items-center gap-1">
                        <Package size={18} /> Orders
                    </Link>
                )}

                {isAdmin && (
                    <Link to="/admin" className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1">
                        <Settings size={18} /> Admin
                    </Link>
                )}

                <div className="border-l pl-6 flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <span className="text-sm text-gray-600">Welcome, <span className="font-semibold">{username}</span></span>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded hover:bg-gray-200 transition-colors"
                            >
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={login}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            <LogIn size={18} /> Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
EOF

# Créer pages/HomePage.tsx
cat > src/pages/HomePage.tsx << 'EOF'
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { ShoppingBag, Shield, Zap, Globe } from 'lucide-react';

const HomePage = () => {
    const { isAuthenticated, username } = useAuth();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-4xl">
                <h1 className="text-6xl font-extrabold text-blue-900 mb-6">
                    Welcome to <span className="text-blue-600">MicroStore</span>
                </h1>

                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                    A demonstration of a secure microservices e-commerce architecture
                    using Spring Boot, Keycloak, and React.
                </p>

                {!isAuthenticated ? (
                    <div className="mb-12">
                        <p className="text-lg text-gray-700 mb-6">
                            Experience secure shopping with enterprise-grade authentication and authorization.
                        </p>
                        <Link
                            to="/catalog"
                            className="inline-block bg-blue-600 text-white px-10 py-4 rounded-full text-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            Browse Catalog
                        </Link>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-12">
                        <h2 className="text-3xl font-bold text-green-800 mb-4">
                            Welcome back, {username}!
                        </h2>
                        <p className="text-lg text-green-700 mb-6">
                            You're now ready to explore our catalog and manage your orders.
                        </p>
                        <div className="flex justify-center gap-6">
                            <Link
                                to="/catalog"
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Browse Products
                            </Link>
                            <Link
                                to="/orders"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                            >
                                View Orders
                            </Link>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                            <Shield className="w-7 h-7 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Secure Authentication</h3>
                        <p className="text-gray-600">Protected by Keycloak with OAuth2/OIDC and JWT tokens</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                            <Zap className="w-7 h-7 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Microservices</h3>
                        <p className="text-gray-600">Built with Spring Boot microservices architecture</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag className="w-7 h-7 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Modern UI</h3>
                        <p className="text-gray-600">React with TypeScript and Tailwind CSS</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                            <Globe className="w-7 h-7 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">API Gateway</h3>
                        <p className="text-gray-600">Spring Cloud Gateway for unified API access</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
EOF

# Créer pages/CatalogPage.tsx
cat > src/pages/CatalogPage.tsx << 'EOF'
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { Product } from '../types';
import { Loader2, ShoppingCart, Star } from 'lucide-react';

const CatalogPage = () => {
    // GET http://localhost:8080/api/products
    const { data: products, isLoading, isError } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await axiosInstance.get<Product[]>('/products');
            return res.data;
        }
    });

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    if (isError) return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Catalog</h2>
                <p className="text-red-600">Unable to fetch products. Please check if the Gateway is running.</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">Product Catalog</h1>
                <p className="text-gray-600 text-lg">Discover our collection of premium products</p>
            </div>

            {products?.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                    <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Products Available</h3>
                    <p className="text-gray-500">Check back later for new products.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products?.map(product => (
                        <div key={product.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100">
                            <div className="h-56 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <ShoppingCart className="w-16 h-16 mx-auto mb-2 text-gray-300" />
                                    <span className="text-sm font-medium">Product Image</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <h2 className="text-xl font-bold text-gray-800 truncate">{product.name}</h2>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                        In Stock
                                    </span>
                                </div>

                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-500">(24 reviews)</span>
                                </div>

                                <p className="text-gray-600 text-sm mb-5 line-clamp-2">{product.description}</p>

                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
                                        <span className="text-sm text-gray-500 ml-2">
                                            {product.quantity} available
                                        </span>
                                    </div>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors">
                                        <ShoppingCart size={18} />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CatalogPage;
EOF

# Créer pages/AdminPage.tsx
cat > src/pages/AdminPage.tsx << 'EOF'
import { ShieldAlert, Plus, Edit, Trash2, Users, Package, DollarSign, BarChart } from 'lucide-react';

const AdminPage = () => {
    // Mock data for demonstration
    const products = [
        { id: 101, name: 'Premium Laptop', price: 1299.99, quantity: 42 },
        { id: 102, name: 'Wireless Headphones', price: 199.99, quantity: 87 },
        { id: 103, name: 'Smartphone', price: 899.99, quantity: 23 },
        { id: 104, name: 'Tablet', price: 499.99, quantity: 56 },
    ];

    const stats = [
        { title: 'Total Revenue', value: '$42,580', icon: DollarSign, color: 'bg-green-500' },
        { title: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-500' },
        { title: 'Active Users', value: '1,248', icon: Users, color: 'bg-purple-500' },
        { title: 'Growth Rate', value: '+12.5%', icon: BarChart, color: 'bg-orange-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-r-lg flex items-start gap-4">
                <ShieldAlert className="text-red-600 flex-shrink-0" size={32} />
                <div>
                    <h1 className="text-2xl font-bold text-red-800 mb-2">Admin Dashboard</h1>
                    <p className="text-red-700">
                        Secure Area: Only users with 'ADMIN' role can access this page.
                        All actions are logged and monitored.
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">{stat.title}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Product Management */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Product Management</h2>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
                        <Plus size={18} /> Add New Product
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <span className="text-gray-900 font-medium">#{product.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900 font-medium">{product.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-blue-600">${product.price.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            product.quantity > 20 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {product.quantity} units
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3">
                                            <button className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors">
                                                <Edit size={18} />
                                            </button>
                                            <button className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Admin Tools */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Admin Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="bg-white hover:bg-gray-50 p-5 rounded-xl border border-gray-200 text-left transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="font-semibold text-gray-900">User Management</div>
                        </div>
                        <div className="text-sm text-gray-500">Manage users, roles, and permissions</div>
                    </button>

                    <button className="bg-white hover:bg-gray-50 p-5 rounded-xl border border-gray-200 text-left transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="font-semibold text-gray-900">Order Analytics</div>
                        </div>
                        <div className="text-sm text-gray-500">View sales reports and analytics</div>
                    </button>

                    <button className="bg-white hover:bg-gray-50 p-5 rounded-xl border border-gray-200 text-left transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <Settings className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="font-semibold text-gray-900">System Settings</div>
                        </div>
                        <div className="text-sm text-gray-500">Configure platform settings</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
EOF

# Créer pages/UnauthorizedPage.tsx
cat > src/pages/UnauthorizedPage.tsx << 'EOF'
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-2xl">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
                        <ShieldX className="w-12 h-12 text-red-600" />
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <h2 className="text-2xl font-semibold text-red-600 mb-6">Error 403 - Unauthorized Access</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        You don't have permission to access this page. This area requires special privileges or roles.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 mb-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Possible Reasons:</h3>
                    <ul className="text-left text-gray-600 space-y-3">
                        <li className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                            Your account doesn't have the required role (e.g., ADMIN)
                        </li>
                        <li className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                            Your session may have expired or token is invalid
                        </li>
                        <li className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                            You're trying to access a resource that belongs to another user
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Go to Homepage
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Go Back
                    </button>
                </div>

                <p className="mt-8 text-gray-500">
                    If you believe this is an error, please contact the system administrator.
                </p>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
EOF

# Créer App.tsx
cat > src/App.tsx << 'EOF'
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthProvider';
import NavBar from './components/NavBar';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import AdminPage from './pages/AdminPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <div className="min-h-screen flex flex-col">
                    <NavBar />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/catalog" element={<CatalogPage />} />
                            <Route path="/unauthorized" element={<UnauthorizedPage />} />

                            {/* Protected Route: Needs Login only */}
                            <Route element={<PrivateRoute />}>
                                {/* Add <Route path="/orders" element={<OrdersPage />} /> here later */}
                            </Route>

                            {/* Protected Route: Needs ADMIN role */}
                            <Route element={<PrivateRoute requiredRoles={['ADMIN']} />}>
                                <Route path="/admin" element={<AdminPage />} />
                            </Route>

                            {/* 404 Route */}
                            <Route path="*" element={
                                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                                    <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                                </div>
                            } />
                        </Routes>
                    </main>

                    <footer className="bg-gray-800 text-white p-6 mt-12">
                        <div className="max-w-7xl mx-auto text-center">
                            <p className="text-gray-300">© 2024 MicroStore. Demo application for educational purposes.</p>
                            <p className="text-gray-400 text-sm mt-2">
                                Built with React, TypeScript, Tailwind CSS, and secured with Keycloak.
                            </p>
                        </div>
                    </footer>
                </div>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
EOF

# Créer silent-check-sso.html dans public
cat > public/silent-check-sso.html << 'EOF'
<!DOCTYPE html>
<html>
  <head>
    <title>Silent Check SSO</title>
    <meta charset="utf-8" />
  </head>
  <body>
    <script>
      // This page is used by Keycloak for silent authentication
      // It should remain as simple as possible
      window.addEventListener('DOMContentLoaded', function() {
        var parent = window.parent;
        if (parent && parent.postMessage) {
          parent.postMessage(location.href, location.origin);
        }
      });
    </script>
    <noscript>
      <p>
        <strong>Note:</strong> Your browser does not support JavaScript or it is disabled.
        Silent authentication requires JavaScript to be enabled.
      </p>
    </noscript>
  </body>
</html>
EOF

# Étape 7: Mettre à jour index.tsx
cat > src/index.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthProvider';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  // StrictMode is off temporarily to prevent double Keycloak init in dev
  // <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  // </React.StrictMode>
);
EOF

# Supprimer les fichiers par défaut inutiles
echo "🧹 Cleaning up default files..."
rm -f src/App.css
rm -f src/App.test.tsx
rm -f src/logo.svg
rm -f src/reportWebVitals.ts
rm -f src/setupTests.ts

# Étape 8: Créer package.json avec scripts mis à jour (optionnel)
echo "📝 Updating package.json scripts..."

# Le package.json est déjà créé par CRA, mais nous pouvons ajouter des scripts personnalisés
# Pas nécessaire car CRA a déjà les scripts standard

echo ""
echo "✅ Project created successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Ensure Docker containers are running:"
echo "   - Keycloak: http://localhost:9090"
echo "   - Gateway: http://localhost:8080"
echo "2. Configure Keycloak client 'ecom-frontend' with:"
echo "   - Web Origins: http://localhost:3000"
echo "   - Valid Redirect URIs: http://localhost:3000/*"
echo "3. Start the application:"
echo "   npm start"
echo ""
echo "📋 The app will run at: http://localhost:3000"