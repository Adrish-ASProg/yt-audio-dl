import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {ConvertRequest} from "../model/convertrequest.model";
import {FileStatus} from "../model/filestatus.model";
import {Mp3Metadata} from "../model/mp3metadata.model";


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

    private apiUrl: string = "http://localhost:8080";
    private convertUrl: string = "/ytdl";
    private statusUrl: string = "/status/all";
    private downloadUrl: string = "/dl";
    private setTagsUrl: string = "/tags";

    constructor(private http: HttpClient) {}

    /** POST: process new file */
    requestConvert(convertRequest: ConvertRequest): Observable<{ uuid: string }> {
        return this.http.post<{ uuid: string }>(`${this.apiUrl}${this.convertUrl}`, convertRequest, jsonHttpOptions);
    }

    /** POST: download file */
    downloadFile(uuid: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}${this.downloadUrl}?uuid=${uuid}`, audioHttpOptions);
    }

    /** POST: set tags */
    setTags(uuid: string, metadata: Mp3Metadata): Observable<Mp3Metadata> {
        return this.http.post<Mp3Metadata>(
            `${this.apiUrl}${this.setTagsUrl}`,
            {uuid: uuid, metadata: metadata},
            jsonHttpOptions
        );
    }

    /** GET: get all files status */
    getAllFileStatus(): Observable<FileStatus[]> {
        return this.http.get<FileStatus[]>(`${this.apiUrl}${this.statusUrl}`, jsonHttpOptions);
    }
}
