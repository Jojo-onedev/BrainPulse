import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { QuestionManagement } from './components/questions/QuestionManagement';
import { PlayerManagement } from './components/players/PlayerManagement';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle
} from 'lucide-react';

const PlaceholderView = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mb-8"
    >
      <AlertCircle size={48} className="text-slate-300" />
    </motion.div>
    <h2 className="text-4xl font-black mb-4 tracking-tighter text-slate-900">{title}</h2>
    <p className="text-slate-500 font-medium text-base max-w-sm">Cette interface est en cours de développement et sera connectée à Supabase prochainement.</p>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[#f8fafc] min-h-screen relative overflow-x-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          <span className="font-black tracking-tighter text-slate-900">DUELIO</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-slate-50 rounded-xl"
        >
          <div className="space-y-1.5">
            <div className="w-6 h-0.5 bg-slate-600 rounded-full" />
            <div className="w-6 h-0.5 bg-slate-600 rounded-full" />
            <div className="w-6 h-0.5 bg-slate-600 rounded-full" />
          </div>
        </button>
      </div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={(id) => {
          setActiveTab(id);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 lg:ml-72 pt-16 lg:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="p-4 md:p-8"
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'questions' && <QuestionManagement />}
            {activeTab === 'players' && <PlayerManagement />}
            {activeTab === 'transactions' && <PlaceholderView title="Centre Financier" />}
            {activeTab === 'settings' && <PlaceholderView title="Paramètres" />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
