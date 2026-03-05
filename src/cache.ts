import { CACHE_MAX_AGE_MINUTES } from "./constants";

interface CachedValue<T> {
  data: T;
  timestamp: string;
}

export function readCache<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  const { data, timestamp }: CachedValue<T> = JSON.parse(raw);
  const ageInMinutes = (Date.now() - new Date(timestamp).getTime()) / 60_000;
  const isFresh = ageInMinutes < CACHE_MAX_AGE_MINUTES;

  return isFresh ? data : null;
}

export function readStaleCache<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  return (JSON.parse(raw) as CachedValue<T>).data;
}

export function writeCache<T>(key: string, data: T): void {
  const entry: CachedValue<T> = { data, timestamp: new Date().toISOString() };
  localStorage.setItem(key, JSON.stringify(entry));
}
