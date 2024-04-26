import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { City, Country, State } from '../../types/countries';

@Injectable({
  providedIn: 'root',
})
export class CountriesAPIService {
  private baseUrl = 'https://api.countrystatecity.in/v1';

  constructor(private api: ApiService) {}

  // Get all cities
  getCountries(): Observable<Country> {
    return this.api.get(`${this.baseUrl}/countries`);
  }

  // Get all states by country
  getStates(countryIso: string): Observable<State> {
    return this.api.get(`${this.baseUrl}/countries/${countryIso}/states`);
  }

  // Get all cities by state and country id
  getCities(countryIso: string, stateIso: string): Observable<City> {
    return this.api.get(
      `${this.baseUrl}/countries/${countryIso}/states/${stateIso}/cities`
    );
  }
}
