import { useState, useEffect } from 'react';
import { Habit } from '../types';
import { backupToWebDAV, restoreFromWebDAV, listBackups, deleteBackup, WebDAVConfig } from '../utils/webdav';
import { saveAllHabits, clearAllDB } from '../db';
import { useTranslation } from 'react-i18next';

export const WEBDAV_STORAGE_KEY = 'afterglow_webdav_config';

export interface WebDAVStatus {
    type: 'success' | 'error' | 'loading' | null;
    message: string;
}

export const useWebDAV = (habits: Habit[], onRefresh?: () => Promise<void>) => {
    const { t } = useTranslation();
    const [config, setConfig] = useState<WebDAVConfig>({
        url: '',
        username: '',
        password: '',
        maxBackups: 15,
    });
    const [status, setStatus] = useState<WebDAVStatus>({
        type: null,
        message: '',
    });
    const [backups, setBackups] = useState<string[]>([]);

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

    const saveConfig = (newConfig: WebDAVConfig) => {
        setConfig(newConfig);
        localStorage.setItem(WEBDAV_STORAGE_KEY, JSON.stringify(newConfig));
    };

    const handleSaveConfig = (name: string, value: any) => {
        const newConfig = { ...config, [name]: value };
        saveConfig(newConfig);
    };

    const cleanupBackups = async (currentConfig: WebDAVConfig) => {
        try {
            const list = await listBackups(currentConfig);
            const max = currentConfig.maxBackups || 15;
            if (list.length > max) {
                const toDelete = list.slice(max);
                for (const filename of toDelete) {
                    await deleteBackup(currentConfig, filename);
                }
            }
        } catch (e) {
            console.error('Cleanup failed', e);
        }
    };

    const backup = async () => {
        if (!config.url || !config.username || !config.password) {
            setStatus({ type: 'error', message: t('webdav.fill-all-fields') });
            return;
        }

        setStatus({ type: 'loading', message: t('webdav.backing-up') });
        try {
            await backupToWebDAV(config, habits);
            await cleanupBackups(config);
            setStatus({ type: 'success', message: t('webdav.backup-success') });
            return true;
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message || t('webdav.backup-failed') });
            return false;
        }
    };

    const fetchBackups = async () => {
        if (!config.url || !config.username || !config.password) {
            setStatus({ type: 'error', message: t('webdav.fill-all-fields') });
            return;
        }

        setStatus({ type: 'loading', message: t('webdav.fetching-backups') });
        try {
            const list = await listBackups(config);
            setBackups(list);
            setStatus({ type: null, message: '' });
            return list;
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message || t('webdav.failed-to-list') });
            return null;
        }
    };

    const restore = async (filename: string) => {
        setStatus({ type: 'loading', message: t('webdav.restoring') });
        try {
            const restoredHabits = await restoreFromWebDAV(config, filename);
            await clearAllDB();
            await saveAllHabits(restoredHabits);
            if (onRefresh) await onRefresh();
            setStatus({ type: 'success', message: t('webdav.restore-success') });
            return true;
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message || t('webdav.restore-failed') });
            return false;
        }
    };

    const removeBackup = async (filename: string) => {
        try {
            await deleteBackup(config, filename);
            setBackups(prev => prev.filter(b => b !== filename));
            return true;
        } catch (error: any) {
            alert(t('webdav.delete-failed', { message: error.message }));
            return false;
        }
    };

    return {
        config,
        status,
        backups,
        setStatus,
        handleSaveConfig,
        backup,
        fetchBackups,
        restore,
        removeBackup,
        isConfigured: !!config.url
    };
};
