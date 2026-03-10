import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { api } from '../../utils/api';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemAnim = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

const StatCard: React.FC<{ label: string; value: string | number; icon: any; trend: string; isPositive: boolean; color: string }> = ({ label, value, icon: Icon, trend, isPositive, color }) => (
    <motion.div variants={itemAnim} className="glass-card p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${color}15`, color }}>
                <Icon size={24} />
            </div>
            <div className={`flex items-center gap-1 font-black text-[10px] uppercase px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {trend}
            </div>
        </div>
        <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
            <h3 className="text-3xl font-black mt-1 text-slate-900 tracking-tighter">{value}</h3>
        </div>
    </motion.div>
);

export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.getStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats:", error);
                setStats({
                    total_users: 0,
                    total_questions: 0,
                    total_volume_paris: 0,
                    active_users_24h: 0
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-slate-500 font-bold">Chargement des données...</div>;

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="max-w-6xl mx-auto py-4"
        >
            <motion.header variants={itemAnim} className="mb-10">
                <h2 className="text-4xl font-black mb-1 tracking-tighter text-slate-900">
                    Console de <span className="gradient-text">Gestion</span>
                </h2>
                <p className="text-slate-500 font-medium">Contrôlez l'ensemble de l'écosystème Duelio.</p>
            </motion.header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    label="Utilisateurs"
                    value={stats?.total_users ?? 0}
                    icon={Users}
                    trend="0%"
                    isPositive={true}
                    color="#6366f1"
                />
                <StatCard
                    label="Base Questions"
                    value={stats?.total_questions ?? 0}
                    icon={BookOpen}
                    trend="0%"
                    isPositive={true}
                    color="#8b5cf6"
                />
                <StatCard
                    label="Volume Paris"
                    value={`${stats?.total_volume_paris ?? 0} F`}
                    icon={Wallet}
                    trend="0%"
                    isPositive={true}
                    color="#ec4899"
                />
                <StatCard
                    label="Duels Actifs"
                    value={stats?.active_users_24h ?? 0}
                    icon={TrendingUp}
                    trend="0%"
                    isPositive={true}
                    color="#06b6d4"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <motion.div variants={itemAnim} className="lg:col-span-8 glass-card p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-xl font-black tracking-tight text-slate-900">Activité Récente</h4>
                        <button className="btn-secondary text-xs px-4 py-2">Historique</button>
                    </div>
                    <div className="space-y-4">
                        <div className="text-center py-10 text-slate-400 font-medium">
                            Aucune activité récente pour le moment.
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemAnim} className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 bg-indigo-600 border-none shadow-xl shadow-indigo-100 flex flex-col justify-center text-center">
                        <h4 className="font-black text-white text-xl mb-3 pr-2">Duelio Plus</h4>
                        <p className="text-sm text-white/80 mb-6 font-medium">Accédez aux outils d'analyse avancés et marketing.</p>
                        <button className="bg-white text-indigo-600 font-black py-4 rounded-xl shadow-lg hover:bg-slate-50 transition-all">Savoir Plus</button>
                    </div>

                    <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Cloud</p>
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                            <span className="font-bold text-sm text-slate-800">Operational</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};
