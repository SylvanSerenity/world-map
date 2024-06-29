import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _theme: string = 'theme-dark';

  toggleTheme() {
    this._theme = (this._theme === 'theme-light') ? 'theme-dark' : 'theme-light';
    document.documentElement.className = this._theme;
  }
}
