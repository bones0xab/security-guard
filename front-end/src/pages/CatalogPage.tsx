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
