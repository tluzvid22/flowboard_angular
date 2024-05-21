import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'environments/development';
import { ApiService } from '../api/api.service';
import { Observable, map, of } from 'rxjs';
import { Token, User } from '../../types/user';
import { UsersService } from '../flowboard/users/users.service';
import { error } from 'console';

@Injectable({
  providedIn: 'root',
})
export class CookieServiceService {
  private BASE_URL = environment.flowboardAPI.base_url;
  private TOKEN_ENDPOINT = environment.flowboardAPI.endpoints.token;
  private API_KEY = environment.flowboardAPI.apikey.key;
  private headers: Headers;

  constructor(
    private api: ApiService,
    private cookieService: CookieService,
    private userService: UsersService
  ) {
    this.headers = new Headers();
    if (this.API_KEY.key === '') return; // if there is no apikey then don't add it
    this.headers.append(this.API_KEY.key, this.API_KEY.value);
  }

  postToken(token: Token): Observable<Token> {
    const url = `${this.BASE_URL}${this.TOKEN_ENDPOINT.token}`;
    return this.api.post<Token>(url, token, this.headers);
  }

  getAPIToken(userId: number): Observable<Token[]> {
    const url = `${this.BASE_URL}${this.TOKEN_ENDPOINT.token}/${userId}`;
    return this.api.get<Token[]>(url, this.headers);
  }

  deleteTokenByUserId(userId: number): Observable<Token> {
    const url = `${this.BASE_URL}${this.TOKEN_ENDPOINT.deleteTokenByUserId}${userId}`;
    return this.api.delete<Token>(url, this.headers);
  }

  deleteTokenByTokenValue(token: string): Observable<boolean> {
    const url = `${this.BASE_URL}${this.TOKEN_ENDPOINT.deleteTokenByTokenValue}${token}`;
    return this.api.delete<boolean>(url, this.headers);
  }

  async generateToken(userId: number): Promise<string> {
    const token = uuidv4();

    const response = await this.postToken({ value: token, userId: userId })
      .toPromise()
      .catch((error) => {
        console.log(error);
      });
    if (response) {
      const value = response.value;

      if (this.cookieService.check('authToken')) {
        this.cookieService.deleteAll('authToken');
      }

      this.cookieService.set('authToken', value);
      return value;
    }
    return '-1';
  }

  getLocalToken(): string {
    return this.cookieService.get('authToken');
  }

  compareTokens(): Observable<{ canLogin: boolean; userId: number }> {
    const localToken = this.getLocalToken();
    if (!localToken) return of({ canLogin: false, userId: -1 });

    return this.userService.getUserByToken(localToken).pipe(
      map((users: User[]) => {
        return users.length === 1
          ? { canLogin: true, userId: users[0].id as number }
          : { canLogin: false, userId: -1 };
      })
    );
  }

  clearTokenFromUserId(userId: number): void {
    this.deleteTokenByUserId(userId);
    this.cookieService.delete('authToken');
  }

  clearTokenFromTokenValue(): void {
    const localToken = this.getLocalToken();
    this.deleteTokenByTokenValue(localToken).subscribe(
      (response: boolean) => {
        if (response) this.cookieService.deleteAll('authToken');
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
