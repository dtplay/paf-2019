import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

import { Order, OrderDetail } from '../models';
import { MyShopService } from '../myshop.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  // like ngForm
  orderForm: FormGroup;
  orderDetails: FormArray;

  constructor(private fb: FormBuilder, private myShopSvc: MyShopService) { }

  ngOnInit() {
    //this.orderForm = this.createForm();
    //this.orderDetails = this.orderForm.get('orderDetails') as FormArray;

    this.orderDetails = this.fb.array([])
    this.orderForm = this.createForm(this.orderDetails);
  }

  checkout() {
    const order: Order = {
      email: this.orderForm.value['email'],
      orderDetails: []
    }
    for (let g = 0; g < this.orderDetails.length; g++) {
      const fg: FormGroup = this.orderDetails.controls[g] as FormGroup;
      order.orderDetails.push({
        description: fg.value['description'],
        quantity: parseInt(fg.value['quantity']) || 1
      } as OrderDetail);
    }
    this.myShopSvc.createOrder(order)
      .then(() => {
        console.info('created')
        this.orderDetails = this.fb.array([]);
        this.orderForm.controls['orderDetails'] = this.orderDetails;
        this.orderForm.reset();
      })
      .catch(err => console.error('error: ', err));
  }

  addOrderDetails() {
    this.orderDetails.push(this.createOrderDetails());
  }

  removeOrderDetails(idx: number) {
    this.orderDetails.removeAt(idx);
  }

  private createOrderDetails(): FormGroup {
    return (
      this.fb.group({
        description: this.fb.control('', [ Validators.required ]),
        quantity: this.fb.control('1', [ Validators.required, Validators.min(1) ])
      })
    )
  }

  private createForm(od: FormArray = null): FormGroup {
    return (
      this.fb.group({
        email: this.fb.control('', [ Validators.required, Validators.email, Validators.minLength(5) ]),
        orderDetails: od || this.fb.array([])
      })
    );
  }

}
