import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Mp3Metadata} from "../../model/mp3metadata.model";
import {APIModule} from "./api.module";
import {SettingsService} from "../settings/settings.service";
import {FileStatusResponse} from "../../model/filestatus-response.model";
import {VideoInfo} from "../../model/videoinfo.model";
import {Playlist} from "../../model/playlist.model";


const jsonHttpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
};

const blobHttpOptions = {
    responseType: 'blob' as 'json',
    observe: 'response' as 'body'
};

const zipHttpOptions = {
    responseType: 'arraybuffer' as 'json',
    observe: 'response' as 'body'
};


@Injectable({providedIn: APIModule})
export class APIService {

    constructor(private http: HttpClient,
                private settings: SettingsService) {
    }

    private convertUrl: string = "/ytdl";
    private convertByIdUrl: string = "/ytdl-id";
    private statusUrl: string = "/status";
    private downloadUrl: string = "/dl";
    private downloadAsZipUrl: string = "/dl-zip";
    private playlistsUrl: string = "/playlists";
    private setTagsUrl: string = "/tags";
    private deleteUrl: string = "/delete";
    private playUrl: string = "/play";

    get apiUrl() {
        return this.settings.getServerAddress();
    }

    /** POST: process new file */
    requestConvert(url: string, selectFiles: boolean): Observable<{ id: string }> {
        const body = {url, selectFiles};
        return this.http.post<{ id: string }>(`${this.apiUrl}${this.convertUrl}`, body, jsonHttpOptions);
    }

    requestConvertById(videoInfos: VideoInfo[]): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}${this.convertByIdUrl}`, videoInfos, jsonHttpOptions);
    }

    /** POST: download file */
    downloadFile(id: string): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}${this.downloadUrl}`,
            {id: id},
            blobHttpOptions
        );
    }

    /** POST: download files as zip */
    downloadFilesAsZip(ids: string[]): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}${this.downloadAsZipUrl}`,
            {ids: ids},
            zipHttpOptions
        );
    }

    /** GET: get playlists */
    getPlaylists(): Observable<Playlist[]> {
        return this.http.get<any>(
            `${this.apiUrl}${this.playlistsUrl}`,
            jsonHttpOptions
        );
    }

    /** POST: update playlist */
    updatePlaylist(playlist: Playlist): Observable<Playlist> {
        return this.http.post<any>(
            `${this.apiUrl}${this.playlistsUrl}`,
            playlist,
            jsonHttpOptions
        );
    }

    /** POST: add files to playlist */
    addFilesToPlaylist(playlistName: string, filesIds: string[]): Observable<Playlist> {
        return this.http.post<any>(
            `${this.apiUrl}${this.playlistsUrl}/${playlistName}/add`,
            filesIds,
            jsonHttpOptions
        );
    }

    /** POST: rename playlist */
    renamePlaylist(playlistName: string, newPlaylistName: string): Observable<Playlist> {
        return this.http.post<any>(
            `${this.apiUrl}${this.playlistsUrl}/${playlistName}/rename`,
            newPlaylistName,
            jsonHttpOptions
        );
    }

    /** DELETE: delete playlist */
    deletePlaylist(playlistName: string): Observable<any> {
        return this.http.delete<any>(
            `${this.apiUrl}${this.playlistsUrl}/${playlistName}`,
            jsonHttpOptions
        );
    }

    /** POST: download playlist */
    downloadPlaylist(playlistName: string, songsDirectory: string): Observable<any> {
        return this.http.post<any>(
            `${this.apiUrl}${this.playlistsUrl}/${playlistName}/download`,
            songsDirectory,
            blobHttpOptions
        );
    }

    /** POST: set tags */
    setTags(id: string, name: string, metadata: Mp3Metadata): Observable<Mp3Metadata> {
        return this.http.post<Mp3Metadata>(
            `${this.apiUrl}${this.setTagsUrl}`,
            {id: id, name: name, metadata: metadata},
            jsonHttpOptions
        );
    }

    /** GET: get files status */
    getFileStatus(filter = "", sort = {}, pageIndex = 0, pageSize = 10): Observable<FileStatusResponse> {
        const params = {filter, sort, pageIndex, pageSize};
        return this.http.post<FileStatusResponse>(`${this.apiUrl}${this.statusUrl}`, params, jsonHttpOptions);
    }

    /** DELETE: delete files */
    deleteFiles(ids: string[]): Observable<boolean> {
        return this.http.post<boolean>(
            `${this.apiUrl}${this.deleteUrl}`,
            ids,
            jsonHttpOptions
        );
    }

    getSongUrl(id: string): string {
        return `${this.apiUrl}${this.playUrl}?id=${id}`;
    }
}
