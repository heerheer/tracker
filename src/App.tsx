
import React, { useState, useEffect } from 'react';
import { Habit, TabType, HabitLog } from './types';
import Home from './pages/Home';
import Records from './pages/Records';
import Settings from './pages/Settings';
import Dock from './components/Dock';
import { AnimatePresence, motion } from 'framer-motion';

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
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });
  const [activeTab, setActiveTab] = useState<TabType>('home');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

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
  };

  const toggleCheckIn = (id: string, dateStr: string, mood?: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const existingLogIndex = h.logs.findIndex(l => l.date === dateStr);
        let newLogs = [...h.logs];
        
        if (existingLogIndex > -1) {
          // If already exists and we are just toggling off (only if no mood provided/editing)
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
          {activeTab === 'settings' && <Settings />}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <main className="flex-1 max-w-md mx-auto w-full px-6 pt-12 overflow-x-hidden">
        {renderContent()}
      </main>
      <Dock activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
