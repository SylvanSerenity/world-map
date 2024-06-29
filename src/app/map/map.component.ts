import { AfterViewInit, Component } from '@angular/core';

import jQuery from 'jquery';

import { ReferencesComponent } from "../references/references.component";
import { DetailComponent } from "../detail/detail.component";
import { CountryService } from '../country.service';

export var Country:any;
export var CountryData:any;

@Component({
    selector: 'app-map',
    standalone: true,
    templateUrl: './map.component.html',
    styleUrl: './map.component.css',
    imports: [ReferencesComponent, DetailComponent]
})
export class MapComponent implements AfterViewInit {
  private _mapElement: (JQuery<HTMLElement> | null) = null;

  // Scale (zoom)
  private _minScale: number = 1;
  private _maxScale: number = 20;
  private _scale: number = 1;
  private _scaleFactor: number = 1.1; // NOTE: Exponentially scale to keep the same zoom speed

  // Translation (drag)
  private _isDragging = false;
  private _startDragX = 0;
  private _startDragY = 0;
  private _startViewBoxX = 0;
  private _startViewBoxY = 0;

  // Transform
  private _viewBox: ({ x: number, y: number, width: number, height: number } | null) = null;

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

	// Set new country data
	this._countryService.country = {
	  code: '',
	  name: 'No Selection'
	};
    });

    // Fetch data from World Bank API on country click
    paths.on('click', (event) => {
	const target = jQuery(event.currentTarget);
	const countryCode = target.attr('id')?.toUpperCase() ?? 'UN';
	this._countryService.getCountryData(countryCode);
    });
    
    // Allow map zooming
    this._mapElement = jQuery('#map-content');
    if (this._mapElement) {
      const svgElement = this._mapElement[0] as unknown as SVGSVGElement;
      const rect = svgElement.getBoundingClientRect();
      const aspectRatio = rect.width / rect.height;
      this._viewBox = {
	x: svgElement.viewBox.baseVal.x,
	y: svgElement.viewBox.baseVal.y + (svgElement.viewBox.baseVal.height / 4),
	width: svgElement.viewBox.baseVal.width,
	height: svgElement.viewBox.baseVal.width / aspectRatio
      };
      // Set initial view box
      this._updateViewBox(rect.width / 2, rect.height / 1.5, 0.5);

      // Track scroll wheel
      this._mapElement.on('wheel', (event: any) => {
	event.preventDefault();
  
	if (event.originalEvent.deltaY < 0) this._zoomIn(event.clientX, event.clientY);
	else this._zoomOut(event.clientX, event.clientY);
      });

      // Track drag
      this._mapElement.on('mousedown', (event: any) => {
        event.preventDefault();
	this._startDragging(event);
      });
      jQuery(document).on('mouseup', (event: any) => {
	if (this._isDragging) {
	  this._stopDragging();
	}
      });

      jQuery(document).on('mousemove', (event: any) => {
	if (this._isDragging) {
	  this._dragging(event);
	}
      });
    }
  }

  /* Zoom functions */
  private _zoomIn(mouseX: number, mouseY: number) {
    if (this._scale < this._maxScale) {
      this._scale *= this._scaleFactor;
      this._updateViewBox(mouseX, mouseY, this._scaleFactor);
    }
  }

  private _zoomOut(mouseX: number, mouseY: number) {
    if (this._scale > this._minScale) {
      this._scale /= this._scaleFactor;
      this._updateViewBox(mouseX, mouseY, 1 / this._scaleFactor);
    }
  }

  private _updateViewBox(mouseX: number, mouseY: number, scaleFactor: number) {
    if (this._mapElement && this._viewBox) {
      const svgElement = this._mapElement[0] as unknown as SVGSVGElement;
      const rect = svgElement.getBoundingClientRect();
      const offsetX = mouseX - rect.left;
      const offsetY = mouseY - rect.top;

      // Get the mouse position's absolute coordinates on the map for zooming
      const pointerCoordinateX = this._viewBox.x + ((offsetX / rect.width) * this._viewBox.width);
      const pointerCoordinateY = this._viewBox.y + ((offsetY / rect.height) * this._viewBox.height);

      this._viewBox.x = pointerCoordinateX - ((pointerCoordinateX - this._viewBox.x) / scaleFactor);
      this._viewBox.y = pointerCoordinateY- ((pointerCoordinateY - this._viewBox.y) / scaleFactor);
      this._viewBox.width = this._viewBox.width / scaleFactor;
      this._viewBox.height = this._viewBox.height / scaleFactor;

      svgElement.setAttribute('viewBox', `${this._viewBox.x} ${this._viewBox.y} ${this._viewBox.width} ${this._viewBox.height}`);
    }
  }

  /* Drag functions */
  private _startDragging(event: MouseEvent): void {
    if (this._mapElement && this._viewBox) {
      this._isDragging = true;
      this._startDragX = event.clientX;
      this._startDragY = event.clientY;
      this._startViewBoxX = this._viewBox.x;
      this._startViewBoxY = this._viewBox.y;
    }
  }
  private _stopDragging(): void {
    this._isDragging = false;
  }
  private _dragging(event: MouseEvent): void {
    if (this._mapElement && this._viewBox) {
      // Translate
      const deltaX = (event.clientX - this._startDragX) * (this._viewBox.width / this._mapElement[0].getBoundingClientRect().width);
      const deltaY = (event.clientY - this._startDragY) * (this._viewBox.height / this._mapElement[0].getBoundingClientRect().height);

      this._viewBox.x = this._startViewBoxX - deltaX;
      this._viewBox.y = this._startViewBoxY - deltaY;

      const svgElement = this._mapElement[0] as unknown as SVGSVGElement;
      svgElement.setAttribute('viewBox', `${this._viewBox.x} ${this._viewBox.y} ${this._viewBox.width} ${this._viewBox.height}`);
    }
  }
}
