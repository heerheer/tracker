import { openDB, IDBPDatabase } from 'idb';
import { Habit } from './types';

const DB_NAME = 'AfterglowDB';
const DB_VERSION = 1;
const STORE_NAME = 'habits';

let dbPromise: Promise<IDBPDatabase> | null = null;

export const initDB = () => {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            },
        });
    }
    return dbPromise;
};

export const getAllHabits = async (): Promise<Habit[]> => {
    const db = await initDB();
    return db.getAll(STORE_NAME);
};

export const saveHabit = async (habit: Habit) => {
    const db = await initDB();
    return db.put(STORE_NAME, habit);
};

export const saveAllHabits = async (habits: Habit[]) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Clear existing to ensure sync if needed, though for this app we might want to just put all
    // For simplicity since we manage the state in memory, we can just put all
    for (const habit of habits) {
        await store.put(habit);
    }
    return tx.done;
};

export const deleteHabitFromDB = async (id: string) => {
    const db = await initDB();
    return db.delete(STORE_NAME, id);
};

export const clearAllDB = async () => {
    const db = await initDB();
    return db.clear(STORE_NAME);
};
