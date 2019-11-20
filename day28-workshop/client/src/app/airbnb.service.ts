import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http'
import {CountryList, PropertyDetail, PropertyListing} from './models';

@Injectable()
export class AirBnBService {
  constructor(private http: HttpClient) { }

  getCountryList(): Promise<CountryList> {
    return (
      this.http.get<CountryList>('/api/countries')
        .toPromise()
    );
  }

  getPropertiesForCountry(country): Promise<PropertyListing> {
    return (
      this.http.get<PropertyListing>(`/api/country/${country}`)
        .toPromise()
    );
  }

  getPropertyDetail(id): Promise<PropertyDetail> {
    return (
      this.http.get<PropertyDetail>(`/api/property/${id}`)
        .toPromise()
    );
  }

}
