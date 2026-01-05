import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { Order } from '../types';
import { Loader2, X, Package, DollarSign } from 'lucide-react';

interface Props {
    orderId: number;
    onClose: () => void;
}

const OrderDetailsModal = ({ orderId, onClose }: Props) => {
    // GET /api/orders/{id}
    const { data: order, isLoading } = useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const res = await axiosInstance.get<Order>(`/orders/${orderId}`);
            return res.data;
        }
    });

    if (!orderId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Package className="text-blue-600" />
                        Détails Commande #{orderId}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : order ? (
                        <>
                            {/* Infos générales */}
                            <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-xl">
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(order.date_commande).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Client</p>
                                    <p className="font-medium text-gray-900">{order.customerId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Statut</p>
                                    <span className="font-bold text-blue-600">{order.statut}</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="font-bold text-xl text-green-600">
                                        {order.montant_total.toFixed(2)} €
                                    </p>
                                </div>
                            </div>

                            {/* Liste des produits */}
                            <h4 className="font-semibold text-gray-700 mb-3">Produits achetés</h4>
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-600 text-sm">
                                    <tr>
                                        <th className="p-3">Produit ID</th>
                                        <th className="p-3 text-right">Prix Unitaire</th>
                                        <th className="p-3 text-right">Quantité</th>
                                        <th className="p-3 text-right">Sous-total</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                    {order.orderItemsList?.map((item) => (
                                        <tr key={item.id}>
                                            <td className="p-3 font-medium text-gray-900">#{item.productId}</td>
                                            <td className="p-3 text-right text-gray-500">{item.price.toFixed(2)} €</td>
                                            <td className="p-3 text-right font-medium">x {item.quantity}</td>
                                            <td className="p-3 text-right font-bold text-gray-900">
                                                {(item.price * item.quantity).toFixed(2)} €
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-red-500">Commande introuvable.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;