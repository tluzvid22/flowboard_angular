import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { City, Country, State } from '../../types/countries';
import { environment } from 'environments/development';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CountriesAPIService {
  private BASE_URL = environment.countriesAPI.base_url;
  private LANGUAGE_RESPONSE = environment.countriesAPI.language;
  private CITY_ENDPOINT = environment.countriesAPI.endpoint_city;
  private STATE_ENDPOINT = environment.countriesAPI.endpoint_state;
  private COUNTRY_ENDPOINT = environment.countriesAPI.endpoint_country;
  private API_HOST = environment.countriesAPI.apikey.host;
  private API_KEY = environment.countriesAPI.apikey.key;
  private headers: Headers;

  /*https://referential.p.rapidapi.com/v1/country?lang=ES
  https://referential.p.rapidapi.com/v1/city?iso_a2=es&state_code=ES-MA  
  https://referential.p.rapidapi.com/v1/state?iso_a2=ES&lang=es*/

  constructor(private api: ApiService) {
    this.headers = new Headers();
    this.headers.append(this.API_HOST.key, this.API_HOST.value);
    this.headers.append(this.API_KEY.key, this.API_KEY.value);
  }

  // Get all cities
  getCountries = (): Observable<Country[]> => {
    return this.api.get(
      `${this.BASE_URL}${this.COUNTRY_ENDPOINT}?lang=${this.LANGUAGE_RESPONSE}`,
      { headers: this.headers, responseType: 'json' }
    );
  };

  // Get all states by country
  getStates = (countryIso: string): Observable<State[]> => {
    return this.api.get(
      `${this.BASE_URL}${this.STATE_ENDPOINT}?fields=iso_a2&iso_a2=${countryIso}&lang=${this.LANGUAGE_RESPONSE}*/`,
      { headers: this.headers, responseType: 'json' }
    );
  };

  // Get all cities by state and country id
  getCities = (countryIso: string, stateIso: string): Observable<City[]> => {
    return this.api.get(
      `${this.BASE_URL}${this.CITY_ENDPOINT}?fields=iso_a2%2C%20state_code&iso_a2=${countryIso}&state_code=${stateIso}&lang=${this.LANGUAGE_RESPONSE}`,
      { headers: this.headers, responseType: 'json' }
    );
  };
}
