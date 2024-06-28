import { AfterViewInit, Component } from '@angular/core';

import jQuery from 'jquery';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements AfterViewInit {
  constructor() {}

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
    });

    paths.on('mouseleave', (event) => {
      jQuery(event.currentTarget)
        .css('fill', 'var(--dark-land-color)')
	.css('stroke', 'var(--dark-border-color)');
    });

    paths.on('click', (event) => {
      // TODO Request data using World Bank API
    });
  }
}
