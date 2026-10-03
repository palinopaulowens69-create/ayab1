// Nagbibigay ito ng wrapper para ligtas magbasa at magsulat ng AYAB data sa localStorage.
const PREFIX = 'ayab_';

// Walang input; chine-check kung nasa browser ang code at nagbabalik ng boolean.
function isBrowser() {
  return typeof window !== 'undefined';
}

// Tumatanggap ng storage key at fallback; binabasa at kino-convert ang saved JSON, o ibinabalik ang fallback kapag walang data o may error.
export function loadItem<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    // Kung luma o sira ang JSON, sa catch babalik tayo sa fallback para tuloy pa rin ang app.
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Tumatanggap ng key at value; kino-convert ang value sa JSON at sine-save ito sa localStorage kapag nasa browser.
export function saveItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode, quota). Fail silently;
    // the app still works for the current session via in-memory state.
  }
}

// Tumatanggap ng key at inaalis ang katumbas na AYAB entry sa localStorage.
export function removeItem(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

// Walang input; inaalis sa localStorage ang lahat ng entry na may AYAB prefix.
export function clearAllAyabData(): void {
  if (!isBrowser()) return;
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
