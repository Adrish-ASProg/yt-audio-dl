import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {ConvertRequest} from "../model/convertrequest.model";


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class APIService {

  apiUrl: string = "http://localhost:8080";
  convertUrl: string = "/convert";
  statusUrl: string = "/status";
  downloadUrl: string = "/download";

  constructor(private http: HttpClient) {}

  /** POST: process new file */
  requestConvert(convertRequest: ConvertRequest): Observable<String> {
    return this.http.post<string>(`${this.apiUrl}${this.convertUrl}`, convertRequest, httpOptions);
  }
}
