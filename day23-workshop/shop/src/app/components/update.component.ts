import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MyShopService } from '../myshop.service';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { OrderDetail, Order } from '../models';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements OnInit {

  order: Order;
  orderDetails: FormArray;
  form: FormGroup = this.createForm({ email: '', orderDetails: [] })

  constructor(private myshopSvc: MyShopService, private fb: FormBuilder
    , private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    const ordId = this.activatedRoute.snapshot.params.orderId;
    this.myshopSvc.getOrder(ordId)
      .then(result => {
        console.info('result: ', result);
        this.order = result;
        this.form = this.createForm(result as Order);
        this.orderDetails = this.form.get('orderDetails') as FormArray
      })
      .catch(error => {
        alert(error)
      })
  }

  updateOrder() {

  }

  addOrderDetails() {

  }

  removeOrderDetails(idx) {

  }

  private createOrderDetails(od: OrderDetail): FormGroup {
    return (
      this.fb.group({
        description: this.fb.control(od.description, [ Validators.required ]),
        quantity: this.fb.control(od.quantity, [ Validators.required, Validators.min(1) ])
      })
    )
  }

  private createForm(order: Order): FormGroup {
      const ordDetails = this.fb.array([]);
      for (let od of order.orderDetails)
        ordDetails.push(this.createOrderDetails(od as OrderDetail));
      const ordForm = this.fb.group({
        email: this.fb.control(order.email, [ Validators.required, Validators.email, Validators.minLength(5) ]),
        orderDetails: ordDetails
      })
      return (ordForm)
  }

}
