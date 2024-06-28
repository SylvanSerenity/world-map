import { EventEmitter, Injectable } from '@angular/core';

export interface Country {
  code: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private _country: Country = {
    code: 'UN',
    name: 'Unknown'
  };
  changeCountryEvent = new EventEmitter<Country>();
  
  set country(country: Country) {
    this._country = country;
    this.changeCountryEvent.emit(this._country);
  }
  
  get country() {
    return this._country;
  }
}
