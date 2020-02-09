import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {FileStatus} from "../../model/filestatus.model";
import {Mp3Metadata} from "../../model/mp3metadata.model";
import {APIModule} from "./api.module";


const jsonHttpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
};

const audioHttpOptions = {
    headers: new HttpHeaders({'Content-Type': 'audio/mpeg'}),
    responseType: 'blob' as 'json',
    observe: 'response' as 'body'
};

const zipHttpOptions = {
    responseType: 'arraybuffer' as 'json',
    observe: 'response' as 'body'
};

@Injectable({providedIn: APIModule})
export class APIService {

    private apiUrl: string = "http://localhost:8080";
    private convertUrl: string = "/ytdl";
    private statusUrl: string = "/status/all";
    private downloadUrl: string = "/dl";
    private downloadAsZipUrl: string = "/dl-zip";
    private setTagsUrl: string = "/tags";
    private deleteUrl: string = "/delete";

    constructor(private http: HttpClient) {}

    /** POST: process new file */
    requestConvert(url: string): Observable<{ uuid: string }> {
        return this.http.post<{ uuid: string }>(`${this.apiUrl}${this.convertUrl}`, {url: url, audioOnly: true}, jsonHttpOptions);
    }

    /** POST: download file */
    downloadFile(uuid: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}${this.downloadUrl}?uuid=${uuid}`, audioHttpOptions);
    }

    /** POST: download files as zip */
    downloadFilesAsZip(uuids: string[]): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}${this.downloadAsZipUrl}`,
            uuids, zipHttpOptions
        );
    }

    /** POST: set tags */
    setTags(uuid: string, name: string, metadata: Mp3Metadata): Observable<Mp3Metadata> {
        return this.http.post<Mp3Metadata>(
            `${this.apiUrl}${this.setTagsUrl}`,
            {uuid: uuid, name: name, metadata: metadata},
            jsonHttpOptions
        );
    }

    /** GET: get all files status */
    getAllFileStatus(): Observable<FileStatus[]> {
        return this.http.get<FileStatus[]>(`${this.apiUrl}${this.statusUrl}`, jsonHttpOptions);
    }

    /** DELETE: delete files */
    deleteFiles(uuids: string[]): Observable<boolean> {
        return this.http.post<boolean>(
            `${this.apiUrl}${this.deleteUrl}`,
            uuids,
            jsonHttpOptions
        );
    }
}
