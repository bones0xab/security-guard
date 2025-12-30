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
