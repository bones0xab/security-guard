import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthProvider';
import NavBar from './components/NavBar';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import AdminPage from './pages/AdminPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import OrdersPage from "./pages/OrdersPage";

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
                            <Route path="/orders" element={<OrdersPage />} />
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
