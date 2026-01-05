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
