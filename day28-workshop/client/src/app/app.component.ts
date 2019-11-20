import {Component, ViewChild} from '@angular/core';
import {CountryList} from "./models";
import {AirBnBService} from "./airbnb.service";
import {MatSidenav} from "@angular/material/sidenav";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild('drawer', { static: false })
  drawer: MatSidenav;

  countries: CountryList = { countries: [] }

  constructor(private abnbSvc: AirBnBService, private router: Router) { }

  ngOnInit() {
    this.abnbSvc.getCountryList()
      .then(result => this.countries = result);
  }

  listProperties(country) {
    this.router.navigate(['/country', country])
    this.drawer.close();
  }
}
