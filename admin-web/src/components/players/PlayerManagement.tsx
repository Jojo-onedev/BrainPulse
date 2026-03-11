import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Trash2, Crown, Filter, TrendingUp } from 'lucide-react';
import { api } from '../../utils/api';
import { ConfirmModal } from '../ui/ConfirmModal';

export const PlayerManagement: React.FC = () => {
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; userId: string; name: string }>({
        isOpen: false,
        userId: '',
        name: ''
    });

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const data = await api.getUsers();
            setPlayers(data);
        } catch (error) {
            console.error("Failed to fetch players:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, []);

    const handleTogglePremium = async (id: string) => {
        try {
            const result = await api.togglePremium(id);
            if (result.status === 'success') {
                setPlayers(prev => prev.map(p => p.id === id ? { ...p, is_premium: result.is_premium } : p));
            }
        } catch (error) {
            alert("Erreur lors de la mise à jour premium");
        }
    };

    const handleDelete = async () => {
        try {
            await api.deleteUser(confirmDelete.userId);
            setPlayers(prev => prev.filter(p => p.id !== confirmDelete.userId));
        } catch (error) {
            alert("Erreur lors de la suppression");
        }
    };

    const filteredPlayers = players.filter(p => 
        (p.display_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: players.length,
        premium: players.filter(p => p.is_premium).length,
        new: players.filter(p => {
            const date = new Date(p.created_at);
            const now = new Date();
            return (now.getTime() - date.getTime()) < 24 * 60 * 60 * 1000;
        }).length
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto py-4 px-4 lg:px-0"
        >
            <header className="mb-10">
                <h2 className="text-3xl lg:text-4xl font-black mb-1 tracking-tighter text-slate-900">
                    Gestion <span className="gradient-text">Joueurs</span>
                </h2>
                <p className="text-slate-500 font-medium">Contrôlez et analysez votre communauté Duelio.</p>
            </header>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass-card p-6 flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center">
                        <Users size={32} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Joueurs</p>
                        <h4 className="text-3xl font-black text-slate-900">{stats.total}</h4>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-6">
                    <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center">
                        <Crown size={32} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abonnés Premium</p>
                        <h4 className="text-3xl font-black text-slate-900">{stats.premium}</h4>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nouveaux (24h)</p>
                        <h4 className="text-3xl font-black text-slate-900">{stats.new}</h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                <div className="lg:col-span-8 flex gap-3">
                    <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex items-center px-6 gap-4 shadow-sm focus-within:border-indigo-500 transition-all">
                        <Search size={20} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Chercher par nom ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none py-4 text-slate-800 focus:outline-none font-bold placeholder:text-slate-400"
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
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Inscrit le</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Solde</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">Chargement des joueurs...</td>
                                </tr>
                            ) : filteredPlayers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">Aucun joueur ne correspond à votre recherche.</td>
                                </tr>
                            ) : (
                                filteredPlayers.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                                                    {p.display_name?.[0].toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{p.display_name || 'Sans nom'}</p>
                                                    <p className="text-xs text-slate-400">{p.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {p.is_premium ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase">
                                                    <Crown size={12} /> Premium
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-black uppercase">Standard</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-xs font-bold text-slate-500">
                                                {new Date(p.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-sm font-black text-slate-900">{p.wallet_balance.toLocaleString()} F</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleTogglePremium(p.id)}
                                                    className={`p-2 rounded-xl transition-all ${p.is_premium ? 'text-amber-500 bg-amber-50' : 'text-slate-400 bg-slate-100 hover:bg-amber-50 hover:text-amber-500'}`}
                                                    title={p.is_premium ? "Rembourser/Standard" : "Passer Premium"}
                                                >
                                                    <Crown size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => setConfirmDelete({ isOpen: true, userId: p.id, name: p.display_name || p.email })}
                                                    className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                    title="Supprimer le compte"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal 
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
                onConfirm={handleDelete}
                title="Supprimer Utilisateur"
                message={`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${confirmDelete.name} ? Cette action est irréversible.`}
                confirmLabel="Supprimer Définitivement"
                isDanger={true}
            />
        </motion.div>
    );
};
