import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {ConvertRequest} from "../model/convertrequest.model";
import {FileStatus} from "../model/filestatus.model";


const jsonHttpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
};

const audioHttpOptions = {
    headers: new HttpHeaders({'Content-Type': 'audio/mpeg'}),
    responseType: 'blob' as 'json',
    observe: 'response' as 'body'
};

@Injectable({
    providedIn: 'root'
})
export class APIService {

    apiUrl: string = "http://localhost:8080";
    convertUrl: string = "/convert";
    statusUrl: string = "/status/all";
    downloadUrl: string = "/download";

    constructor(private http: HttpClient) {}

    /** POST: process new file */
    requestConvert(convertRequest: ConvertRequest): Observable<{ uuid: string }> {
        return this.http.post<{ uuid: string }>(`${this.apiUrl}${this.convertUrl}`, convertRequest, jsonHttpOptions);
    }

    /** POST: download file */
    downloadFile(uuid: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}${this.downloadUrl}?uuid=${uuid}`, audioHttpOptions);
    }

    /** GET: get all files status */
    getAllFileStatus(): Observable<FileStatus[]> {
        return this.http.get<FileStatus[]>(`${this.apiUrl}${this.statusUrl}`, jsonHttpOptions);
    }
}
