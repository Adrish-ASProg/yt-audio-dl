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

    sendConvertRequest(params: string) {
        const request = this.apiService.requestConvert(params);
        return this.wrapRequestWithLoading(request, "Retrieving title(s)..");
    }

    async sendDownloadRequest(id: string) {
        await this.loadingService.showDialog("Downloading file..");

        this.apiService.downloadFile(id).subscribe(
            async (response: HttpResponse<any>) => {
                await this.loadingService.showDialog("Saving file as " + response.headers.get('FileName'));

                this.handleBlobDownload(response.body, response.headers.get('FileName'), 'audio/mpeg')
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

                this.handleBlobDownload(response.body, 'yt-audio-dl.zip', 'application/zip')
                    .then(_ => this.handleSaveSuccess(), error => this.handleSaveError(error));
            },
            error => this.handleDownloadError(error)
        );
    }

    sendDeleteRequest(ids: string[]): Observable<boolean> {
        const request = this.apiService.deleteFiles(ids);
        return this.wrapRequestWithLoading(request, "Deleting file(s)..");
    }

    sendListenRequest(id: string): void {
        this.apiService.listenSong(id);
    }

    sendTagRequest(id: string, name: string, metadata: Mp3Metadata): Observable<Mp3Metadata> {
        return this.apiService.setTags(id, name, metadata);
    }

    // #endregion


    //#region YT-dl

    handleBlobDownload(blob: Blob, filename: string, mimeType: 'audio/mpeg' | 'application/zip'): Promise<any> {
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
