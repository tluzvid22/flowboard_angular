import { Injectable } from '@angular/core';
import { environment } from 'environments/development';
import { ApiService } from '../../api/api.service';
import { Observable } from 'rxjs';
import { User } from 'src/app/shared/types/user';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private BASE_URL = environment.flowboardAPI.base_url;
  private USER_ENDPOINT = environment.flowboardAPI.endpoints.user;
  private API_KEY = environment.flowboardAPI.apikey.key;
  private headers: Headers;

  constructor(private api: ApiService) {
    this.headers = new Headers();
    if (this.API_KEY.key === '') return; // if there is no apikey then don't add it
    this.headers.append(this.API_KEY.key, this.API_KEY.value);
  }

  postUser(user: User): Observable<User> {
    const url = `${this.BASE_URL}${this.USER_ENDPOINT}`;
    return this.api.post<User>(url, user, this.headers);
  }
}
