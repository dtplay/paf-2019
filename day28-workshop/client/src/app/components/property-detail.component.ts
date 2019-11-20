import { Component, OnInit } from '@angular/core';
import {AirBnBService} from "../airbnb.service";
import {PropertyDetail} from "../models";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.css']
})
export class PropertyDetailComponent implements OnInit {

  propertyDetail: PropertyDetail;

  constructor(private abnbSvc: AirBnBService, private activateRoute: ActivatedRoute) { }

  ngOnInit() {
    this.abnbSvc.getPropertyDetail(this.activateRoute.snapshot.params.id)
      .then(result => {
        this.propertyDetail = result;
        console.info(this.propertyDetail)
      })
      .catch(error => {
        console.error(error);
      })
  }

}
