import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRouteModule } from './approute.module';

import { MyShopService } from './myshop.service';

import { AppComponent } from './app.component';
import { OrdersComponent } from './components/orders.component';
import { MenuComponent } from './components/menu.component';
import { UpdateComponent } from './components/update.component';

@NgModule({
  declarations: [
    AppComponent, OrdersComponent, MenuComponent, UpdateComponent
  ],
  imports: [
    BrowserModule, HttpClientModule,
    FormsModule, ReactiveFormsModule,
    AppRouteModule
  ],
  providers: [ MyShopService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
