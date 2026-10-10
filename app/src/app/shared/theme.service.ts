import { Injectable, effect, signal } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'trackify-theme';

/** Light/dark theme. 'system' follows the OS setting. Applied as data-theme on <html>, see styles.css. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  mode = signal<ThemeMode>(this.read());
  private media = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    effect(() => {
      const mode = this.mode();
      this.apply(mode);
      try {
        if (mode === 'system') { localStorage.removeItem(STORAGE_KEY); } else { localStorage.setItem(STORAGE_KEY, mode); }
      } catch { /* storage can be unavailable, the theme just will not be remembered */ }
    });
    // While on 'system', follow the OS when it switches between light and dark
    this.media.addEventListener('change', () => {
      if (this.mode() === 'system') { this.apply('system'); }
    });
  }

  set(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  private apply(mode: ThemeMode): void {
    const dark = mode === 'dark' || (mode === 'system' && this.media.matches);
    document.documentElement.dataset['theme'] = dark ? 'dark' : 'light';
  }

  private read(): ThemeMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'light' || saved === 'dark' ? saved : 'system';
    } catch {
      return 'system';
    }
  }
}
