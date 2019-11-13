import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { OrdersComponent } from './components/orders.component';
import { MyShopService } from './myshop.service';

@NgModule({
  declarations: [
    AppComponent, OrdersComponent
  ],
  imports: [
    BrowserModule, HttpClientModule,
    FormsModule, ReactiveFormsModule
  ],
  providers: [ MyShopService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
