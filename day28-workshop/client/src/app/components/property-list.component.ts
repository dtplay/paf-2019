import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AirBnBService} from "../airbnb.service";
import {PropertyListing} from "../models";

@Component({
  selector: 'app-property-list',
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.css']
})
export class PropertyListComponent implements OnInit {

  country = '';
  listings: PropertyListing = { properties: [] }

  constructor(private activatedRoute: ActivatedRoute, private router: Router
              , private abnbSvc: AirBnBService) { }

  ngOnInit() {
    this.country = this.activatedRoute.snapshot.params.country;
    this.abnbSvc.getPropertiesForCountry(this.country)
      .then(result => {
        this.listings = result;
      })
      .catch(error => console.error('Error: ', error));
  }

  view(id) {
    this.router.navigate(['/property', id ])
  }

}
