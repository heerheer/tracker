import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getSafeLanguage } from '@/utils/locale';

interface WebDAVRestoreModalProps {
    show: boolean;
    onClose: () => void;
    backups: string[];
    onRestore: (filename: string) => Promise<void>;
    onDelete: (filename: string) => Promise<void>;
}

const WebDAVRestoreModal: React.FC<WebDAVRestoreModalProps> = ({
    show,
    onClose,
    backups,
    onRestore,
    onDelete,
}) => {
    const { t, i18n } = useTranslation();

    const formatBackupInfo = (filename: string) => {
        const match = filename.match(/backup_(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\.json/);
        if (!match) return { primary: filename, secondary: null };

        const [_, y, m, d, hh, mm, ss] = match;
        // The timestamp in filename is UTC
        const dateObj = new Date(Date.UTC(
            parseInt(y),
            parseInt(m) - 1,
            parseInt(d),
            parseInt(hh),
            parseInt(mm),
            parseInt(ss)
        ));

        const dateStr = dateObj.toLocaleDateString(getSafeLanguage(i18n.language), {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        const timeStr = dateObj.toLocaleTimeString(getSafeLanguage(i18n.language), {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        return {
            primary: `${dateStr} ${timeStr}`,
            secondary: filename
        };
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-200 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-[#FCFBFC] w-full max-w-sm rounded-[28px] p-8 space-y-6 paper-shadow border border-[#DBDCD7] flex flex-col max-h-[80vh]"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-serif text-[#413A2C] italic">{t('webdav.pick-backup')}</h2>
                            <p className="text-sm text-[#726C62]">{t('webdav.select-snapshot')}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            {backups.map((filename) => {
                                const info = formatBackupInfo(filename);
                                return (
                                    <button
                                        key={filename}
                                        onClick={() => onRestore(filename)}
                                        className="w-full text-left p-4 bg-[#E9E8E2]/30 hover:bg-[#E9E8E2]/50 border border-[#DBDCD7] rounded-2xl transition-all group flex flex-col gap-1 relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <span className="text-sm font-medium text-[#413A2C]">{info.primary}</span>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm(t('webdav.delete-backup-confirm', { filename }))) {
                                                            onDelete(filename);
                                                        }
                                                    }}
                                                    className="p-1 hover:bg-red-50 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-all pointer-events-auto"
                                                    title={t('webdav.delete')}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                                </div>
                                                <span className="text-[10px] text-[#A3BB96] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{t('webdav.restore-arrow')}</span>
                                            </div>
                                        </div>
                                        {info.secondary && (
                                            <span className="text-[10px] font-mono text-[#726C62]/60 truncate">{info.secondary}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full text-[#726C62] font-semibold text-sm uppercase tracking-wider h-10 flex items-center justify-center hover:bg-[#E9E8E2]/30 rounded-xl transition-colors"
                        >
                            {t('webdav.cancel')}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WebDAVRestoreModal;
