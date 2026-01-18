import React, { useState, FormEvent } from "react";
import {axiosInstance} from "../api/axios";

const AiChatPage: React.FC = () => {
    const [query, setQuery] = useState<string>("");
    const [answer, setAnswer] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError("");
        setAnswer("");

        try {
            const params = new URLSearchParams();
            params.append("querytext", query);

            const res = await axiosInstance.post("/chat", null, {
                params: { querytext: query },
            });
            setAnswer(res.data);

        } catch (err) {
            console.error(err);
            setError("Erreur lors de l'appel à l'IA. Vérifie le backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
            <div className="w-full max-w-3xl mx-4">
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-xl p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-center">
                        AI Service Chat
                    </h1>
                    <p className="text-sm text-slate-400 mb-6 text-center">
                        Pose une question, elle sera envoyée à ton backend Spring Boot
                        (<code className="text-emerald-400">/api/chat</code>).
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Ta question
                            </label>
                            <textarea
                                className="w-full h-32 md:h-40 rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                placeholder="Écris ta question pour l’IA..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <button
                                type="submit"
                                disabled={loading || !query.trim()}
                                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-sm font-medium transition-colors"
                            >
                                {loading ? "Envoi en cours..." : "Envoyer à l’IA"}
                            </button>
                            {loading && (
                                <span className="text-xs text-slate-400">
                  L’IA réfléchit, merci de patienter...
                </span>
                            )}
                        </div>
                    </form>

                    <div className="mt-6">
                        <h2 className="text-sm font-semibold mb-2 text-slate-200">
                            Réponse de l’IA
                        </h2>
                        <div className="min-h-[120px] max-h-80 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-3 text-sm whitespace-pre-wrap">
                            {error && (
                                <span className="text-red-400 text-sm">{error}</span>
                            )}
                            {!error && !answer && !loading && (
                                <span className="text-slate-500 text-sm">
                  La réponse s’affichera ici.
                </span>
                            )}
                            {!error && answer && (
                                <span className="text-slate-100 text-sm">{answer}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiChatPage;
