import { NgModule } from "@angular/core";
import { RouterModule, Routes } from '@angular/router';
import { MenuComponent } from './components/menu.component';
import { OrdersComponent } from './components/orders.component';
import { UpdateComponent } from './components/update.component';

const ROUTES: Routes = [
  { path: '', component: MenuComponent },
  { path: 'order', component: OrdersComponent },
  { path: 'order/:ordId', component: UpdateComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [ RouterModule.forRoot(ROUTES) ],
  exports: [ RouterModule ]
})
export class AppRouteModule { }
