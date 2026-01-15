import React, { useEffect, useState } from "react";
import { Refund } from "../types";
import { axiosInstance } from "../api/axios";
import { useAuth } from "../auth/AuthProvider";

const RefundPage = () => {
    const [form, setForm] = useState<Refund>({
        orderId: 0,
        clientId: 0,
        reason: "",
        amount: 0,
    });

    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { roles } = useAuth();
    const isAdmin = roles.includes("ADMIN");
    console.log("");

    // Charger les refunds pour l'admin
    useEffect(() => {
        // if (!isAdmin) return;

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
                    field === "orderId" || field === "clientId" || field === "amount"
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
            setForm({ orderId: 0, clientId: 0, reason: "", amount: 0 });
        } catch (err: any) {
            setError(err.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
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
                                        Amount
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
                                            {r.amount.toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2 border-b max-w-xs truncate">
                                            {r.reason}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Vue client (form)
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
                            Amount
                        </label>
                        <input
                            type="number"
                            placeholder="Refund amount"
                            value={form.amount}
                            min={0}
                            onChange={handleChange("amount")}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
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
