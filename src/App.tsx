import React, { useState, useEffect } from 'react';
import { Habit, TabType } from './types';
import Home from './pages/Home';
import Records from './pages/Records';
import Settings from './pages/Settings';
import Dock from './components/Dock';
import { AnimatePresence, motion } from 'framer-motion';
import { getAllHabits, saveAllHabits, deleteHabitFromDB } from './db';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'ethereal_habits_v1_moods';

const INITIAL_HABITS: Habit[] = [
  {
    id: '1',
    title: 'Morning Yoga',
    description: '15 mins of mindfulness',
    icon: '🧘',
    color: '#66AB71',
    isMain: true,
    createdAt: new Date().toISOString(),
    logs: [{ date: new Date().toISOString().split('T')[0], mood: 'Feeling centered and calm.' }],
  },
  {
    id: '2',
    title: 'Reading',
    description: '30 pages daily',
    icon: '📖',
    color: '#A3BB96',
    isMain: false,
    createdAt: new Date().toISOString(),
    logs: [],
  }
];

const App: React.FC = () => {
  const { t } = useTranslation();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const loadData = async () => {
    try {
      setLoading(true);
      const storedHabits = await getAllHabits();

      if (storedHabits.length > 0) {
        setHabits(storedHabits);
      } else {
        // Check for legacy localStorage data
        const legacyData = localStorage.getItem(STORAGE_KEY);
        if (legacyData) {
          const parsed = JSON.parse(legacyData);
          setHabits(parsed);
          await saveAllHabits(parsed);
          // Optionally clear localStorage after migration
          // localStorage.removeItem(STORAGE_KEY);
        } else {
          setHabits(INITIAL_HABITS);
          await saveAllHabits(INITIAL_HABITS);
        }
      }
    } catch (error) {
      console.error('Failed to load habits from IndexedDB:', error);
      setHabits(INITIAL_HABITS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      saveAllHabits(habits).catch(err => console.error('Failed to save habits:', err));
    }
  }, [habits, loading]);

  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt' | 'logs'>) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      logs: [],
    };
    if (newHabit.isMain) {
      setHabits(prev => prev.map(h => ({ ...h, isMain: false })).concat(newHabit));
    } else {
      setHabits(prev => [...prev, newHabit]);
    }
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    deleteHabitFromDB(id).catch(err => console.error('Failed to delete habit from db:', err));
  };

  const toggleCheckIn = (id: string, dateStr: string, mood?: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const existingLogIndex = h.logs.findIndex(l => l.date === dateStr);
        let newLogs = [...h.logs];

        if (existingLogIndex > -1) {
          if (mood === undefined) {
            newLogs.splice(existingLogIndex, 1);
          } else {
            newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], mood };
          }
        } else {
          newLogs.push({ date: dateStr, mood: mood || '' });
        }

        return { ...h, logs: newLogs };
      }
      return h;
    }));
  };

  const updateMood = (habitId: string, dateStr: string, mood: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        return {
          ...h,
          logs: h.logs.map(l => l.date === dateStr ? { ...l, mood } : l)
        };
      }
      return h;
    }));
  };

  const setAsMain = (id: string) => {
    setHabits(prev => prev.map(h => ({
      ...h,
      isMain: h.id === id
    })));
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 py-20">
          <div className="w-10 h-10 border-4 border-[#A3BB96] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#A3BB96] font-medium animate-pulse text-sm tracking-widest uppercase">{t('app.initializing')}</p>
        </div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full"
        >
          {activeTab === 'home' && (
            <Home
              habits={habits}
              onCheckIn={(id, mood) => toggleCheckIn(id, new Date().toISOString().split('T')[0], mood)}
            />
          )}
          {activeTab === 'records' && (
            <Records
              habits={habits}
              onDelete={deleteHabit}
              onSetMain={setAsMain}
              onAdd={addHabit}
              onToggleLog={toggleCheckIn}
              onUpdateMood={updateMood}
            />
          )}
          {activeTab === 'settings' && <Settings habits={habits} onRefresh={loadData} />}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen flex flex-col pb-32 pt-12">
      <main className="flex-1 max-w-md mx-auto w-full px-6  overflow-x-hidden">
        {renderContent()}
      </main>
      <Dock activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;

