import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavComponent } from "./nav/nav.component";
import { MapComponent } from './map/map.component';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [MapComponent, NavComponent, RouterOutlet]
})
export class AppComponent {}
