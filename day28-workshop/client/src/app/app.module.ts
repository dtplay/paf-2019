import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRouteModule } from './approute.module';
import { AirBnBService } from './airbnb.service';
import { PropertyListComponent } from './components/property-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MaterialModule} from "./material.module";
import { MainComponent } from './components/main.component';
import { PropertyDetailComponent } from './components/property-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    PropertyListComponent,
    MainComponent,
    PropertyDetailComponent
  ],
  imports: [
    BrowserModule, HttpClientModule,
    BrowserAnimationsModule,
    AppRouteModule, MaterialModule
  ],
  providers: [ AirBnBService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
