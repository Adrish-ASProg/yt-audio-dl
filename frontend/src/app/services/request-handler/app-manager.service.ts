import {Injectable} from '@angular/core';
import {YTDLUtils} from "../../utils/ytdl-utils";
import {Mp3Metadata} from "../../model/mp3metadata.model";
import {APIService} from "../api/api.service";
import {interval, Observable, Subject, Subscription} from "rxjs";
import {flatMap} from "rxjs/operators";
import {FileStatus} from "../../model/filestatus.model";
import {SettingsService} from "../settings/settings.service";
import {AppManagerModule} from "./app-manager.module";
import {Platform} from "@ionic/angular";
import {FileTransferService} from "../file-transfer/file-transfer.service";
import {HttpResponse} from "@angular/common/http";
import {LoadingService} from "../loading/loading.service";

@Injectable({providedIn: AppManagerModule})
export class AppManager {

    filesStatus: FileStatus[] = [];
    onFilesStatusUpdated: Subject<FileStatus[]> = new Subject<FileStatus[]>();

    refreshRate: number = 3000;
    isServerOn: boolean = false;

    isAutoUpdateRunning: boolean = false;
    autoUpdateObservable: Subscription;

    constructor(private platform: Platform,
                private apiService: APIService,
                private settingsService: SettingsService,
                private loadingService: LoadingService,
                private fileTransferService: FileTransferService) {

        // Send first update immediately
        this.sendUpdateRequest().subscribe(fs => this.onUpdateReceived(fs));

        this.getSettings();
    }

    getSettings(): void {
        this.refreshRate = this.settingsService.getRefreshRate();
        this.runAutomaticUpdate();
    }

    runAutomaticUpdate() {
        if (this.autoUpdateObservable) this.autoUpdateObservable.unsubscribe();

        // Send update request at <refreshRate> interval
        this.autoUpdateObservable = interval(this.refreshRate)
            .pipe(flatMap(() => this.sendUpdateRequest()))
            .subscribe(filesStatus => this.onUpdateReceived(filesStatus),
                response => {
                    this.isServerOn = false;
                    console.error("Unable to retrieve files status from server, stopping automatic updates.", response.error);
                    if (response.error != void 0 && response.error.message != void 0)
                        alert(response.error.message);
                });

    }

    onUpdateReceived(filesStatus: FileStatus[]): void {
        this.isServerOn = true;

        // Remove old file status
        this.filesStatus = this.filesStatus.filter(fs => filesStatus.find(f => f.id === fs.id));

        // Add / Edit each filestatus rather than replace them (deal with reference issues)
        filesStatus.forEach(fs => {
            const oldFileStatus = this.filesStatus.find(f => f.id === fs.id);
            if (oldFileStatus) {
                oldFileStatus.name = fs.name;
                oldFileStatus.metadata = fs.metadata;
                oldFileStatus.startDate = fs.startDate;
                oldFileStatus.status = fs.status;
            } else this.filesStatus.push(fs);
        });

        this.onFilesStatusUpdated.next(this.filesStatus);
    }


    //#region Send_xxx_Request

    sendConvertRequest(request: string): void {
        this.apiService.requestConvert(request)
            .subscribe(
                () => this.sendUpdateRequest(),
                response => {
                    console.error(response.error);
                    alert(response.error.message);
                }
            );
    }

    sendUpdateRequest(): Observable<FileStatus[]> { return this.apiService.getAllFileStatus(); }

    async sendDownloadRequest(id: string) {
        await this.loadingService.showDialog("Downloading file..");

        this.apiService.downloadFile(id)
            .subscribe(
                async (response: HttpResponse<any>) => {
                    await this.loadingService.showDialog("Saving file as " + response.headers.get('FileName'));

                    this.handleBlobDownload(response.body, response.headers.get('FileName'), 'audio/mpeg')
                        .then(
                            success => {
                                this.loadingService.dismissDialog();
                                console.log('Successfully saved file');
                            },
                            error => {
                                this.loadingService.dismissDialog();
                                alert(`Error ${error.status} when saving file: ${error.statusText}`);
                            }
                        );
                },
                error => {
                    this.loadingService.dismissDialog();
                    alert(`Error ${error.status} when downloading file: ${error.statusText}`);
                    if (error.error instanceof Blob) YTDLUtils.parseErrorBlob(error.error).subscribe(e => alert(e.message));
                }
            );
    }

    async sendDownloadAsZipRequest(ids: string[], createPlaylist: boolean, filePath: string) {
        await this.loadingService.showDialog("Downloading file..");

        this.apiService.downloadFilesAsZip(ids, createPlaylist, filePath)
            .subscribe(
                async (response: HttpResponse<any>) => {
                    await this.loadingService.showDialog("Saving file as yt-audio-dl.zip");

                    this.handleBlobDownload(response.body, 'yt-audio-dl.zip', 'application/zip')
                        .then(
                            success => {
                                this.loadingService.dismissDialog();
                                console.log('Successfully saved file');
                            },
                            error => {
                                this.loadingService.dismissDialog();
                                alert(`Error ${error.status} when saving file: ${error.statusText}`);
                            }
                        );
                },
                error => {
                    this.loadingService.dismissDialog();
                    alert(`Error ${error.status} when downloading file: ${error.statusText}`);
                    if (error.error instanceof Blob) YTDLUtils.parseErrorBlob(error.error).subscribe(e => alert(e.message));
                }
            );
    }

    sendDeleteRequest(ids: string[]): void {
        this.apiService.deleteFiles(ids)
            .subscribe(
                (result: boolean) => {
                    if (!result) alert("An error occurred while trying to delete files, some files may not have been deleted");
                },
                error => {
                    alert("An error occurred while trying to delete files");
                    console.error(error);
                })
    }

    sendTagRequest(id: string, name: string, metadata: Mp3Metadata): void {
        this.apiService.setTags(id, name, metadata).subscribe();
    }

    // #endregion

    handleBlobDownload(blob: Blob, filename: string, mimeType: 'audio/mpeg' | 'application/zip'): Promise<any> {
        // It is necessary to create a new blob object with mime-type explicitly set
        // otherwise only Chrome works like it should
        const newBlob = new Blob([blob], {type: mimeType});

        if (this.platform.is('android')) {
            return this.fileTransferService.writeBlobToStorage(newBlob, filename);
        } else {
            YTDLUtils.saveBlobToStorage(newBlob, filename);
            return new Promise(r => r());
        }
    }
}
