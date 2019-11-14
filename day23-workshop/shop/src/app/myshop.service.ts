import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Order } from './models';

@Injectable()
export class MyShopService {
  constructor(private http: HttpClient) { }

  createOrder(order: Order): Promise<any> {
    return (
      this.http.post('/api/order', order)
        .toPromise()
    );
  }

  getOrder(orderId: number): Promise<Order> {
    return (
      this.http.get<Order>(`/api/order/${orderId}`)
        .toPromise()
    );
  }

}
