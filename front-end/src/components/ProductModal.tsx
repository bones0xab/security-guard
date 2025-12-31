import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { Product } from '../types';
import { Loader2, X, Save } from 'lucide-react';


interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    productToEdit?: Product | null; // Si null = Mode Création, Sinon = Mode Modification
}

const ProductModal = ({ isOpen, onClose, productToEdit }: ProductModalProps) => {
    const queryClient = useQueryClient();

    // État du formulaire
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        quantity: 0
    });

    // Remplir le formulaire si on est en mode édition
    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name,
                description: productToEdit.description,
                price: productToEdit.price,
                quantity: productToEdit.quantity
            });
        } else {
            // Réinitialiser si mode création
            setFormData({ name: '', description: '', price: 0, quantity: 0 });
        }
    }, [productToEdit, isOpen]);

    // Mutation pour CRÉER
    const createMutation = useMutation({
        mutationFn: async (newProduct: any) => {
            // Backend: POST /api/products
            return await axiosInstance.post('/products', newProduct);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            onClose();
        }
    });

    // Mutation pour MODIFIER
    const updateMutation = useMutation({
        mutationFn: async (data: { id: number; product: any }) => {
            // Backend: PUT /api/products/{id}
            return await axiosInstance.put(`/products/${data.id}`, data.product);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            onClose();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (productToEdit) {
            updateMutation.mutate({ id: productToEdit.id, product: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-800">
            {productToEdit ? 'Edit Product' : 'New Product'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
    <X size={24} />
    </button>
    </div>

    <form onSubmit={handleSubmit} className="p-6 space-y-4">
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
    type="text"
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
    value={formData.name}
    onChange={e => setFormData({ ...formData, name: e.target.value })}
    />
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
        <input
    type="number"
    step="0.01"
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
    value={formData.price}
    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
    />
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
        <input
    type="number"
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
    value={formData.quantity}
    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
    />
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
    value={formData.description}
    onChange={e => setFormData({ ...formData, description: e.target.value })}
    />
    </div>

    <div className="flex gap-3 pt-4">
    <button
        type="button"
    onClick={onClose}
    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
        >
        Cancel
        </button>
        <button
    type="submit"
    disabled={isLoading}
    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
        >
        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
    {productToEdit ? 'Update' : 'Create'}
    </button>
    </div>
    </form>
    </div>
    </div>
);
};

export default ProductModal;