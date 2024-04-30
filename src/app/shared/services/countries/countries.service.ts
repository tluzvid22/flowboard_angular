import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { City, Country, State } from '../../types/countries';
import { environment } from 'environments/development';

@Injectable({
  providedIn: 'root',
})
export class CountriesAPIService {
  private BASE_URL = environment.countriesAPI.base_url;
  private CITY_ENDPOINT = environment.countriesAPI.endpoints.city;
  private STATE_ENDPOINT = environment.countriesAPI.endpoints.state;
  private COUNTRY_ENDPOINT = environment.countriesAPI.endpoints.country;
  private API_KEY = environment.countriesAPI.apikey.key;
  private headers: Headers;

  private COUNTRY_PARAMSTRING =
    environment.countriesAPI.endpoints.country_param;
  private STATE_PARAMSTRING = environment.countriesAPI.endpoints.state_param;

  constructor(private api: ApiService) {
    this.headers = new Headers();
    this.headers.append(this.API_KEY.key, this.API_KEY.value);
  }

  // Get all cities
  getCountries = (): Observable<Country[]> => {
    const url = `${this.BASE_URL}${this.COUNTRY_ENDPOINT}`;
    return this.api.get(url, {
      headers: this.headers,
      responseType: 'json',
    });
  };

  // Get all states by country
  getStates = (countryIso: string): Observable<State[]> => {
    const url = `${this.BASE_URL}${this.STATE_ENDPOINT.replace(
      this.COUNTRY_PARAMSTRING,
      countryIso
    )}`;
    return this.api.get(url, { headers: this.headers, responseType: 'json' });
  };

  // Get all cities by state and country id
  getCities = (countryIso: string, stateIso: string): Observable<City[]> => {
    const url = `${this.BASE_URL}${this.CITY_ENDPOINT.replace(
      this.COUNTRY_PARAMSTRING,
      countryIso
    ).replace(this.STATE_PARAMSTRING, stateIso)}`;
    return this.api.get(url, { headers: this.headers, responseType: 'json' });
  };
}
