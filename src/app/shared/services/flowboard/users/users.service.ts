import { Injectable } from '@angular/core';
import { environment } from 'environments/development';
import { ApiService } from '../../api/api.service';
import { Observable } from 'rxjs';
import { Friend, Request, Status, User } from 'src/app/shared/types/user';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private BASE_URL = environment.flowboardAPI.base_url;
  private USER_ENDPOINT = environment.flowboardAPI.endpoints.user;
  private REQUEST_ENDPOINT = environment.flowboardAPI.endpoints.request;
  private FRIEND_ENDPOINT = environment.flowboardAPI.endpoints.friend;
  private API_KEY = environment.flowboardAPI.apikey.key;
  private headers: Headers;

  constructor(private api: ApiService) {
    this.headers = new Headers();
    if (this.API_KEY.key === '') return; // if there is no apikey then don't add it
    this.headers.append(this.API_KEY.key, this.API_KEY.value);
  }

  postUser(user: User): Observable<User> {
    const url = `${this.BASE_URL}${this.USER_ENDPOINT.user}`;
    return this.api.post<User>(url, user, this.headers);
  }

  getUser(email: string, password: string): Observable<User> {
    const url = `${this.BASE_URL}${this.USER_ENDPOINT.user}/${email}/${password}`;
    return this.api.get<User>(url, this.headers);
  }

  getUserById(user_id: number): Observable<User> {
    const url = `${this.BASE_URL}${this.USER_ENDPOINT.user}/${user_id}`;
    return this.api.get<User>(url, this.headers);
  }

  getUsersByUsername(username: string): Observable<User[]> {
    const url = `${this.BASE_URL}${this.USER_ENDPOINT.usernameSearch}${username}`;
    return this.api.get<User[]>(url, this.headers);
  }

  getUserByToken(token: string): Observable<User[]> {
    const url = `${this.BASE_URL}${this.USER_ENDPOINT.token}${token}`;
    return this.api.get<User[]>(url, this.headers);
  }

  getUsernameExists(username: string): Observable<boolean> {
    const url = `${this.BASE_URL}${this.USER_ENDPOINT.usernameExists}${username}`;
    return this.api.get<boolean>(url, this.headers);
  }

  getEmailExists(email: string) {
    const url = `${this.BASE_URL}${this.USER_ENDPOINT.emailExists}${email}`;
    return this.api.get<boolean>(url, this.headers);
  }

  deleteRequest(user1Id: number, user2Id: number): Observable<boolean> {
    const url = `${this.BASE_URL}${this.REQUEST_ENDPOINT.request}/${user1Id}/${user2Id}`;
    return this.api.delete(url, this.headers);
  }

  getRequests(userId: number): Observable<Request[]> {
    const url = `${this.BASE_URL}${this.REQUEST_ENDPOINT.request}/${userId}`;
    return this.api.get<Request[]>(url, this.headers);
  }

  putRequests(
    senderId: number,
    receiverId: number,
    status: number
  ): Observable<Request> {
    const url = `${this.BASE_URL}${this.REQUEST_ENDPOINT.request}`;
    return this.api.put(
      url,
      {
        senderId: senderId,
        receiverId: receiverId,
        status: status,
      },
      this.headers
    );
  }

  createRequests(senderId: number, receiverId: number): Observable<Request> {
    const url = `${this.BASE_URL}${this.REQUEST_ENDPOINT.request}`;
    return this.api.post(
      url,
      {
        senderId,
        receiverId,
      },
      this.headers
    );
  }

  deleteFriend(user1Id: number, user2Id: number): Observable<boolean> {
    const url = `${this.BASE_URL}${this.FRIEND_ENDPOINT.friend}/${user1Id}/${user2Id}`;
    return this.api.delete(url, this.headers);
  }

  getFriends(userId: number): Observable<Friend[]> {
    const url = `${this.BASE_URL}${this.FRIEND_ENDPOINT.friend}/${userId}`;
    return this.api.get<Friend[]>(url, this.headers);
  }
}
