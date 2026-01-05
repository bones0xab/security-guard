import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { Product } from '../types';
import { Loader2, ShoppingCart, Star, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider' // Assurez-vous que le chemin est correct
import ProductModal from '../components/ProductModal'; // Import du modal créé ci-dessus
import { Eye } from 'lucide-react';
import ProductDetailsModal from '../components/ProductDetailsModal';
const CatalogPage = () => {
    const queryClient = useQueryClient();
    const { roles } = useAuth();

    // Vérification simple du rôle Admin
    const isAdmin = roles.includes('ADMIN');
    const [viewId, setViewId] = useState<number | null>(null);

    // États pour gérer le Modal
    const [isModalOpen, setModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);

    // 1. READ (GET)
    const { data: products, isLoading, isError } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await axiosInstance.get<Product[]>('/products');
            return res.data;
        }
    });

    // 2. DELETE (Mutation)
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            // Backend: DELETE /api/products/{id}
            await axiosInstance.delete(`/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (err) => {
            alert("Failed to delete product. Only Admins can do this.");
            console.error(err);
        }
    });

    // Handlers
    const handleAddNew = () => {
        setProductToEdit(null); // Mode création
        setModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setProductToEdit(product); // Mode édition
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    if (isError) return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Catalog</h2>
                <p className="text-red-600">Unable to fetch products. Check Gateway/Auth.</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header avec Bouton Ajouter (Visible uniquement pour ADMIN) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Product Catalog</h1>
                    <p className="text-gray-600 text-lg">Discover our collection of premium products</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleAddNew}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                    >
                        <Plus size={20} />
                        Add Product
                    </button>
                )}
            </div>

            {/* Grille de Produits */}
            {products?.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Products Available</h3>
                    <p className="text-gray-500">Check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products?.map(product => (
                        <div key={product.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 group relative">

                            <button
                                onClick={() => setViewId(product.id)}
                                className="p-2 bg-white/90 text-gray-700 rounded-full shadow-md hover:bg-gray-100 transition-colors backdrop-blur-sm"
                                title="Voir les détails"
                            >
                                <Eye size={18} />
                            </button>
                            {/* Actions ADMIN (Edit/Delete) flottant sur l'image */}
                            {isAdmin && (
                                <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="p-2 bg-white text-blue-600 rounded-full shadow-md hover:bg-blue-50 transition-colors"
                                        title="Edit"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 bg-white text-red-600 rounded-full shadow-md hover:bg-red-50 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}

                            <div className="h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 relative">
                                <ShoppingCart className="w-16 h-16 text-gray-300" />
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <h2 className="text-xl font-bold text-gray-800 truncate flex-1">{product.name}</h2>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>

                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-500">(Reviews)</span>
                                </div>

                                <p className="text-gray-600 text-sm mb-5 line-clamp-2 h-10">{product.description}</p>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                    <div>
                                        <span className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
                                        <span className="block text-xs text-gray-400 mt-1">
                                            {product.quantity} units left
                                        </span>
                                    </div>
                                    <button className="bg-gray-900 hover:bg-black text-white p-3 rounded-lg transition-colors">
                                        <ShoppingCart size={20} />
                                    </button>
                                </div>
                            </div>
                            <ProductDetailsModal
                                productId={viewId}
                                onClose={() => setViewId(null)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Intégration du Modal */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                productToEdit={productToEdit}
            />
        </div>
    );
};

export default CatalogPage;