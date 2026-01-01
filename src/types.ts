
export interface HabitLog {
  date: string; // YYYY-MM-DD
  mood?: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  isMain: boolean;
  createdAt: string;
  logs: HabitLog[];
}

export type TabType = 'home' | 'records' | 'settings';
