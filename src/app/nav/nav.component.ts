import { Component, OnDestroy, OnInit } from '@angular/core';

import jQuery from 'jquery';

import { Country, CountryService } from '../country.service';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit, OnDestroy {
  country: Country = {
    code: 'UN',
    name: 'Unknown'
  };
  currentTime: string = '';
  private _interval: any;

  constructor(private _countryService: CountryService, private _themeService: ThemeService) {}

  ngOnInit() {
    // Update the navbar with new Country info when hovered in the MapComponent
    this._countryService.changeCountryEvent.subscribe((country) => {
      this.country = country;
    });

    // Set current time
    this.currentTime = new Date().toTimeString();

    // Update current time every second
    this._interval = setInterval(() => {
      this.currentTime = new Date().toTimeString();
    }, 1000);

    // Toggle themes
    const theme = jQuery('#toggle-theme');
    theme.on('click', (event) => {
      this._themeService.toggleTheme();
    });
  }

  ngOnDestroy() {
    if (this._interval) {
      clearInterval(this._interval);
    }
  }
}
