import React, {useEffect, useState} from "react";
import {Refund, Status} from "../types";
import {axiosInstance} from "../api/axios";
import {useAuth} from "../auth/AuthProvider";

// Modal Update
const UpdateModal = ({
                         isOpen,
                         onClose,
                         refund,
                         onUpdate
                     }: {
    isOpen: boolean;
    onClose: () => void;
    refund: Refund;
    onUpdate: (updated: Refund) => void;
}) => {
    const [form, setForm] = useState<Refund>({ id: 0, orderId: 0, clientId: 0, reason: "", status: Status.PENDING });

    // 🔥 FIX : sync form avec refund quand il change
    useEffect(() => {
        if (isOpen && refund) {
            setForm(refund); // Pré-remplit TOUS les champs
        }
    }, [refund, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(form);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Update Refund #{refund.id}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ID affiché en read-only */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                        <input
                            type="number"
                            value={form.id}
                            readOnly
                            className="w-full p-2 border border-gray-400 bg-gray-100 rounded text-sm"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={Status.PENDING}>PENDING</option>
                            <option value={Status.APPROVED}>APPROVED</option>
                            <option value={Status.REJECTED}>REJECTED</option>
                            <option value={Status.COMPLETED}>COMPLETED</option>
                        </select>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <textarea
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 resize-y"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition-colors"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Dialog Delete
const DeleteDialog = ({
                          isOpen,
                          onClose,
                          onDelete
                      }: {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this refund? This action cannot be undone.</p>
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};



const RefundPage = () => {
    const [form, setForm] = useState<Refund>({
        id : 0,
        orderId: 0,
        clientId: 0,
        reason: "",
        status : Status.PENDING
    });

    const [selected, setSelect] = useState<Status>(Status.PENDING);

    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingRefund, setEditingRefund] = useState<Refund | null>(null);
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

    const { roles } = useAuth();
    const isAdmin = roles.includes("ADMIN");

    // Charger les refunds pour l'admin
    useEffect(() => {
        if (!isAdmin) return;

        const fetchData = async () => {
            try {
                const response = await axiosInstance.get<Refund[]>("/orders/refunds");
                setRefunds(response.data);
            } catch (err) {
                console.error("Error fetching refund data", err);
                setError("Error loading refunds");
            }
        };

        fetchData();
    }, [isAdmin]);

    const handleChange =
        (field: keyof Refund) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const value =
                    field === "orderId" || field === "clientId" || field === "status"
                        ? Number(e.target.value)
                        : e.target.value;
                setForm({ ...form, [field]: value });
            };

    const onSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.post("/orders/refund", form);
            console.log("Response sent !", response.data);
            // optionnel: reset form
            setForm({id : 0,  orderId: 0, clientId: 0, reason: "" , status: Status.PENDING});
        } catch (err: any) {
            setError(err.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (updated: Refund) => {
        try {
            await axiosInstance.put(`/orders/refund/${updated.id}`, updated);
            // Refresh table
            const response = await axiosInstance.get<Refund[]>("/orders/refunds");
            setRefunds(response.data);
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    const handleDelete = async (index: number) => {
        try {
            setRefunds(prev => prev.filter(r => r.id !== index));
            await axiosInstance.delete(`/orders/refund/${index}`);
            // Refresh table
            const response = await axiosInstance.get<Refund[]>("/orders/refunds");
            setRefunds(response.data);
        } catch (err) {
            console.error("Delete failed", err);
        }
        setDeletingIndex(null);
    };




    if (isAdmin) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
                <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h1 className="text-3xl font-bold text-blue-900 mb-4">
                        Refunds (Admin)
                    </h1>
                    {error && (
                        <p className="text-sm text-red-600 mb-3">{error}</p>
                    )}
                    {refunds.length === 0 ? (
                        <p className="text-gray-500 text-sm">No refunds yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 border-b text-left">
                                        Order
                                    </th>
                                    <th className="px-3 py-2 border-b text-left">
                                        Client
                                    </th>
                                    <th className="px-3 py-2 border-b text-right">
                                        Status
                                    </th>
                                    <th className="px-3 py-2 border-b text-left">
                                        Reason
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {refunds.map((r, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 border-b">
                                            {r.orderId}
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            {r.clientId}
                                        </td>
                                        <td className="px-3 py-2 border-b text-right">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
    {r.status}
</span>


                                        </td>
                                        <td className="px-3 py-2 border-b max-w-xs truncate">
                                            {r.reason}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex gap-1 justify-center">
                                                <button
                                                    onClick={() => setEditingRefund(r)}
                                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                    title="Update"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => setDeletingIndex(r.id)}
                                                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {editingRefund && (
                    <UpdateModal
                        isOpen={!!editingRefund}
                        onClose={() => setEditingRefund(null)}
                        refund={editingRefund}
                        onUpdate={handleUpdate}
                    />
                )}

                {deletingIndex !== null && (
                    <DeleteDialog
                        isOpen={deletingIndex !== null}
                        onClose={() => setDeletingIndex(null)}
                        onDelete={() => handleDelete(deletingIndex!)}
                    />
                )}
            </div>

        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h1 className="text-3xl font-bold text-blue-900 mb-2">
                    Refund request
                </h1>
                <p className="text-gray-600 mb-6">
                    Enter your order details to submit a refund request.
                </p>

                {error && (
                    <p className="text-sm text-red-600 mb-3">{error}</p>
                )}

                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Client ID
                        </label>
                        <input
                            type="number"
                            placeholder="Client ID"
                            value={form.clientId}
                            onChange={handleChange("clientId")}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Order ID
                        </label>
                        <input
                            type="number"
                            placeholder="Order ID"
                            value={form.orderId}
                            onChange={handleChange("orderId")}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            value={selected}
                            onChange={(e) => setSelect(e.target.value as Status)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={Status.PENDING}>Pending</option>
                            <option value={Status.APPROVED}>Approved</option>
                            <option value={Status.REJECTED}>Rejected</option>
                            <option value={Status.COMPLETED}>Completed</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Reason
                        </label>
                        <textarea
                            placeholder="Describe the reason for the refund"
                            value={form.reason}
                            onChange={handleChange("reason")}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Submitting..." : "Request refund"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RefundPage;
