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
