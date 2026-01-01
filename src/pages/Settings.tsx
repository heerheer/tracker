
import React, { useState, useEffect } from 'react';
import { Habit, WidgetConfig } from '../types';
import WebDAVSettings from '../components/webdav/WebDAVSettings';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FlameTorchIcon } from '@/components/FlameTorchIcon';

interface SettingsProps {
  habits: Habit[];
  onRefresh: () => Promise<void>;
}

const WIDGET_STORAGE_KEY = 'afterglow_widget_config';

const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  heatmap: false,
  quote: false,
  capsule: {
    enabled: false,
    title: 'Countdown',
    description: '',
    targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  },
};

const Settings: React.FC<SettingsProps> = ({ habits, onRefresh }) => {
  const { t, i18n } = useTranslation();
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>(DEFAULT_WIDGET_CONFIG);

  useEffect(() => {
    const savedWidgetConfig = localStorage.getItem(WIDGET_STORAGE_KEY);
    if (savedWidgetConfig) {
      try {
        setWidgetConfig(JSON.parse(savedWidgetConfig));
      } catch (e) {
        console.error('Failed to parse Widget config', e);
      }
    }
  }, []);

  const handleSaveWidgetConfig = (newConfig: WidgetConfig) => {
    setWidgetConfig(newConfig);
    localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(newConfig));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      <h1 className="text-3xl font-serif italic text-foreground">{t('settings.title')}</h1>

      <WebDAVSettings habits={habits} onRefresh={onRefresh} />

      <div className="bg-card border border-border rounded-[28px] p-8 paper-shadow space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="text-xl">🧩</div>
          <h2 className="text-lg font-serif text-foreground">{t('settings.widgets')}</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-serif text-foreground">{t('settings.heatmap')}</h3>
              <p className="text-[10px] text-muted-foreground">{t('settings.heatmap-desc')}</p>
            </div>
            <button
              onClick={() => handleSaveWidgetConfig({ ...widgetConfig, heatmap: !widgetConfig.heatmap })}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${widgetConfig.heatmap ? 'bg-primary' : 'bg-secondary'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${widgetConfig.heatmap ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-serif text-foreground">{t('settings.daily-quote')}</h3>
              <p className="text-[10px] text-muted-foreground">{t('settings.daily-quote-desc')}</p>
            </div>
            <button
              onClick={() => handleSaveWidgetConfig({ ...widgetConfig, quote: !widgetConfig.quote })}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${widgetConfig.quote ? 'bg-primary' : 'bg-secondary'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${widgetConfig.quote ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-serif text-foreground">{t('settings.future-capsule')}</h3>
                <p className="text-[10px] text-muted-foreground">{t('settings.future-capsule-desc')}</p>
              </div>
              <button
                onClick={() => handleSaveWidgetConfig({
                  ...widgetConfig,
                  capsule: { ...widgetConfig.capsule, enabled: !widgetConfig.capsule.enabled }
                })}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${widgetConfig.capsule.enabled ? 'bg-primary' : 'bg-secondary'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${widgetConfig.capsule.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {widgetConfig.capsule.enabled && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium ml-1">{t('settings.capsule-title')}</label>
                  <input
                    type="text"
                    value={widgetConfig.capsule.title}
                    onChange={(e) => handleSaveWidgetConfig({
                      ...widgetConfig,
                      capsule: { ...widgetConfig.capsule, title: e.target.value }
                    })}
                    placeholder={t('settings.capsule-title-placeholder')}
                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium ml-1">{t('settings.capsule-target-date')}</label>
                  <input
                    type="date"
                    value={widgetConfig.capsule.targetDate}
                    onChange={(e) => handleSaveWidgetConfig({
                      ...widgetConfig,
                      capsule: { ...widgetConfig.capsule, targetDate: e.target.value }
                    })}
                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium ml-1">{t('settings.capsule-description')}</label>
                  <input
                    type="text"
                    value={widgetConfig.capsule.description}
                    onChange={(e) => handleSaveWidgetConfig({
                      ...widgetConfig,
                      capsule: { ...widgetConfig.capsule, description: e.target.value }
                    })}
                    placeholder={t('settings.capsule-description-placeholder')}
                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[28px] p-8 paper-shadow space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="text-xl">🌐</div>
          <h2 className="text-lg font-serif text-foreground">{t('settings.language')}</h2>
        </div>
        <div className="flex gap-2">
          {['auto', 'en', 'zh'].map((lang) => {
            const isAuto = lang === 'auto';
            const userLangPref = localStorage.getItem('afterglow_user_lang');
            const isActive = isAuto ? !userLangPref : userLangPref === lang;

            return (
              <button
                key={lang}
                onClick={() => {
                  if (isAuto) {
                    localStorage.removeItem('afterglow_user_lang');
                    window.location.reload();
                  } else {
                    localStorage.setItem('afterglow_user_lang', lang);
                    i18n.changeLanguage(lang);
                  }
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${isActive
                  ? 'bg-primary text-primary-foreground paper-shadow'
                  : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                  }`}
              >
                {t(`settings.lang-${lang}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-[28px] p-8 paper-shadow space-y-8">
        <div className="space-y-4 text-center py-4">
          <div className="w-16 h-16 bg-secondary rounded-[24px] mx-auto flex items-center justify-center paper-shadow border border-white">
            <FlameTorchIcon className="text-primary w-12 h-12" />
          </div>
          <div>
            <h2 className="text-lg font-serif text-foreground">{t('settings.app-name')}</h2>
            <p className="text-muted-foreground text-[10px] italic">{t('settings.app-tagline')}</p>
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium uppercase tracking-widest text-[9px]">{t('settings.version')}</span>
            <span className="text-foreground font-mono text-xs">{import.meta.env.VITE_APP_VERSION}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium uppercase tracking-widest text-[9px]">{t('settings.repository')}</span>
            <a
              href="https://github.com/heerheer/afterglow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium text-xs"
            >
              heerheer/afterglow
            </a>
          </div>
        </div>

        <div className="pt-2 text-center">
          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em]">{t('settings.quote-footer')}</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
