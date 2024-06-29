import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

export interface Country {
  code: string;
  name: string;
}
export interface CountryData {
  name: string;
  capital: string;
  region: string;
  incomeLevel: string;
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private _country: Country = {
    code: '',
    name: 'No Selection'
  };
  private _cachedCountries: Map<string, CountryData> = new Map();

  changeCountryEvent = new EventEmitter<Country>();
  changeCountryDataEvent = new EventEmitter<CountryData>();

  constructor(private _http: HttpClient) {}

  // Trigger the API call when a country is selected and set a local variable that will receive the information about the country
  private async _requestCountryData(countryCode: string): Promise<CountryData> {
    // Send the request
    const url = `http://api.worldbank.org/V2/country/${countryCode}?format=json`;
    const request = this._http.get<any>(url).pipe(
      map((jsonResponse) => {
	if (!jsonResponse || !jsonResponse[0] || !jsonResponse[0].total) {
          return {
            name: countryCode,
            capital: 'Unknown',
            region: 'Unknown',
            incomeLevel: 'Unknown',
            latitude: 0.0,
            longitude: 0.0
          } as CountryData;
	}
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
    let countryData: CountryData;
    if (!this._cachedCountries.has(countryCode)) {
      countryData = await this._requestCountryData(countryCode);
      this._cachedCountries.set(countryCode, countryData);
    } else {
      countryData = this._cachedCountries.get(countryCode) ?? {
        name: 'Unknown',
        capital: 'Unknown',
        region: 'Unknown',
        incomeLevel: 'Unknown',
        latitude: 0.0,
        longitude: 0.0
      }
    }
    this.changeCountryDataEvent.emit(countryData);
    return countryData;
  }
  
  set country(country: Country) {
    this._country = country;
    this.changeCountryEvent.emit(this._country);
  }
  
  get country() {
    return this._country;
  }
}
