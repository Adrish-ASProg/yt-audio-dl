import {Injectable} from '@angular/core';
import {YTDLUtils} from "../../utils/ytdl-utils";
import {Mp3Metadata} from "../../model/mp3metadata.model";
import {APIService} from "../api/api.service";
import {Observable} from "rxjs";
import {AppManagerModule} from "./app-manager.module";
import {Platform} from "@ionic/angular";
import {FileTransferService} from "../file-transfer/file-transfer.service";
import {HttpResponse} from "@angular/common/http";
import {LoadingService} from "../loading/loading.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UtilsService} from "../utils/utils.service";
import {RequestWithLoader} from "../utils/request-wrapper.util";
import {VideoInfo} from "../../model/videoinfo.model";
import {tap} from "rxjs/operators";

enum MimeType {
    AUDIO = "audio/mpeg",
    PLAYLIST = "application/x-mpegURL",
    ZIP = "application/zip"
}

@Injectable({providedIn: AppManagerModule})
export class AppManager {

    constructor(private platform: Platform,
                private snackBar: MatSnackBar,
                private apiService: APIService,
                private utilsService: UtilsService,
                private loadingService: LoadingService,
                private fileTransferService: FileTransferService) {
    }


    //#region Send_xxx_Request

    sendConvertRequest(params: string, selectFilesToDl: boolean) {
        const request = this.apiService.requestConvert(params, selectFilesToDl);
        return this.wrapRequestWithLoading(request, "Retrieving title(s)..");
    }

    sendConvertByIdRequest(videoInfos: VideoInfo[]) {
        const request = this.apiService.requestConvertById(videoInfos);
        return this.wrapRequestWithLoading(request, "Sending download request..");
    }

    sendAddToPlaylistRequest(playlistName: string, songsId: string[]) {
        const request = this.apiService.addFilesToPlaylist(playlistName, songsId);
        return this.wrapRequestWithLoading(request, "Adding files to playlist..")
            .pipe(tap(() => this.snackBar.open(`\u2714 Successfully updated playlist ${playlistName}`,
                "Dismiss", {duration: 1500})));
    }

    async sendPlaylistDownloadRequest(playlistName: string, songsDirectory: string) {
        const request = this.apiService.downloadPlaylist(playlistName, songsDirectory);
        await this.handleDownloadRequest(request, MimeType.PLAYLIST);
    }

    async sendDownloadRequest(id: string) {
        const request = this.apiService.downloadFile(id);
        await this.handleDownloadRequest(request, MimeType.AUDIO);
    }

    async handleDownloadRequest(observable: Observable<any>, mimeType: MimeType) {
        await this.loadingService.showDialog("Downloading file..");

        observable.subscribe(
            async (response: HttpResponse<any>) => {
                await this.loadingService.showDialog("Saving file as " + response.headers.get('X-File-Name'));

                this.handleBlobDownload(response.body, response.headers.get('X-File-Name'), mimeType)
                    .then(_ => this.handleSaveSuccess(), error => this.handleSaveError(error));
            },
            error => this.handleDownloadError(error)
        );
    }

    async sendDownloadAsZipRequest(ids: string[]) {
        await this.loadingService.showDialog("Downloading file..");

        this.apiService.downloadFilesAsZip(ids).subscribe(
            async (response: HttpResponse<any>) => {
                await this.loadingService.showDialog("Saving file as yt-audio-dl.zip");

                this.handleBlobDownload(response.body, 'yt-audio-dl.zip', MimeType.ZIP)
                    .then(_ => this.handleSaveSuccess(), error => this.handleSaveError(error));
            },
            error => this.handleDownloadError(error)
        );
    }

    sendDeleteRequest(ids: string[]): Observable<boolean> {
        const request = this.apiService.deleteFiles(ids);
        return this.wrapRequestWithLoading(request, "Deleting file(s)..");
    }

    sendTagRequest(id: string, name: string, metadata: Mp3Metadata): Observable<Mp3Metadata> {
        return this.apiService.setTags(id, name, metadata);
    }

    // #endregion


    //#region YT-dl

    handleBlobDownload(blob: Blob, filename: string, mimeType: MimeType): Promise<any> {
        // It is necessary to create a new blob object with mime-type explicitly set
        // otherwise only Chrome works like it should
        const newBlob = new Blob([blob], {type: mimeType});

        if (this.platform.is('cordova')) {
            return this.fileTransferService.writeBlobToStorage(newBlob, filename);
        } else {
            YTDLUtils.saveBlobToStorage(newBlob, filename);
            return new Promise(r => r());
        }
    }

    handleDownloadError(error) {
        this.loadingService.dismissDialog();
        alert(`Error ${error.status} when downloading file: ${error.statusText}`);
        if (error.error instanceof Blob) YTDLUtils.parseErrorBlob(error.error).subscribe(e => alert(e.message));
    }

    handleSaveError(error) {
        this.loadingService.dismissDialog();
        alert(`Error ${error.status} when saving file: ${error.statusText}`);
    }

    handleSaveSuccess() {
        this.loadingService.dismissDialog();
        this.snackBar.open("File downloaded successfully", "Hide", {duration: 1500});
    }

    // #endregion

    private wrapRequestWithLoading(request: Observable<any>, loadingMessage: string): Observable<any> {
        const wrappedRequest = new RequestWithLoader(request, this.loadingService, loadingMessage);
        return wrappedRequest.getObservable();
    }

}
