import { Component, OnInit } from '@angular/core';

import { CountryData, CountryService } from '../country.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit {
  countryData: CountryData = {
    name: 'Unknown',
    capital: 'Unknown',
    region: 'Unknown',
    incomeLevel: 'Unknown',
    latitude: 0.0,
    longitude: 0.0
  };

  location: string = '0.0, 0.0';

  constructor(private _countryService: CountryService) {}

  ngOnInit(): void {
    // Update the country details in the details box
    this._countryService.changeCountryDataEvent.subscribe((countryData) => {
      this.countryData = countryData;
      const latitude = countryData.latitude;
      const longitude = countryData.longitude;
      this.location = `${latitude}°${(countryData.latitude > 0) ? 'N' : 'S'}, ${longitude}°${(countryData.longitude > 0) ? 'E' : 'W'}`
    });
  }
}
