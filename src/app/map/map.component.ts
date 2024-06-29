import { AfterViewInit, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import jQuery from 'jquery';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

import { CountryService } from '../country.service';

export var Country:any;
export interface CountryData {
  name: string;
  capital: string;
  region: string;
  incomeLevel: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements AfterViewInit {
  private _defaultCountryData = {
    name: 'Unknown',
    capital: 'Unknown',
    region: 'Unknown',
    incomeLevel: 'Unknown',
    latitude: 0.0,
    longitude: 0.0
  }
  private _cachedCountries: Map<string, CountryData> = new Map();

  constructor(private _countryService: CountryService, private _http: HttpClient) {}

  // Trigger the API call when a country is selected and set a local variable that will receive the information about the country
  async requestCountryData(countryCode: string): Promise<CountryData> {
    // Send the request
    const url = `http://api.worldbank.org/V2/country/${countryCode}?format=json`;
    const request = this._http.get<any>(url).pipe(
      map((jsonResponse) => {
	// NOTE: [1] gets the actual content (skips metadata), [0] gets the first result from the query
	const countryInfo = jsonResponse[1][0];
	return {
          name: countryInfo.name,
	  capital: countryInfo.capitalCity,
	  region: countryInfo.region.value,
	  incomeLevel: countryInfo.incomeLevel.value,
	  latitude: countryInfo.latitude,
	  longitude: countryInfo.longitude
	} as CountryData;
      })
    );
    return await firstValueFrom(request);
  }

  // Accepts a country code as an input parameter that returns additional information gathered from the API for the selected country
  async getCountryData(countryCode: string): Promise<CountryData> {
    if (!this._cachedCountries.has(countryCode)) {
      const countryData = await this.requestCountryData(countryCode);
      this._cachedCountries.set(countryCode, countryData);
      return countryData;
    }
    return this._cachedCountries.get(countryCode) ?? this._defaultCountryData;
  }

  ngAfterViewInit(): void {
    const paths = jQuery('path');

    paths.on('mouseenter', (event) => {
      const target = jQuery(event.currentTarget);
      jQuery(target)
        .css('fill', 'var(--dark-highlight-color)')
	.css('stroke', 'var(--dark-border-highlight-color)');

      // Move to the end of the SVG to bring the country to the front
      // (Prevents land-locked countries' stroke from being hidden under bordering countries' stroke)
      target.appendTo(target.parent());

      // Set new country data
      this._countryService.country = {
	code: target.attr('id')?.toUpperCase() ?? 'UN',
	name: target.attr('name') ?? 'Unknown'
      };
    });

    paths.on('mouseleave', (event) => {
      jQuery(event.currentTarget)
        .css('fill', 'var(--dark-land-color)')
	.css('stroke', 'var(--dark-border-color)');
    });

    paths.on('click', async (event) => {
	const target = jQuery(event.currentTarget);
	const countryCode = target.attr('id')?.toUpperCase() ?? 'UN';
	const countryData = await this.getCountryData(countryCode);
	console.log(countryData); // TODO Provide to map
    });
  }
}
