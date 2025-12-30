import {ShieldAlert, Plus, Edit, Trash2, Users, Package, DollarSign, BarChart, Settings} from 'lucide-react';

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
