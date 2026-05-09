import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertTriangle, FiLock, FiCheckCircle } from 'react-icons/fi';

const AlertModal = ({ isOpen, onClose, title, message, type = 'error' }) => {
    if (!isOpen) return null;

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: { scale: 0.8, opacity: 0, y: 20 },
        visible: { scale: 1, opacity: 1, y: 0 }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return <FiCheckCircle className="text-green-400 w-12 h-12" />;
            case 'warning': return <FiAlertTriangle className="text-yellow-400 w-12 h-12" />;
            case 'lock': return <FiLock className="text-purple-400 w-12 h-12" />;
            default: return <FiX className="text-red-400 w-12 h-12" />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success': return 'border-green-500/50';
            case 'warning': return 'border-yellow-500/50';
            case 'lock': return 'border-purple-500/50';
            default: return 'border-red-500/50';
        }
    };

    const getGlowColor = () => {
        switch (type) {
            case 'success': return 'shadow-[0_0_30px_rgba(34,197,94,0.3)]';
            case 'warning': return 'shadow-[0_0_30px_rgba(234,179,8,0.3)]';
            case 'lock': return 'shadow-[0_0_30px_rgba(168,85,247,0.3)]';
            default: return 'shadow-[0_0_30px_rgba(239,68,68,0.3)]';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={overlayVariants}
                    className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                >
                    <motion.div
                        variants={modalVariants}
                        className={`relative w-full max-w-md bg-[#0a0a0f] border-2 ${getBorderColor()} rounded-3xl p-8 ${getGlowColor()} overflow-hidden`}
                    >
                        {/* Background Decor */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="mb-6 p-4 bg-white/5 rounded-full border border-white/10">
                                {getIcon()}
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight uppercase tracking-widest">{title}</h2>

                            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"></div>

                            <p className="text-gray-400 leading-relaxed mb-8 whitespace-pre-line">
                                {message}
                            </p>

                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold transition-all duration-300 uppercase tracking-[0.2em] text-xs"
                            >
                                Acknowledge & Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AlertModal;
