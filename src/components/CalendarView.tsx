
import React, { useState } from 'react';
import { HabitLog } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarViewProps {
  logs: HabitLog[];
  onToggle: (date: string, mood?: string) => void;
  onUpdateMood: (date: string, mood: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ logs, onToggle, onUpdateMood }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = [];
  // Offset for first day (Monday start)
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  for (let i = 0; i < offset; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => setViewDate(new Date(year, month - 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1));

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(viewDate);

  const getIso = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const selectedLog = logs.find(l => l.date === selectedDate);
  const isChecked = !!selectedLog;

  const handleMoodChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateMood(selectedDate, e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#FCFBFC] rounded-2xl p-4 border border-[#DBDCD7]/50 shadow-sm">
        <div className="flex justify-between items-center px-1 mb-4">
          <h4 className="text-sm font-serif italic text-[#413A2C]">{monthName}</h4>
          <div className="flex gap-4">
            <button onClick={prevMonth} className="text-[#726C62] hover:text-[#413A2C] text-lg font-bold">‹</button>
            <button onClick={nextMonth} className="text-[#726C62] hover:text-[#413A2C] text-lg font-bold">›</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-[10px] text-center font-bold text-[#726C62] mb-1 opacity-50">{d}</div>
          ))}
          {days.map((day, i) => {
            if (day === null) return <div key={i} />;
            const iso = getIso(day);
            const active = logs.some(l => l.date === iso);
            const isToday = iso === todayStr;
            const isSelected = iso === selectedDate;

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(iso)}
                className={`
                  aspect-square rounded-full flex flex-col items-center justify-center text-[11px] transition-all relative
                  ${active 
                    ? 'bg-[#66AB71] text-white' 
                    : 'bg-transparent text-[#413A2C] hover:bg-[#E9E8E2]'}
                  ${isSelected ? 'ring-2 ring-[#413A2C] ring-offset-2 scale-110 z-10' : ''}
                  ${isToday && !active ? 'border border-[#66AB71] text-[#66AB71]' : ''}
                `}
              >
                {day}
                {active && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-white/50 rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-[#E9E8E2]/30 border border-[#DBDCD7] rounded-2xl p-4 space-y-4"
        >
          <div className="flex justify-between items-center">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#726C62]">
              {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(selectedDate))}
            </p>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isChecked ? 'bg-[#66AB71]/10 text-[#66AB71]' : 'bg-[#726C62]/10 text-[#726C62]'}`}>
              {isChecked ? 'Completed' : 'Skipped'}
            </span>
          </div>

          {isChecked ? (
            <div className="space-y-3">
              <textarea
                value={selectedLog?.mood || ''}
                onChange={handleMoodChange}
                placeholder="How was it?..."
                className="w-full bg-white/50 border-none rounded-xl px-4 py-3 text-sm text-[#413A2C] focus:ring-2 focus:ring-[#66AB71]/20 outline-none resize-none min-h-[80px]"
              />
              <button
                onClick={() => onToggle(selectedDate)}
                className="w-full py-2 bg-[#DBDCD7] text-[#726C62] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-red-50 hover:text-red-400 transition-colors"
              >
                Clear Record
              </button>
            </div>
          ) : (
            <div className="py-2 text-center space-y-4">
              <p className="text-xs text-[#726C62] italic">No entry for this day.</p>
              <button
                onClick={() => onToggle(selectedDate, "")}
                className="w-full py-3 bg-[#66AB71] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md shadow-[#66AB71]/10 hover:bg-[#549856] transition-all"
              >
                Add Record
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CalendarView;
