import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { PropertyListComponent } from './components/property-list.component';
import {MainComponent} from "./components/main.component";
import {PropertyDetailComponent} from "./components/property-detail.component";

const ROUTES: Routes = [
  { path: '', component: MainComponent },
  { path: 'country/:country', component: PropertyListComponent },
  { path: 'property/:id', component: PropertyDetailComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full'}
];

@NgModule({
  imports: [ RouterModule.forRoot(ROUTES) ],
  exports: [ RouterModule ]
})
export class AppRouteModule { }
