import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { Product } from '../types';
import { Loader2, X, ShoppingCart, Package, Tag, Info } from 'lucide-react';

interface ProductDetailsModalProps {
    productId: number | null;
    onClose: () => void;
}

const ProductDetailsModal = ({ productId, onClose }: ProductDetailsModalProps) => {
    // Appel API spécifique : GET /api/products/{id}
    const { data: product, isLoading, isError } = useQuery({
        queryKey: ['product', productId],
        queryFn: async () => {
            const res = await axiosInstance.get<Product>(`/products/${productId}`);
            return res.data;
        },
        enabled: !!productId, // Ne lance la requête que si un ID est présent
    });

    if (!productId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in duration-200">

                {/* Bouton Fermer */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full text-gray-500 hover:text-gray-800 transition-all z-10"
                >
                    <X size={24} />
                </button>

                {isLoading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                        <p className="text-gray-500 text-sm">Chargement des détails...</p>
                    </div>
                ) : isError ? (
                    <div className="p-8 text-center">
                        <div className="text-red-500 text-xl font-bold mb-2">Erreur</div>
                        <p className="text-gray-600">Impossible de charger ce produit.</p>
                        <button onClick={onClose} className="mt-4 text-blue-600 hover:underline">Fermer</button>
                    </div>
                ) : product && (
                    <>
                        {/* Header avec Image Placeholder */}
                        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                            <ShoppingCart size={64} className="opacity-50" />
                        </div>

                        {/* Contenu */}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                                <span className="text-2xl font-bold text-blue-600">
                                    ${product.price.toFixed(2)}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {/* Description */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                                        <Info size={18} /> Description
                                    </div>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {product.description}
                                    </p>
                                </div>

                                {/* Stock Info */}
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
                                        <Package className="text-blue-600" size={24} />
                                        <div>
                                            <p className="text-xs text-blue-600 font-bold uppercase">Stock</p>
                                            <p className="text-gray-800 font-medium">{product.quantity} unités</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-purple-50 p-3 rounded-xl border border-purple-100 flex items-center gap-3">
                                        <Tag className="text-purple-600" size={24} />
                                        <div>
                                            <p className="text-xs text-purple-600 font-bold uppercase">ID Produit</p>
                                            <p className="text-gray-800 font-medium">#{product.id}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions du bas */}
                            <div className="mt-8">
                                <button
                                    onClick={onClose}
                                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-black transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductDetailsModal;