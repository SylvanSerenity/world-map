import { AfterViewInit, Component } from '@angular/core';

import jQuery from 'jquery';

import { CountryService } from '../country.service';

export var Country:any;
export var CountryData:any;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements AfterViewInit {
  constructor(private _countryService: CountryService) {}

  ngAfterViewInit(): void {
    const paths = jQuery('path');

    paths.on('mouseenter', (event) => {
      const target = jQuery(event.currentTarget);
      jQuery(target)
        .css('fill', 'var(--highlight-color)')
	.css('stroke', 'var(--border-highlight-color)');

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
        .css('fill', 'var(--land-color)')
	.css('stroke', 'var(--border-color)');
    });

    paths.on('click', async (event) => {
	const target = jQuery(event.currentTarget);
	const countryCode = target.attr('id')?.toUpperCase() ?? 'UN';
	const countryData = await this._countryService.getCountryData(countryCode);
	console.log(countryData); // TODO Provide to map
    });
  }
}
