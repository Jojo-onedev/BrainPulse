import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    CircleDollarSign,
    Settings,
    LogOut,
    ChevronRight
} from 'lucide-react';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'questions', label: 'Quizzes & Questions', icon: BookOpen },
    { id: 'players', label: 'Gestion Joueurs', icon: Users },
    { id: 'transactions', label: 'Portefeuille & Paris', icon: CircleDollarSign },
    { id: 'settings', label: 'Configuration', icon: Settings },
];

export const Sidebar: React.FC<{
    activeTab: string;
    setActiveTab: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
}> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
    return (
        <>
            {/* Overlay for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    x: isOpen ? 0 : (window.innerWidth < 1024 ? -300 : 0),
                    opacity: 1
                }}
                className={`fixed left-0 top-0 h-screen w-72 sidebar-bg p-8 flex flex-col z-[70] bg-white lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } transition-transform duration-300 lg:transition-none`}
            >
                <div className="flex flex-col items-center mb-10 gap-2">
                    <div className="w-20 h-20 mb-2">
                        <img src="/logo.png" alt="Duelio Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">
                            DUELIO<span className="text-indigo-600 italic">.Admin</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mt-1">Console de gestion</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2 mt-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 border-none outline-none ${isActive
                                    ? 'sidebar-link-active'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 bg-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <Icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
                                    <span className="font-bold tracking-tight text-sm">{item.label}</span>
                                </div>
                                {isActive && <ChevronRight size={16} />}
                            </motion.button>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-8 border-t border-slate-100">
                    <button className="w-full flex items-center gap-3 px-5 py-4 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors border-none bg-transparent font-bold">
                        <LogOut size={20} />
                        <span className="tracking-tight">Déconnexion</span>
                    </button>
                </div>
            </motion.aside>
        </>
    );
};
