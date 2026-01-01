import React, { useState, useEffect } from 'react';
import { Habit } from '../../types';
import { backupToWebDAV, restoreFromWebDAV, listBackups, deleteBackup, WebDAVConfig } from '../../utils/webdav';
import { saveAllHabits, clearAllDB } from '../../db';
import WebDAVRestoreModal from './WebDAVRestoreModal';

interface WebDAVSettingsProps {
    habits: Habit[];
    onRefresh: () => Promise<void>;
}

const WEBDAV_STORAGE_KEY = 'tracker_webdav_config';

const WebDAVSettings: React.FC<WebDAVSettingsProps> = ({ habits, onRefresh }) => {
    const [config, setConfig] = useState<WebDAVConfig>({
        url: '',
        username: '',
        password: '',
        maxBackups: 15,
    });
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading' | null; message: string }>({
        type: null,
        message: '',
    });
    const [backups, setBackups] = useState<string[]>([]);
    const [showRestoreModal, setShowRestoreModal] = useState(false);

    useEffect(() => {
        const savedConfig = localStorage.getItem(WEBDAV_STORAGE_KEY);
        if (savedConfig) {
            try {
                setConfig(JSON.parse(savedConfig));
            } catch (e) {
                console.error('Failed to parse WebDAV config', e);
            }
        }
    }, []);

    const handleSaveConfig = (name: string, value: any) => {
        const newConfig = { ...config, [name]: value };
        setConfig(newConfig);
        localStorage.setItem(WEBDAV_STORAGE_KEY, JSON.stringify(newConfig));
    };

    const handleBackup = async () => {
        if (!config.url || !config.username || !config.password) {
            setStatus({ type: 'error', message: 'Please fill in all WebDAV fields.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Backing up...' });
        try {
            await backupToWebDAV(config, habits);
            await cleanupBackups();
            setStatus({ type: 'success', message: 'Backup successful!' });
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message || 'Backup failed.' });
        }
    };

    const cleanupBackups = async () => {
        try {
            const list = await listBackups(config);
            const max = config.maxBackups || 15;
            if (list.length > max) {
                const toDelete = list.slice(max);
                for (const filename of toDelete) {
                    await deleteBackup(config, filename);
                }
            }
        } catch (e) {
            console.error('Cleanup failed', e);
        }
    };

    const handleRestore = async () => {
        if (!config.url || !config.username || !config.password) {
            setStatus({ type: 'error', message: 'Please fill in all WebDAV fields.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Fetching backups...' });
        try {
            const list = await listBackups(config);
            if (list.length === 0) {
                setStatus({ type: 'error', message: 'No backups found on server.' });
                return;
            }
            setBackups(list);
            setShowRestoreModal(true);
            setStatus({ type: null, message: '' });
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message || 'Failed to list backups.' });
        }
    };

    const executeRestore = async (filename: string) => {
        if (!confirm(`Restoring "${filename}" will overwrite all local data. Continue?`)) return;

        setShowRestoreModal(false);
        setStatus({ type: 'loading', message: 'Restoring...' });
        try {
            const restoredHabits = await restoreFromWebDAV(config, filename);
            await clearAllDB();
            await saveAllHabits(restoredHabits);
            await onRefresh();
            setStatus({ type: 'success', message: 'Restore successful!' });
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message || 'Restore failed.' });
        }
    };

    const executeDelete = async (filename: string) => {
        try {
            await deleteBackup(config, filename);
            const newList = backups.filter(b => b !== filename);
            setBackups(newList);
            if (newList.length === 0) {
                setShowRestoreModal(false);
            }
        } catch (error: any) {
            alert(`Delete failed: ${error.message}`);
        }
    };

    return (
        <div className="bg-[#FCFBFC] border border-[#DBDCD7] rounded-[28px] p-8 paper-shadow space-y-6">
            <div className="flex items-center gap-3 border-b border-[#DBDCD7] pb-4">
                <div className="text-xl">☁️</div>
                <h2 className="text-lg font-serif text-[#413A2C]">WebDAV Backup</h2>
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#726C62] font-medium ml-1">Server URL</label>
                    <input
                        type="text"
                        name="url"
                        value={config.url}
                        onChange={(e) => handleSaveConfig(e.target.name, e.target.value)}
                        placeholder="https://example.com/dav"
                        className="w-full bg-[#E9E8E2]/30 border border-[#DBDCD7] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66AB71] transition-all"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-[#726C62] font-medium ml-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={config.username}
                            onChange={(e) => handleSaveConfig(e.target.name, e.target.value)}
                            className="w-full bg-[#E9E8E2]/30 border border-[#DBDCD7] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66AB71] transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-[#726C62] font-medium ml-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={config.password}
                            onChange={(e) => handleSaveConfig(e.target.name, e.target.value)}
                            className="w-full bg-[#E9E8E2]/30 border border-[#DBDCD7] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66AB71] transition-all"
                        />
                    </div>
                </div>

                <div className="pt-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-serif text-[#413A2C]">Use CORS Proxy</h3>
                            <p className="text-[10px] text-[#726C62]">Enable if you encounter CORS errors.</p>
                        </div>
                        <button
                            onClick={() => handleSaveConfig('useProxy', !config.useProxy)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${config.useProxy ? 'bg-[#66AB71]' : 'bg-[#E9E8E2]'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${config.useProxy ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {config.useProxy && (
                        <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] uppercase tracking-widest text-[#726C62] font-medium ml-1">Proxy URL</label>
                            <input
                                type="text"
                                name="proxyUrl"
                                value={config.proxyUrl || ''}
                                onChange={(e) => handleSaveConfig(e.target.name, e.target.value)}
                                placeholder="https://your-proxy.com/proxy"
                                className="w-full bg-[#E9E8E2]/30 border border-[#DBDCD7] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#66AB71] transition-all"
                            />
                            <p className="text-[9px] text-[#A3BB96] mt-1 ml-1 leading-tight">
                                Proxy should accept a <code className="bg-[#E9E8E2] px-1 rounded">url</code> parameter. Target Origin will be sent in headers.
                            </p>
                        </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-serif text-[#413A2C]">Max Backups</h3>
                            <p className="text-[10px] text-[#726C62]">Automatically delete oldest backups.</p>
                        </div>
                        <input
                            type="number"
                            name="maxBackups"
                            value={config.maxBackups ?? 15}
                            onChange={(e) => handleSaveConfig(e.target.name, parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-16 bg-[#E9E8E2]/30 border border-[#DBDCD7] rounded-xl px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#66AB71] transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                    onClick={handleBackup}
                    disabled={status.type === 'loading'}
                    className="bg-[#66AB71] text-white py-3 rounded-xl text-sm font-medium hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 paper-shadow"
                >
                    Backup Now
                </button>
                <button
                    onClick={handleRestore}
                    disabled={status.type === 'loading'}
                    className="border border-[#66AB71] text-[#66AB71] py-3 rounded-xl text-sm font-medium hover:bg-[#66AB71]/5 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                >
                    Restore Now
                </button>
            </div>

            {status.message && (
                <div className={`text-center py-2 px-4 rounded-lg text-xs font-medium animate-in zoom-in-95 duration-300 ${status.type === 'success' ? 'bg-[#66AB71]/10 text-[#66AB71]' :
                    status.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-[#E9E8E2]/50 text-[#726C62]'
                    }`}>
                    {status.message}
                </div>
            )}

            <p className="text-[10px] text-[#726C62] text-center italic">
                Files will be backed up to the <code className="bg-[#E9E8E2] px-1 rounded">/tracker</code> directory.
            </p>

            <WebDAVRestoreModal
                show={showRestoreModal}
                onClose={() => setShowRestoreModal(false)}
                backups={backups}
                onRestore={executeRestore}
                onDelete={executeDelete}
            />
        </div>
    );
};

export default WebDAVSettings;
