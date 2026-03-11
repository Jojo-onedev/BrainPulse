import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileUp, Search, Plus, Trash2, Filter, RefreshCcw, Download, ShieldAlert } from 'lucide-react';
import { api } from '../../utils/api';
import { Modal } from '../ui/Modal';
import { ConfirmModal } from '../ui/ConfirmModal';

export const QuestionManagement: React.FC = () => {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ isOpen: boolean; id: string; all: boolean }>({
        isOpen: false,
        id: '',
        all: false
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        type: 'single',
        category: 'Culture',
        question_text: '',
        options: ['', '', '', ''],
        correct_answers: [0],
        explanation: '',
        points: 10
    });

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
            await api.importQuestions(file);
            fetchQuestions();
        } catch (error) {
            console.error(error);
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const confirmAction = async () => {
        if (showDeleteConfirm.all) {
            setLoading(true);
            try {
                await api.deleteAllQuestions();
                setQuestions([]);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        } else {
            try {
                await api.deleteQuestion(showDeleteConfirm.id);
                setQuestions(prev => prev.filter(q => q.id !== showDeleteConfirm.id));
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleSaveQuestion = async () => {
        try {
            const data = {
                ...newQuestion,
                correct_answers: newQuestion.correct_answers,
                options: newQuestion.options
            };
            await api.createQuestion(data);
            setShowAddModal(false);
            fetchQuestions();
            // Reset form
            setNewQuestion({
                type: 'single',
                category: 'Culture',
                question_text: '',
                options: ['', '', '', ''],
                correct_answers: [0],
                explanation: '',
                points: 10
            });
        } catch (error) {
            console.error("Failed to save question:", error);
            alert("Erreur lors de l'enregistrement de la question");
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

            <div className="px-4 lg:px-0">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 lg:mb-10">
                    <div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-1 tracking-tighter text-slate-900">
                            Banque de <span className="gradient-text">Questions</span>
                        </h2>
                        <p className="text-slate-500 text-sm md:text-base font-medium">Gérez vos quiz sur la culture africaine.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowDeleteConfirm({ isOpen: true, id: '', all: true })}
                            className="btn-secondary text-rose-600 hover:bg-rose-50 border-rose-100 flex-1 sm:flex-initial py-2 px-3 text-xs"
                            title="Supprimer toutes les questions"
                        >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">Tout Supprimer</span>
                            <span className="sm:hidden">Reset</span>
                        </button>
                        <button
                            onClick={() => api.downloadTemplate()}
                            className="btn-secondary flex-1 sm:flex-initial py-2 px-3 text-xs"
                            title="Télécharger le modèle Excel"
                        >
                            <Download size={16} />
                            Modèle
                        </button>
                        <button
                            onClick={handleImportClick}
                            disabled={importing}
                            className="btn-secondary flex-1 sm:flex-initial py-2 px-3 text-xs"
                        >
                            {importing ? <RefreshCcw className="animate-spin" size={16} /> : <FileUp size={16} />}
                            {importing ? '...' : 'Import'}
                        </button>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary flex-1 sm:flex-initial py-2 px-3 text-xs"
                        >
                            <Plus size={16} />
                            Ajouter
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mb-8">
                    <div className="lg:col-span-8 flex gap-2 sm:gap-3">
                        <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex items-center px-4 sm:px-6 gap-3 sm:gap-4 shadow-sm focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                            <Search size={18} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Chercher une question..."
                                className="w-full bg-transparent border-none py-3 sm:py-4 text-slate-800 focus:outline-none font-bold text-sm sm:text-base placeholder:text-slate-400"
                            />
                        </div>
                        <button className="btn-secondary p-3 sm:p-4 rounded-2xl">
                            <Filter size={20} className="text-slate-400" />
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
                                                onClick={() => setShowDeleteConfirm({ isOpen: true, id: q.id, all: false })}
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
            </div>

            {/* Modals */}
            <ConfirmModal 
                isOpen={showDeleteConfirm.isOpen}
                onClose={() => setShowDeleteConfirm({ ...showDeleteConfirm, isOpen: false })}
                onConfirm={confirmAction}
                title={showDeleteConfirm.all ? "Tout Supprimer" : "Supprimer Question"}
                message={showDeleteConfirm.all 
                    ? "Êtes-vous sûr de vouloir supprimer TOUTES les questions ? Cette action est irréversible."
                    : "Voulez-vous supprimer cette question ?"
                }
                isDanger={true}
            />

            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Nouvelle Question"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Type</label>
                            <select 
                                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold"
                                value={newQuestion.type}
                                onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value})}
                            >
                                <option value="single">Choix Unique</option>
                                <option value="multiple">Choix Multiple</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Catégorie</label>
                            <input 
                                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold"
                                list="categories"
                                value={newQuestion.category}
                                onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                            />
                            <datalist id="categories">
                                <option value="Culture" />
                                <option value="Histoire" />
                                <option value="Géographie" />
                                <option value="Sport" />
                            </datalist>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Enoncé de la Question</label>
                        <textarea 
                            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold min-h-[100px]"
                            placeholder="Entrez votre question ici..."
                            value={newQuestion.question_text}
                            onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Options de Réponse</label>
                        {newQuestion.options.map((opt, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input 
                                    className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold"
                                    placeholder={`Option ${idx + 1}`}
                                    value={opt}
                                    onChange={(e) => {
                                        const newOpts = [...newQuestion.options];
                                        newOpts[idx] = e.target.value;
                                        setNewQuestion({...newQuestion, options: newOpts});
                                    }}
                                />
                                <button 
                                    onClick={() => {
                                        const isCorrect = newQuestion.correct_answers.includes(idx);
                                        if (isCorrect) {
                                            setNewQuestion({...newQuestion, correct_answers: newQuestion.correct_answers.filter(i => i !== idx)});
                                        } else {
                                            setNewQuestion({...newQuestion, correct_answers: [...newQuestion.correct_answers, idx]});
                                        }
                                    }}
                                    className={`w-14 rounded-2xl flex items-center justify-center transition-all ${
                                        newQuestion.correct_answers.includes(idx) ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 text-slate-300'
                                    }`}
                                >
                                    <ShieldAlert size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Explication / Justification</label>
                        <textarea 
                            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold"
                            placeholder="Pourquoi cette réponse est correcte ?"
                            value={newQuestion.explanation}
                            onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                        />
                    </div>

                    <button className="btn-primary w-full py-5 rounded-3xl" onClick={handleSaveQuestion}>
                        Enregistrer la Question
                    </button>
                </div>
            </Modal>
        </motion.div>
    );
};
