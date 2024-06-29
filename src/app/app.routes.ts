import { Routes } from "@angular/router";
import { MapComponent } from "./map/map.component";
import { NotFoundComponent } from "./not-found/not-found.component";

export const routes: Routes = [
  { path: '', redirectTo: '/world-map', pathMatch: 'full' },
  { path: 'world-map', component: MapComponent },
  { path: '**', component: NotFoundComponent }
];