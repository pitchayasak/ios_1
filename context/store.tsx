import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'daily_tracker_v1';

// ─── Types ───────────────────────────────────────────────────
export type TaskType = 'pill' | 'exercise' | 'transfer' | 'spend';
export type ExerciseMode = 'duration' | 'distance';
export type ExerciseIcon = 'run' | 'bicycle' | 'sport' | 'drive';

export interface Task {
  id: string;
  type: TaskType;
  name: string;
  color: string;
  created: number;
  // exercise
  mode?: ExerciseMode;
  icon?: ExerciseIcon;
}

export interface PillEntry { morning?: boolean; evening?: boolean; }
export interface ExerciseEntry { duration?: number; distance?: number; }
export interface TransferEntry { amount?: number; }
export interface SpendEntry { amount?: number | null; }
export type TaskEntry = PillEntry | ExerciseEntry | TransferEntry | SpendEntry | null;

export type DayLog = { [taskId: string]: TaskEntry };
export type Log = { [dateKey: string]: DayLog };

export interface AppState {
  tasks: Task[];
  log: Log;
}

// ─── Date helpers ─────────────────────────────────────────────
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function formatLongDate(d: Date): string {
  const today = new Date();
  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, addDays(today, -1))) return 'Yesterday';
  if (isSameDay(d, addDays(today, 1))) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// ─── Seed data ────────────────────────────────────────────────
const SEED_TASKS: Task[] = [
  { id: 't1', type: 'pill', name: 'Vitamin D', color: '#F4B740', created: Date.now() },
  { id: 't2', type: 'pill', name: 'Magnesium', color: '#8A8CD9', created: Date.now() },
  { id: 't3', type: 'exercise', name: 'Morning Run', mode: 'distance', icon: 'run', color: '#6DD3A8', created: Date.now() },
  { id: 't4', type: 'exercise', name: 'Yoga', mode: 'duration', icon: 'sport', color: '#E57ABD', created: Date.now() },
  { id: 't5', type: 'transfer', name: 'Savings', color: '#5EC7E8', created: Date.now() },
  { id: 't6', type: 'spend', name: 'Daily spend', color: '#F07A5A', created: Date.now() },
];

function seedHistory(state: AppState): AppState {
  const today = new Date();
  for (let i = 90; i > 0; i--) {
    const d = addDays(today, -i);
    const k = dateKey(d);
    if (state.log[k]) continue;
    const day: DayLog = {};
    state.tasks.forEach(t => {
      const r = Math.random();
      if (t.type === 'pill') {
        if (r > 0.2) day[t.id] = { morning: r > 0.3, evening: r > 0.5 };
      } else if (t.type === 'exercise') {
        if (r > 0.35) {
          if (t.mode === 'duration') {
            day[t.id] = { duration: [15, 20, 30, 40, 45, 50, 60][Math.floor(Math.random() * 7)] };
          } else {
            day[t.id] = { distance: [500, 1000, 1500, 2000][Math.floor(Math.random() * 4)] };
          }
        }
      } else if (t.type === 'transfer') {
        if (r > 0.7) day[t.id] = { amount: [7500, 20000][Math.floor(Math.random() * 2)] };
      } else if (t.type === 'spend') {
        if (r > 0.25) {
          const n = Math.round((50 + Math.random() * 2500) * 100) / 100;
          day[t.id] = { amount: n };
        }
      }
    });
    if (Object.keys(day).length) state.log[k] = day;
  }
  return state;
}

function makeFreshState(): AppState {
  const s: AppState = { tasks: SEED_TASKS, log: {} };
  return seedHistory(s);
}

// ─── Context ──────────────────────────────────────────────────
interface StoreContextValue {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateRaw] = useState<AppState>({ tasks: [], log: {} });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setStateRaw(JSON.parse(raw));
        } else {
          const fresh = makeFreshState();
          setStateRaw(fresh);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        }
      } catch (e) {
        console.error('Store load error', e);
        setStateRaw(makeFreshState());
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setState: React.Dispatch<React.SetStateAction<AppState>> = useCallback((action) => {
    setStateRaw(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(console.error);
      return next;
    });
  }, []);

  return (
    <StoreContext.Provider value={{ state, setState, isLoading }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

// ─── Completion helpers ───────────────────────────────────────
export function completionLevel(task: Task, entry: TaskEntry | undefined): number {
  if (!entry) return 0;
  const e = entry as any;
  if (task.type === 'pill') {
    const m = !!e.morning, ev = !!e.evening;
    if (m && ev) return 4;
    if (m || ev) return 2;
    return 0;
  }
  if (task.type === 'exercise') {
    const v = task.mode === 'duration' ? e.duration : e.distance;
    if (!v) return 0;
    if (task.mode === 'duration') {
      if (v >= 50) return 4; if (v >= 40) return 3; if (v >= 25) return 2; return 1;
    } else {
      if (v >= 2000) return 4; if (v >= 1500) return 3; if (v >= 1000) return 2; return 1;
    }
  }
  if (task.type === 'transfer') {
    const v = e.amount;
    if (!v) return 0;
    if (v >= 20000) return 4; if (v >= 7500) return 3; return 2;
  }
  if (task.type === 'spend') {
    const v = e.amount;
    if (v === undefined || v === null || v === '') return 0;
    const n = parseFloat(String(v));
    if (!isFinite(n)) return 0;
    if (n >= 2000) return 4; if (n >= 500) return 3; if (n >= 100) return 2; return 1;
  }
  return 0;
}

export function isTaskDone(task: Task, entry: TaskEntry | undefined): boolean {
  if (!entry) return false;
  const e = entry as any;
  if (task.type === 'pill') return !!(e.morning && e.evening);
  if (task.type === 'exercise') return !!(e.duration || e.distance);
  if (task.type === 'transfer') return !!(e.amount);
  if (task.type === 'spend') return e.amount !== undefined && e.amount !== null && e.amount !== '';
  return false;
}

export function dayCompletion(tasks: Task[], dayLog: DayLog | undefined): number {
  if (!dayLog || !tasks.length) return 0;
  let done = 0;
  tasks.forEach(t => {
    const e = dayLog[t.id] as any;
    if (!e) return;
    if (t.type === 'pill') {
      if (e.morning && e.evening) done++;
      else if (e.morning || e.evening) done += 0.5;
    } else if (t.type === 'exercise') {
      if (e.duration || e.distance) done++;
    } else if (t.type === 'transfer' || t.type === 'spend') {
      if (e.amount !== undefined && e.amount !== null && e.amount !== '') done++;
    }
  });
  return done / tasks.length;
}

export function cellColor(level: number, base: string): string {
  if (level === 0) return 'rgba(255,255,255,0.04)';
  const alphas = [0, 0.28, 0.52, 0.78, 1];
  const alpha = alphas[level] ?? 1;
  const hex = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `${base}${hex}`;
}

export const PALETTE = ['#F4B740', '#E57ABD', '#6DD3A8', '#8A8CD9', '#F07A5A', '#5EC7E8', '#C4A7E7', '#F2D479'];
export const ACCENT = '#F4B740';
