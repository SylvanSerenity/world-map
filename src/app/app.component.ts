import { Component } from '@angular/core';
import { MapComponent } from './map/map.component';
import { NavComponent } from "./nav/nav.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [MapComponent, NavComponent]
})
export class AppComponent {}
