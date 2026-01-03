
import React, { useState } from 'react';
import { Habit } from '../types';
import CalendarView from '../components/CalendarView';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { XIcon } from 'lucide-react'

interface RecordsProps {
  habits: Habit[];
  onDelete: (id: string) => void;
  onSetMain: (id: string) => void;
  onAdd: (habit: any) => void;
  onToggleLog: (id: string, date: string, mood?: string) => void;
  onUpdateMood: (id: string, date: string, mood: string) => void;
}

const EMOJI_CATEGORIES = [
  { name: 'Smileys', icons: ['😊', '🥰', '✨', '🧘', '🌿', '🌱', '☀️', '🌙', '⭐', '☁️', '🌊', '🌈', '🔥', '💧'] },
  { name: 'Health', icons: ['🍎', '🍓', '🍵', '🥗', '🥤', '💪', '🏃', '🚶', '🚴', '🏊', '🧘', '🛀', '🛌', '💊'] },
  { name: 'Mind', icons: ['📖', '✍️', '🎨', '🧠', '🎧', '🎸', '📷', '💻', '💡', '📌', '📅', '🔍', '♟️', '🎮'] },
  { name: 'Nature', icons: ['🌸', '🌻', '🌲', '🍀', '🍂', '🍄', '🏔️', '🏜️', '🐾', '🦋', '🐝', '🦉', '🦊', '🐋'] },
  { name: 'Life', icons: ['🏠', '🧹', '🧺', '🍳', '☕', '🍷', '🚲', '🚗', '✈️', '👜', '🔑', '💰', '🎁', '🎈'] }
];

const Hint = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = React.useState(() => !localStorage.getItem('hide-records-hint'));
  if (!isVisible) return null;

  return (
    <div className="mx-1 bg-secondary/60 px-4 py-3 rounded-xl flex items-center justify-between animate-fade-in">
      <p className="text-xs text-muted-foreground">{t('records.swipe-hint-text')}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          localStorage.setItem('hide-records-hint', 'true');
        }}
        className="text-xs text-primary hover:underline"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}


