import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';
import { Loader2, Plus, Edit, Trash2, X, Save, ShoppingCart, Package } from 'lucide-react';

// --- TYPES ---
interface Product {
    id: number;
    name: string;
    price: number;
    // Add other fields if needed
}

interface OrderItem {
    productId: number;
    quantity: number;
    price: number;
    productName?: string; // Optional helper for display
}

interface Order {
    id?: number;
    customerId: number;
    statut: string;
    montant_total: number;
    orderItemsList: OrderItem[];
}

// --- MAIN PAGE COMPONENT ---
const OrdersPage = () => {
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    // 1. FETCH ORDERS
    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await axiosInstance.get<Order[]>('/orders');
            return res.data;
        }
    });

    // 2. FETCH PRODUCTS (To show in the dropdown)
    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await axiosInstance.get<Product[]>('/products');
            return res.data;
        }
    });

    // 3. SAVE ORDER (Create or Update)
    const saveMutation = useMutation({
        mutationFn: async (order: Order) => {
            if (order.id) {
                return await axiosInstance.put(`/orders/${order.id}`, order);
            } else {
                return await axiosInstance.post('/orders', order);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            closeModal();
        },
        onError: (err) => alert('Error saving order: ' + err)
    });

    // 4. DELETE ORDER
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await axiosInstance.delete(`/orders/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] })
    });

    // Handlers
    const openCreateModal = () => {
        setEditingOrder(null);
        setIsModalOpen(true);
    };

    const openEditModal = (order: Order) => {
        setEditingOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingOrder(null);
    };

    if (ordersLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline"/> Loading...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ShoppingCart className="text-blue-600" />
                    Orders Management
                </h1>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
                >
                    <Plus size={20} /> New Order
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="p-4 font-semibold text-gray-600">ID</th>
                        <th className="p-4 font-semibold text-gray-600">Customer</th>
                        <th className="p-4 font-semibold text-gray-600">Status</th>
                        <th className="p-4 font-semibold text-gray-600">Total</th>
                        <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {orders?.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                            <td className="p-4 font-medium">#{order.id}</td>
                            <td className="p-4">{order.customerId}</td>
                            <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                        ${order.statut === 'CREATED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {order.statut}
                                    </span>
                            </td>
                            <td className="p-4 font-bold">{order.montant_total?.toFixed(2)} €</td>
                            <td className="p-4 flex justify-end gap-2">
                                <button onClick={() => openEditModal(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => deleteMutation.mutate(order.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pass products to the modal */}
            {isModalOpen && (
                <OrderFormModal
                    initialData={editingOrder}
                    availableProducts={products || []}
                    onClose={closeModal}
                    onSave={(data) => saveMutation.mutate(data)}
                />
            )}
        </div>
    );
};

// --- MODAL COMPONENT (With Product Selection) ---
const OrderFormModal = ({ initialData, availableProducts, onClose, onSave }: {
    initialData: Order | null,
    availableProducts: Product[],
    onClose: () => void,
    onSave: (order: Order) => void
}) => {
    const [customerId, setCustomerId] = useState(initialData?.customerId || 0);
    const [statut, setStatut] = useState(initialData?.statut || 'CREATED');
    const [items, setItems] = useState<OrderItem[]>(initialData?.orderItemsList || []);

    // Add empty item
    const addItem = () => setItems([...items, { productId: 0, quantity: 1, price: 0 }]);

    // Remove item
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    // Handle Product Selection
    const handleProductChange = (index: number, productId: number) => {
        const product = availableProducts.find(p => p.id === productId);
        const newItems = [...items];

        // Auto-fill price when product is selected
        newItems[index] = {
            ...newItems[index],
            productId: productId,
            price: product ? product.price : 0
        };
        setItems(newItems);
    };

    const handleQuantityChange = (index: number, qty: number) => {
        const newItems = [...items];
        newItems[index].quantity = qty;
        setItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        onSave({
            id: initialData?.id,
            customerId,
            statut,
            montant_total: total,
            orderItemsList: items
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-bold">{initialData ? 'Edit Order' : 'New Order'}</h3>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-gray-600" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Customer & Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                            <input type="number" className="w-full border rounded-lg p-2"
                                   value={customerId} onChange={e => setCustomerId(Number(e.target.value))} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select className="w-full border rounded-lg p-2 bg-white"
                                    value={statut} onChange={e => setStatut(e.target.value)}>
                                <option value="CREATED">Created</option>
                                <option value="VALIDATED">Validated</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELED">Canceled</option>
                            </select>
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-700">Items</h4>
                            <button type="button" onClick={addItem} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                                <Plus size={16}/> Add Item
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-end bg-white p-2 rounded shadow-sm border">
                                    {/* Product Selector */}
                                    <div className="flex-[2]">
                                        <p className="text-xs text-gray-500 mb-1">Product</p>
                                        <select
                                            className="w-full border rounded p-2 text-sm bg-white"
                                            value={item.productId}
                                            onChange={(e) => handleProductChange(index, Number(e.target.value))}
                                            required
                                        >
                                            <option value={0}>Select Product...</option>
                                            {availableProducts.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} ({p.price}€)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Quantity */}
                                    <div className="w-20">
                                        <p className="text-xs text-gray-500 mb-1">Qty</p>
                                        <input type="number" min="1" className="w-full border rounded p-2 text-sm"
                                               value={item.quantity}
                                               onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                                        />
                                    </div>

                                    {/* Price Read-only */}
                                    <div className="w-24">
                                        <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                                        <div className="p-2 text-sm font-bold text-gray-700 bg-gray-100 rounded text-right">
                                            {(item.price * item.quantity).toFixed(2)}€
                                        </div>
                                    </div>

                                    <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 p-2">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {items.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No items yet.</p>}
                        </div>

                        {/* Grand Total */}
                        <div className="mt-4 text-right">
                            <span className="text-gray-600 mr-2">Total Estimate:</span>
                            <span className="text-xl font-bold text-blue-600">
                                {items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} €
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <Save size={18} /> Save Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrdersPage;