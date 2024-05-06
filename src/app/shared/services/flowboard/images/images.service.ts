import { Injectable } from '@angular/core';
import { environment } from 'environments/development';
import { ApiService } from '../../api/api.service';
import { Image } from 'src/app/shared/types/images';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  private BASE_URL = environment.flowboardAPI.base_url;
  private IMAGE_ENDPOINT = environment.flowboardAPI.endpoints.image;
  private API_KEY = environment.flowboardAPI.apikey.key;
  private headers: Headers;

  constructor(private api: ApiService) {
    this.headers = new Headers();
    if (this.API_KEY.key === '') return; // if there is no apikey then don't add it
    this.headers.append(this.API_KEY.key, this.API_KEY.value);
  }

  postImage(image: FormData | File): Observable<Image> {
    const url = `${this.BASE_URL}${this.IMAGE_ENDPOINT}`;
    return this.api.post<Image>(url, image, this.headers);
  }

  getImage(imageId: number): Observable<Image> {
    const url = `${this.BASE_URL}${this.IMAGE_ENDPOINT}/${imageId}`;
    return this.api.get<Image>(url, this.headers);
  }
}
