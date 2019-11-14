import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  form: FormGroup

  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    this.form = this.fb.group({
      orderId: this.fb.control('', [ Validators.required ])
    })
  }

  search() {
    console.info('orderId: ', this.form.value['orderId']);
    this.router.navigate(['/order', this.form.value['orderId']])
    this.form.reset();
  }

}
