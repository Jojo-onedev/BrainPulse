import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmLabel = 'Confirmer',
    isDanger = false 
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
            <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-3xl ${isDanger ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'} flex items-center justify-center mb-6`}>
                    <AlertTriangle size={32} />
                </div>
                <p className="text-slate-600 font-medium mb-8 leading-relaxed">
                    {message}
                </p>
                <div className="grid grid-cols-2 gap-4 w-full">
                    <button 
                        onClick={onClose}
                        className="btn-secondary w-full py-4 rounded-2xl"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 ${
                            isDanger 
                            ? 'bg-rose-500 shadow-rose-100 hover:bg-rose-600' 
                            : 'bg-indigo-500 shadow-indigo-100 hover:bg-indigo-600'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