const Records: React.FC<RecordsProps> = ({ habits, onDelete, onSetMain, onAdd, onToggleLog, onUpdateMood }) => {
  const { t } = useTranslation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [swipedHabitId, setSwipedHabitId] = useState<string | null>(null);

  React.useEffect(() => {
    const handleGlobalClick = () => setSwipedHabitId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('✨');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAdd({
      title: newTitle,
      description: newDesc,
      icon: newIcon,
      color: '#66AB71',
      isMain: habits.length === 0,
    });
    setNewTitle('');
    setNewDesc('');
    setNewIcon('✨');
    setIsAddOpen(false);
  };

  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-1">
        <h1 className="text-3xl font-serif italic text-foreground">{t('records.title')}</h1>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors paper-shadow"
        >
          +
        </button>
      </div>

      <Hint />

      <motion.div layout className="grid gap-6">
        <AnimatePresence mode="popLayout">
          {habits.map((habit) => (
            <div key={habit.id} className="relative overflow-hidden rounded-[24px]">
              {/* Swipe Action Layer (Underlay) */}
              <div className="absolute inset-0 bg-secondary/10 flex justify-end items-center pr-4">
                <div className="flex items-center gap-3">
                  {!habit.isMain && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetMain(habit.id);
                        setSwipedHabitId(null);
                      }}
                      className="bg-primary/90 text-primary-foreground px-5 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all text-[10px] uppercase tracking-wider"
                    >
                      {t('records.set-main')}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setHabitToDelete(habit);
                      setSwipedHabitId(null);
                    }}
                    className="bg-destructive/90 text-white px-5 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all text-[10px] uppercase tracking-wider"
                  >
                    {t('records.delete')}
                  </button>
                </div>
              </div>

              {/* Habit Card Layer */}
              <motion.div
                layout
                drag="x"
                dragConstraints={{ left: -220, right: 0 }}
                dragElastic={0.05}
                onDragStart={() => {
                  if (swipedHabitId && swipedHabitId !== habit.id) {
                    setSwipedHabitId(null);
                  }
                }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -40) {
                    setSwipedHabitId(habit.id);
                  } else {
                    setSwipedHabitId(null);
                  }
                }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: swipedHabitId === habit.id ? (habit.isMain ? -100 : -210) : 0
                }}
                exit={{ opacity: 0, scale: 0.98 }}
                onClick={(e) => {
                  if (swipedHabitId) {
                    setSwipedHabitId(null);
                    e.stopPropagation();
                  } else {
                    setSelectedHabitId(habit.id);
                  }
                }}
                className={`
                  relative z-10 bg-card border border-border rounded-[24px] p-6 space-y-4 paper-shadow 
                  cursor-pointer transition-colors hover:border-primary group
                  ${habit.isMain ? 'ring-2 ring-primary/20 border-primary' : ''}
                `}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <span className="text-3xl bg-secondary w-12 h-12 flex items-center justify-center rounded-xl">{habit.icon}</span>
                    <div className="max-w-[140px] xs:max-w-none">
                      <h3 className="font-semibold text-foreground truncate">{habit.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{habit.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {habit.isMain ? (
                      <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {t('home.main-focus')}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); onSetMain(habit.id); }}
                        className="text-[10px] uppercase font-bold text-primary hover:underline opacity-0 group-hover:opacity-100 lg:group-hover:opacity-100 transition-opacity"
                      >
                        {t('records.set-main')}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-1">
                  {[...Array(14)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (13 - i));
                    const ds = d.toISOString().split('T')[0];
                    const active = habit.logs.some(l => l.date === ds);
                    return (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${active ? 'bg-primary' : 'bg-secondary'}`}
                      />
                    );
                  })}
                </div>
              </motion.div>
            </div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-sm rounded-[28px] p-8 space-y-6 paper-shadow border border-border max-h-[85vh] overflow-y-auto custom-scroll"
            >
              <h2 className="text-2xl font-serif text-foreground italic text-center">{t('records.new-journey')}</h2>
              <form onSubmit={handleAdd} className="space-y-6">

                {/* Icon Selection Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t('records.icon')}</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-medium italic">{t('records.custom')}</span>
                      <input
                        maxLength={2}
                        value={newIcon}
                        onChange={e => setNewIcon(e.target.value)}
                        className="w-10 h-8 text-center bg-secondary border-none rounded-lg text-lg focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 bg-secondary/30 p-4 rounded-[20px] max-h-60 overflow-y-auto custom-scroll border border-border">
                    {EMOJI_CATEGORIES.map(cat => (
                      <div key={cat.name} className="space-y-2">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold opacity-70">{t(`categories.${cat.name}`)}</p>
                        <div className="grid grid-cols-7 gap-1">
                          {cat.icons.map(icon => (
                            <button
                              key={icon}
                              type="button"
                              onClick={() => setNewIcon(icon)}
                              className={`aspect-square rounded-lg flex items-center justify-center text-lg transition-all ${newIcon === icon ? 'bg-primary text-primary-foreground scale-110' : 'bg-card text-foreground hover:bg-border'}`}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t('records.journey-title')}</label>
                  <input
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-secondary/50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-foreground"
                    placeholder={t('records.journey-title-placeholder')}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t('records.journey-description')}</label>
                  <input
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="w-full bg-secondary/50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-foreground"
                    placeholder={t('records.journey-description-placeholder')}
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 py-3 text-muted-foreground font-semibold text-sm uppercase tracking-wider"
                  >
                    {t('records.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm uppercase tracking-wider shadow-lg shadow-primary/20"
                  >
                    {t('records.create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail/Calendar Modal */}
      <AnimatePresence>
        {selectedHabit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-sm rounded-[28px] p-6 space-y-6 paper-shadow border border-border relative max-h-[90vh] overflow-y-auto custom-scroll"
            >
              <button
                onClick={() => setSelectedHabitId(null)}
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground z-10"
              >
                ✕
              </button>
              <div className="text-center space-y-2">
                <span className="text-4xl block">{selectedHabit.icon}</span>
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif text-foreground wrap-break-word">{selectedHabit.title}</h2>
                  <p className="text-sm text-muted-foreground italic px-4 wrap-break-word">{selectedHabit.description}</p>
                </div>
              </div>

              <CalendarView
                logs={selectedHabit.logs}
                onToggle={(date, mood) => onToggleLog(selectedHabit.id, date, mood)}
                onUpdateMood={(date, mood) => onUpdateMood(selectedHabit.id, date, mood)}
              />

              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <p className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold">{t('records.journey-progress')}</p>
                    <p className="text-xl font-serif">{selectedHabit.logs.length} {t('records.total-check-ins')}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedHabitId(null);
                      setHabitToDelete(selectedHabit);
                    }}
                    className="bg-destructive/20 text-destructive px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-destructive/40 transition-colors"
                  >
                    {t('records.delete')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {habitToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-200 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-xs rounded-[28px] p-8 space-y-6 paper-shadow border border-border text-center"
            >
              <div className="space-y-2">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-2">
                  ⚠️
                </div>
                <h2 className="text-xl font-serif text-foreground italic">{t('records.delete-confirm-title')}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('records.delete-confirm')}
                </p>
                <div className="bg-secondary/50 p-3 rounded-xl mt-2">
                  <p className="text-sm font-semibold">{habitToDelete.icon} {habitToDelete.title}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    onDelete(habitToDelete.id);
                    setHabitToDelete(null);
                  }}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-semibold text-sm uppercase tracking-wider shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                  {t('records.delete')}
                </button>
                <button
                  onClick={() => setHabitToDelete(null)}
                  className="w-full py-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  {t('records.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Records;
