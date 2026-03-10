import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileUp, Search, Plus, Trash2, Filter, RefreshCcw, Download } from 'lucide-react';
import { api } from '../../utils/api';

export const QuestionManagement: React.FC = () => {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const data = await api.getQuestions();
            setQuestions(data);
        } catch (error) {
            console.error("Failed to fetch questions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const result = await api.importQuestions(file);
            alert(`Succès: ${result.imported_count} questions importées.`);
            fetchQuestions();
        } catch (error) {
            alert("Erreur lors de l'importation. Vérifiez le format du fichier.");
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette question ?")) return;
        try {
            await api.deleteQuestion(id);
            setQuestions(prev => prev.filter(q => q.id !== id));
        } catch (error) {
            alert("Erreur lors de la suppression.");
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm("⚠️ ATTENTION : Voulez-vous vraiment supprimer TOUTES les questions ? Cette action est irréversible.")) return;
        setLoading(true);
        try {
            await api.deleteAllQuestions();
            setQuestions([]);
            alert("Toutes les questions ont été supprimées.");
        } catch (error) {
            alert("Erreur lors de la suppression groupée.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto py-4"
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".csv,.xlsx,.xls"
            />

            <header className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-4xl font-black mb-1 tracking-tighter text-slate-900">
                        Banque de <span className="gradient-text">Questions</span>
                    </h2>
                    <p className="text-slate-500 font-medium">Gérez vos quiz sur la culture africaine.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDeleteAll}
                        className="btn-secondary text-rose-600 hover:bg-rose-50 border-rose-100"
                        title="Supprimer toutes les questions"
                    >
                        <Trash2 size={20} />
                        Tout Supprimer
                    </button>
                    <button
                        onClick={() => api.downloadTemplate()}
                        className="btn-secondary"
                        title="Télécharger le modèle Excel"
                    >
                        <Download size={20} />
                        Modèle
                    </button>
                    <button
                        onClick={handleImportClick}
                        disabled={importing}
                        className="btn-secondary"
                    >
                        {importing ? <RefreshCcw className="animate-spin" size={20} /> : <FileUp size={20} />}
                        {importing ? 'Importation...' : 'Import'}
                    </button>
                    <button className="btn-primary">
                        <Plus size={20} />
                        Ajouter
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                <div className="lg:col-span-8 flex gap-3">
                    <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex items-center px-6 gap-4 shadow-sm focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                        <Search size={20} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Chercher une question..."
                            className="w-full bg-transparent border-none py-4 text-slate-800 focus:outline-none font-bold text-base placeholder:text-slate-400"
                        />
                    </div>
                    <button className="btn-secondary p-4 rounded-2xl">
                        <Filter size={24} className="text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Catégorie</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Points</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-10 text-center text-slate-400 font-bold">Chargement...</td>
                                </tr>
                            ) : questions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-10 text-center text-slate-400 font-bold">Aucune question trouvée. Importez-en pour commencer !</td>
                                </tr>
                            ) : (
                                questions.map((q) => (
                                    <tr key={q.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
                                                {q.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-start gap-2">
                                                <p className="font-bold text-slate-800 text-sm line-clamp-2 flex-1">{q.question_text}</p>
                                                {q.explanation && (
                                                    <span className="mt-0.5 text-indigo-400" title={q.explanation}>
                                                        <Search size={14} />
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">{q.options?.length} options disponibles</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {q.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{q.points} pts</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleDelete(q.id)}
                                                className="ml-auto w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl text-slate-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};
