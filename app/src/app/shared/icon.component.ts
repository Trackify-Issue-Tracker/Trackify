import { Component, Input } from '@angular/core';

// Simple 24px stroke icons. Each one is a single path so the component stays tiny.
const ICONS: Record<string, string> = {
  'plus': 'M12 5v14M5 12h14',
  'x': 'M18 6 6 18M6 6l12 12',
  'search': 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.3-4.3',
  'trash': 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6',
  'pencil': 'M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4',
  'clock': 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  'arrow-left': 'M19 12H5M12 19l-7-7 7-7',
  'grid': 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  'folder': 'M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z',
  'list': 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  'bug': 'M9 9V7a3 3 0 0 1 6 0v2M7 9h10v6a5 5 0 0 1-10 0V9zM12 14v7M3 13h4M17 13h4M4 6l3 2M20 6l-3 2M4 20l3-3M20 20l-3-3',
  'check-circle': 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 12.5l2.5 2.5 4.5-5',
  'trending-up': 'M3 17l6-6 4 4 8-8M15 7h6v6',
  'sparkle': 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
  'tag': 'M3 12V3h9l9 9-9 9-9-9zM7.5 7.5h.01',
  'sun': 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  'moon': 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  'monitor': 'M3 5h18v11H3zM8 20h8M12 16v4',
  'logo': 'M5 12.5l4.5 4.5L19 7',
};

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="path" /></svg>`,
  styles: [`:host { display: inline-flex; width: 1em; height: 1em; flex: none; } svg { width: 100%; height: 100%; }`],
})
export class IconComponent {
  @Input() name = '';

  get path(): string {
    return ICONS[this.name] ?? '';
  }
}
