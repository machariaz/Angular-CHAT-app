import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkTheme = 'dark-theme';

  constructor() {
    this.loadTheme();
  }

  private loadTheme(): void {
    const theme = localStorage.getItem('theme');
    if (theme) {
      document.body.classList.add(theme);
    }
  }

  toggleTheme(): void {
    if (document.body.classList.contains(this.darkTheme)) {
      document.body.classList.remove(this.darkTheme);
      localStorage.setItem('theme', '');
    } else {
      document.body.classList.add(this.darkTheme);
      localStorage.setItem('theme', this.darkTheme);
    }
  }

  // Optional: Detect system theme preference
  private detectSystemTheme(): void {
    const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkTheme) {
      document.body.classList.add(this.darkTheme);
    }
  }
}
