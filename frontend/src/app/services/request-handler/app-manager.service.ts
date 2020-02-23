import {Injectable} from '@angular/core';
import {YTDLUtils} from "../../utils/ytdl-utils";
import {Mp3Metadata} from "../../model/mp3metadata.model";
import {APIService} from "../api/api.service";
import {interval, Observable, Subject, Subscription} from "rxjs";
import {flatMap} from "rxjs/operators";
import {FileStatus} from "../../model/filestatus.model";
import {SettingsService} from "../settings/settings.service";
import {AppManagerModule} from "./app-manager.module";

@Injectable({providedIn: AppManagerModule})
export class AppManager {

    filesStatus: FileStatus[] = [];
    onFilesStatusUpdated: Subject<FileStatus[]> = new Subject<FileStatus[]>();

    refreshRate: number = 3000;
    isServerOn: boolean = false;

    isAutoUpdateRunning: boolean = false;
    autoUpdateObservable: Subscription;

    constructor(private apiService: APIService,
                private settingsService: SettingsService) {

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

    sendDownloadRequest(id: string): void {
        this.apiService.downloadFile(id)
            .subscribe(
                response => YTDLUtils.saveBlobToStorage(response.body, response.headers.get('FileName'), 'audio/mpeg'),
                response => YTDLUtils.parseErrorBlob(response).subscribe(e => alert(e.message))
            );
    }

    sendDownloadAsZipRequest(ids: string[], createPlaylist: boolean, filePath: string): void {
        this.apiService.downloadFilesAsZip(ids, createPlaylist, filePath)
            .subscribe(
                response => YTDLUtils.saveBlobToStorage(response.body, 'yt-audio-dl.zip', 'application/zip'),
                response => YTDLUtils.parseErrorBlob(response)
                    .subscribe(e => alert(e.message))
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
}
