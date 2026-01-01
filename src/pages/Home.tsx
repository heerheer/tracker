
import React, { useState, useEffect } from 'react';
import { Habit, WidgetConfig } from '@/types';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import Heatmap from '@/components/widgets/Heatmap';
import DailyQuote from '@/components/widgets/DailyQuote';
import FutureCapsule from '@/components/widgets/FutureCapsule';
import { useTranslation } from 'react-i18next';
import { getSafeLanguage } from '@/utils/locale';

interface HomeProps {
  habits: Habit[];
  onCheckIn: (id: string, mood?: string) => void;
}

const WIDGET_STORAGE_KEY = 'afterglow_widget_config';

const Home = ({ habits, onCheckIn }: HomeProps) => {
  const { t, i18n } = useTranslation();
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);
  const [editingCapsule, setEditingCapsule] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(WIDGET_STORAGE_KEY);
    if (saved) {
      setWidgetConfig(JSON.parse(saved));
    }
  }, []);

  const handleSaveWidgetConfig = (newConfig: WidgetConfig) => {
    setWidgetConfig(newConfig);
    localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(newConfig));
  };

  const [showMoodModal, setShowMoodModal] = useState<string | null>(null);
  const [moodText, setMoodText] = useState('');
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);

  const createParticles = () => {
    const emojis = ['✨', '🎉', '🌟', '🎊', '⭐'];
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400 - 100,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  const mainHabit = habits.find(h => h.isMain);
  const secondaryHabits = habits.filter(h => !h.isMain);

  const calculateStreak = (logs: { date: string }[]) => {
    if (logs.length === 0) return 0;
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (sorted[0].date !== today && sorted[0].date !== yesterday) return 0;

    let streak = 0;
    const logDates = new Set(logs.map(l => l.date));
    let current = new Date(sorted[0].date);

    while (logDates.has(current.toISOString().split('T')[0])) {
      streak++;
      current.setDate(current.getDate() - 1);
    }
    return streak;
  };

  const isLoggedToday = (logs: { date: string }[]) => {
    const today = new Date().toISOString().split('T')[0];
    return logs.some(l => l.date === today);
  };

  const handleCheckInAttempt = (habitId: string) => {
    if (isLoggedToday(habits.find(h => h.id === habitId)?.logs || [])) return;
    setShowMoodModal(habitId);
  };

  const submitCheckIn = () => {
    if (showMoodModal) {
      onCheckIn(showMoodModal, moodText);
      createParticles();
      setShowMoodModal(null);
      setMoodText('');
    }
  };

  return (
    <div className="space-y-4 md:space-y-12">
      <header className="space-y-1 px-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          {new Intl.DateTimeFormat(getSafeLanguage(i18n.language), { weekday: 'long' }).format(new Date())}
        </p>
        <h1 className="text-3xl font-serif italic text-foreground">
          {new Intl.DateTimeFormat(getSafeLanguage(i18n.language), { month: 'long', day: 'numeric' }).format(new Date())}
        </h1>
      </header>

      {widgetConfig?.heatmap && <Heatmap habits={habits} />}
      {widgetConfig?.quote && <DailyQuote />}
      {widgetConfig?.capsule.enabled && (
        <FutureCapsule
          {...widgetConfig.capsule}
          onEdit={() => setEditingCapsule(true)}
        />
      )}

      <LayoutGroup>
        <motion.div layout>
          {mainHabit ? (
            <section className="relative group">
              <motion.div
                layoutId="main-habit-card"
                className="bg-card border border-border rounded-[28px] p-8 space-y-6 paper-shadow transition-transform hover:-translate-y-1 duration-500"
              >
                <div className="flex justify-between items-start">
                  <span className="text-4xl">{mainHabit.icon}</span>
                  <span className="text-xs bg-secondary text-muted-foreground px-3 py-1 rounded-full uppercase tracking-wider font-bold">{t('home.main-focus')}</span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-serif text-foreground">{mainHabit.title}</h2>
                  <p className="text-muted-foreground text-sm">{mainHabit.description}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-serif text-foreground">{calculateStreak(mainHabit.logs)}</span>
                  <span className="text-muted-foreground font-medium tracking-wide uppercase text-sm">{t('home.days-streak')}</span>
                </div>

                <motion.button
                  layout
                  onClick={() => handleCheckInAttempt(mainHabit.id)}
                  disabled={isLoggedToday(mainHabit.logs)}
                  className={`
                    w-full py-4 rounded-2xl font-semibold tracking-wide uppercase text-sm transition-all duration-300
                    ${isLoggedToday(mainHabit.logs)
                      ? 'bg-primary/20 text-primary cursor-default'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95'}
                  `}
                >
                  {isLoggedToday(mainHabit.logs) ? t('home.completed-for-today') : t('home.check-in-now')}
                </motion.button>
              </motion.div>
            </section>
          ) : (
            <motion.section layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
              <div className="bg-card border border-border border-dashed rounded-[28px] p-12 flex flex-col items-center justify-center text-center space-y-6 paper-shadow">
                <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center text-5xl opacity-60">
                  🍃
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-serif text-foreground italic">{t("home.no-main-focus-yet")}</h2>
                  <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">
                    {t("home.select-primary-habit")}
                  </p>
                </div>
              </div>
            </motion.section>
          )}
        </motion.div>
      </LayoutGroup>

      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-bold px-1">{t("home.other-journeys")}</h3>
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {secondaryHabits.length > 0 ? secondaryHabits.map((habit) => (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between paper-shadow transition-transform hover:-translate-y-0.5 duration-300"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{habit.icon}</span>
                  <div>
                    <h4 className="font-medium text-foreground">{habit.title}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{calculateStreak(habit.logs)} {t('home.day-streak')}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCheckInAttempt(habit.id)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${isLoggedToday(habit.logs)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-border'}
                  `}
                >
                  {isLoggedToday(habit.logs) ? '✓' : '+'}
                </button>
              </motion.div>
            )) : (
              <motion.div
                layout
                className="p-8 text-center border border-border rounded-2xl bg-card/30 italic text-muted-foreground text-sm"
              >
                {t("home.no-secondary-journeys")}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Mood Entry Modal */}
      <AnimatePresence>
        {showMoodModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-sm rounded-[28px] p-8 space-y-6 paper-shadow border border-border"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-serif text-foreground italic">{t('home.how-are-you-feeling')}</h2>
                <p className="text-sm text-muted-foreground">{t('home.record-brief-note')}</p>
              </div>
              <textarea
                autoFocus
                value={moodText}
                onChange={e => setMoodText(e.target.value)}
                placeholder={t('home.mood-placeholder')}
                className="w-full h-32 bg-secondary/50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-foreground resize-none text-sm leading-relaxed"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowMoodModal(null); setMoodText(''); }}
                  className="flex-1 py-3 text-muted-foreground font-semibold text-sm uppercase tracking-wider"
                >
                  {t('home.skip')}
                </button>
                <button
                  onClick={submitCheckIn}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm uppercase tracking-wider shadow-lg shadow-primary/20"
                >
                  {t('home.check-in')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Celebration Effects */}
      <div className="fixed inset-0 pointer-events-none z-[300] overflow-hidden">
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 1, x: '50vw', y: '50vh', scale: 0 }}
              animate={{
                opacity: 0,
                x: `calc(50vw + ${particle.x}px)`,
                y: `calc(50vh + ${particle.y}px)`,
                scale: [0, 1.5, 1],
                rotate: [0, 180, 360]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute text-2xl -translate-x-1/2 -translate-y-1/2"
            >
              {particle.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Future Capsule Edit Modal */}
      <AnimatePresence>
        {editingCapsule && widgetConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-sm rounded-[28px] p-8 space-y-6 paper-shadow border border-border"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-serif text-foreground italic">{t('home.edit-capsule')}</h2>
                <p className="text-sm text-muted-foreground">{t('home.update-manifestation')}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium ml-1">{t('home.title')}</label>
                  <input
                    type="text"
                    value={widgetConfig.capsule.title}
                    onChange={(e) => handleSaveWidgetConfig({
                      ...widgetConfig,
                      capsule: { ...widgetConfig.capsule, title: e.target.value }
                    })}
                    className="w-full bg-secondary/50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium ml-1">{t('home.objective')}</label>
                  <textarea
                    value={widgetConfig.capsule.description || ''}
                    onChange={(e) => handleSaveWidgetConfig({
                      ...widgetConfig,
                      capsule: { ...widgetConfig.capsule, description: e.target.value }
                    })}
                    placeholder={t('home.objective-placeholder')}
                    className="w-full h-24 bg-secondary/50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium ml-1">{t('home.target-date')}</label>
                  <input
                    type="date"
                    value={widgetConfig.capsule.targetDate}
                    onChange={(e) => handleSaveWidgetConfig({
                      ...widgetConfig,
                      capsule: { ...widgetConfig.capsule, targetDate: e.target.value }
                    })}
                    className="w-full bg-secondary/50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-foreground text-sm"
                  />
                </div>
              </div>

              <button
                onClick={() => setEditingCapsule(false)}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold tracking-wide uppercase text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                {t('home.done')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
