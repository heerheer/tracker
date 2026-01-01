import React, { useState } from 'react';
import { Habit } from '../../types';
import { useWebDAV } from '../../hooks/useWebDAV';
import WebDAVRestoreModal from './WebDAVRestoreModal';
import { useTranslation, Trans } from 'react-i18next';
import { Switch } from '@/components/ui/switch';

interface WebDAVSettingsProps {
    habits: Habit[];
    onRefresh: () => Promise<void>;
}

const WebDAVSettings: React.FC<WebDAVSettingsProps> = ({ habits, onRefresh }) => {
    const { t } = useTranslation();
    const {
        config,
        status,
        backups,
        setStatus,
        handleSaveConfig,
        backup,
        fetchBackups,
        restore,
        removeBackup
    } = useWebDAV(habits, onRefresh);

    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const handleBackup = async () => {
        await backup();
    };

    const handleRestore = async () => {
        const list = await fetchBackups();
        if (list && list.length > 0) {
            setShowRestoreModal(true);
        } else if (list && list.length === 0) {
            setStatus({ type: 'error', message: t('webdav.no-backups-found') });
        }
    };

    const executeRestore = async (filename: string) => {
        if (!confirm(t('webdav.restore-confirm', { filename }))) return;
        setShowRestoreModal(false);
        await restore(filename);
    };

    const executeDelete = async (filename: string) => {
        const success = await removeBackup(filename);
        if (success && backups.length <= 1) {
            setShowRestoreModal(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-[28px] p-8 paper-shadow space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="text-xl">☁️</div>
                <h2 className="text-lg font-serif text-foreground">{t('webdav.title')}</h2>
                <div className="flex-1"></div>
                <Switch checked={showDetails} onCheckedChange={setShowDetails} />
            </div>

            <div className="space-y-4" hidden={!showDetails}>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium ml-1">{t('webdav.server-url')}</label>
                    <input
                        type="text"
                        name="url"
                        value={config.url}
                        onChange={(e) => handleSaveConfig(e.target.name, e.target.value)}
                        placeholder="https://example.com/dav"
                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium ml-1">{t('webdav.username')}</label>
                        <input
                            type="text"
                            name="username"
                            value={config.username}
                            onChange={(e) => handleSaveConfig(e.target.name, e.target.value)}
                            className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium ml-1">{t('webdav.password')}</label>
                        <input
                            type="password"
                            name="password"
                            value={config.password}
                            onChange={(e) => handleSaveConfig(e.target.name, e.target.value)}
                            className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                </div>

                <div className="pt-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-serif text-foreground">{t('webdav.use-cors-proxy')}</h3>
                            <p className="text-[10px] text-muted-foreground">{t('webdav.proxy-desc')}</p>
                        </div>
                        <button
                            onClick={() => handleSaveConfig('useProxy', !config.useProxy)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${config.useProxy ? 'bg-primary' : 'bg-secondary'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${config.useProxy ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {config.useProxy && (
                        <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium ml-1">{t('webdav.proxy-url')}</label>
                            <input
                                type="text"
                                name="proxyUrl"
                                value={config.proxyUrl || ''}
                                onChange={(e) => handleSaveConfig(e.target.name, e.target.value)}
                                placeholder="https://your-proxy.com/proxy"
                                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            />
                            <p className="text-[9px] text-primary/70 mt-1 ml-1 leading-tight">
                                <Trans i18nKey="webdav.proxy-hint">
                                    Proxy should accept a <code className="bg-secondary px-1 rounded">url</code> parameter. Target Origin will be sent in headers.
                                </Trans>
                            </p>
                        </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-serif text-foreground">{t('webdav.max-backups')}</h3>
                            <p className="text-[10px] text-muted-foreground">{t('webdav.max-backups-desc')}</p>
                        </div>
                        <input
                            type="number"
                            name="maxBackups"
                            value={config.maxBackups ?? 15}
                            onChange={(e) => handleSaveConfig(e.target.name, parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-16 bg-secondary/30 border border-border rounded-xl px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2" hidden={!showDetails}>
                <button
                    onClick={handleBackup}
                    disabled={status.type === 'loading'}
                    className="bg-primary text-primary-foreground py-3 rounded-xl text-sm font-medium hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 paper-shadow"
                >
                    {t('webdav.backup-now')}
                </button>
                <button
                    onClick={handleRestore}
                    disabled={status.type === 'loading'}
                    className="border border-primary text-primary py-3 rounded-xl text-sm font-medium hover:bg-primary/5 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                >
                    {t('webdav.restore-now')}
                </button>
            </div>

            {status.message && (
                <div className={`text-center py-2 px-4 rounded-lg text-xs font-medium animate-in zoom-in-95 duration-300 ${status.type === 'success' ? 'bg-primary/10 text-primary' :
                    status.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-secondary/50 text-muted-foreground'
                    }`}>
                    {status.message}
                </div>
            )}

            <p className="text-[10px] text-muted-foreground text-center italic">
                <Trans i18nKey="webdav.backup-dir-hint">
                    Files will be backed up to the <code className="bg-secondary px-1 rounded">/afterglow</code> directory.
                </Trans>
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
